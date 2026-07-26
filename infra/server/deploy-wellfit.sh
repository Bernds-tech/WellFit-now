#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="wellfit-web"
IMAGE_REPOSITORY="wellfit-web"
ENV_FILE="/etc/wellfit/wellfit-web.env"
ACTIVE_PORT="3000"
CANDIDATE_PORT="3001"

ARCHIVE="${1:-}"
RELEASE_SHA="${2:-}"
RELEASE_CHANNEL="${3:-staging}"

fail() {
  echo "WellFit deployment failed: $*" >&2
  exit 1
}

for command_name in docker curl gzip grep awk; do
  command -v "$command_name" >/dev/null 2>&1 || fail "missing command: $command_name"
done

[[ "$RELEASE_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "release SHA must be a full 40-character Git commit SHA"
[[ "$RELEASE_CHANNEL" =~ ^[a-z0-9][a-z0-9._-]{0,63}$ ]] || fail "invalid release channel"
EXPECTED_ARCHIVE="/tmp/wellfit-web-${RELEASE_SHA}.tar.gz"
[[ "$ARCHIVE" == "$EXPECTED_ARCHIVE" ]] || fail "archive path must be $EXPECTED_ARCHIVE"
[[ -f "$ARCHIVE" ]] || fail "release archive not found"
[[ -r "$ENV_FILE" ]] || fail "runtime environment file is missing or unreadable: $ENV_FILE"

IMAGE_TAG="${IMAGE_REPOSITORY}:${RELEASE_SHA}"
CANDIDATE_NAME="${APP_NAME}-candidate"

container_env_value() {
  local container_name="$1"
  local key="$2"
  docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$container_name" 2>/dev/null \
    | awk -F= -v wanted="$key" '$1 == wanted {sub(/^[^=]*=/, ""); print; exit}'
}

run_container() {
  local name="$1"
  local host_port="$2"
  local image="$3"
  local sha="$4"
  local channel="$5"
  local restart_policy="$6"

  docker run --detach \
    --name "$name" \
    --restart "$restart_policy" \
    --publish "127.0.0.1:${host_port}:3000" \
    --read-only \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    --tmpfs /app/.next/cache:rw,noexec,nosuid,size=128m \
    --cap-drop ALL \
    --security-opt no-new-privileges \
    --pids-limit 256 \
    --memory 700m \
    --memory-swap 1g \
    --cpus 0.90 \
    --log-opt max-size=10m \
    --log-opt max-file=3 \
    --env-file "$ENV_FILE" \
    --env WELLFIT_RUNTIME_MODE=production \
    --env WELLFIT_RELEASE_SHA="$sha" \
    --env WELLFIT_RELEASE_CHANNEL="$channel" \
    --env HOSTNAME=0.0.0.0 \
    --env PORT=3000 \
    --label com.wellfit.runtime=true \
    --label "com.wellfit.release.sha=$sha" \
    "$image"
}

wait_for_health() {
  local port="$1"
  local expected_sha="$2"
  local body=""

  for _attempt in $(seq 1 40); do
    if body="$(curl --silent --show-error --fail --max-time 3 "http://127.0.0.1:${port}/api/health" 2>/dev/null)"; then
      if grep -Fq '"status":"ok"' <<<"$body"; then
        if [[ "$expected_sha" == "unknown" ]] || grep -Fq "\"sha\":\"${expected_sha}\"" <<<"$body"; then
          return 0
        fi
      fi
    fi
    sleep 1
  done

  echo "Last health response: ${body:-<none>}" >&2
  return 1
}

previous_image=""
previous_sha="unknown"
previous_channel="rollback"
if docker container inspect "$APP_NAME" >/dev/null 2>&1; then
  previous_image="$(docker inspect --format '{{.Config.Image}}' "$APP_NAME")"
  previous_sha="$(container_env_value "$APP_NAME" WELLFIT_RELEASE_SHA || true)"
  previous_channel="$(container_env_value "$APP_NAME" WELLFIT_RELEASE_CHANNEL || true)"
  previous_sha="${previous_sha:-unknown}"
  previous_channel="${previous_channel:-rollback}"
  docker tag "$previous_image" "${IMAGE_REPOSITORY}:rollback"
fi

rollback_previous_release() {
  if [[ -z "$previous_image" ]] || ! docker image inspect "$previous_image" >/dev/null 2>&1; then
    echo "No previous WellFit image is available for rollback." >&2
    return 1
  fi

  echo "Rolling back to ${previous_image}." >&2
  docker rm --force "$APP_NAME" >/dev/null 2>&1 || true
  run_container "$APP_NAME" "$ACTIVE_PORT" "$previous_image" "$previous_sha" "$previous_channel" unless-stopped >/dev/null
  wait_for_health "$ACTIVE_PORT" "$previous_sha"
}

cleanup_candidate() {
  docker rm --force "$CANDIDATE_NAME" >/dev/null 2>&1 || true
}
trap cleanup_candidate EXIT

cleanup_candidate
echo "Loading release image ${IMAGE_TAG}."
gzip --decompress --stdout "$ARCHIVE" | docker load >/dev/null
docker image inspect "$IMAGE_TAG" >/dev/null 2>&1 || fail "loaded archive does not contain $IMAGE_TAG"

run_container "$CANDIDATE_NAME" "$CANDIDATE_PORT" "$IMAGE_TAG" "$RELEASE_SHA" "$RELEASE_CHANNEL" no >/dev/null
if ! wait_for_health "$CANDIDATE_PORT" "$RELEASE_SHA"; then
  docker logs --tail 200 "$CANDIDATE_NAME" >&2 || true
  fail "candidate health check failed"
fi
cleanup_candidate

if docker container inspect "$APP_NAME" >/dev/null 2>&1; then
  docker rm --force "$APP_NAME" >/dev/null
fi

if ! run_container "$APP_NAME" "$ACTIVE_PORT" "$IMAGE_TAG" "$RELEASE_SHA" "$RELEASE_CHANNEL" unless-stopped >/dev/null; then
  rollback_previous_release || true
  fail "new active container could not be started"
fi

if ! wait_for_health "$ACTIVE_PORT" "$RELEASE_SHA"; then
  docker logs --tail 200 "$APP_NAME" >&2 || true
  rollback_previous_release || true
  fail "new active release failed its health check"
fi

docker tag "$IMAGE_TAG" "${IMAGE_REPOSITORY}:current"
rm -f "$ARCHIVE"

current_id="$(docker image inspect --format '{{.Id}}' "${IMAGE_REPOSITORY}:current")"
rollback_id=""
if docker image inspect "${IMAGE_REPOSITORY}:rollback" >/dev/null 2>&1; then
  rollback_id="$(docker image inspect --format '{{.Id}}' "${IMAGE_REPOSITORY}:rollback")"
fi

while IFS= read -r image_ref; do
  [[ -n "$image_ref" ]] || continue
  image_id="$(docker image inspect --format '{{.Id}}' "$image_ref" 2>/dev/null || true)"
  if [[ "$image_id" != "$current_id" && "$image_id" != "$rollback_id" ]]; then
    docker image rm "$image_ref" >/dev/null 2>&1 || true
  fi
done < <(docker images "$IMAGE_REPOSITORY" --format '{{.Repository}}:{{.Tag}}')

docker image prune --force >/dev/null || true

echo "WellFit release ${RELEASE_SHA} is healthy on 127.0.0.1:${ACTIVE_PORT}."
