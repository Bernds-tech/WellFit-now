# WellFit staging server deployment runbook

## Status and scope

This runbook prepares one Ubuntu 24.04 server as a **staging deployment target** for `Bernds-tech/WellFit-now`.

It does not authorize Firebase production writes, public token/NFT/payment functions, child-data production processing, App Check enforcement, or a public production launch. The current Dallas VPS should be treated as staging until a separate production-region, privacy, monitoring and backup decision is approved.

The server shown by the owner has 1 vCPU, 1 GB RAM and 25 GB storage. Builds therefore run in GitHub Actions; the server only verifies, loads and starts a prebuilt Docker image.

## Deployment architecture

1. A human starts the protected `Deploy WellFit Staging` GitHub Actions workflow.
2. GitHub validates the source with Node 24 LTS, lint, TypeScript and Firebase Functions checks.
3. GitHub builds the existing standalone Next.js Docker image with the staging Firebase web configuration.
4. GitHub starts the image locally and verifies `/api/health` and the release SHA.
5. The image is compressed, checksummed and transferred over SSH.
6. The server verifies the SHA-256 checksum.
7. A root-owned deployment script starts a hardened candidate container on `127.0.0.1:3001`.
8. Only a healthy candidate replaces the active container on `127.0.0.1:3000`.
9. Nginx exposes the app on port 80 and later 443. The Docker ports remain bound to localhost.
10. If cutover fails, the deployment script attempts to restore the previous image automatically.

## 1. Generate a dedicated deployment key

Generate a new key on the owner's trusted computer. Do not reuse a personal SSH key.

```bash
ssh-keygen -t ed25519 -C "wellfit-github-actions-staging" -f wellfit_staging_deploy
```

This creates:

- `wellfit_staging_deploy`: private key; store only as the GitHub environment secret `SERVER_SSH_KEY`.
- `wellfit_staging_deploy.pub`: public key; install on the server.

Never paste the private key into chat, a GitHub issue, source code, documentation or a normal environment file.

## 2. Prepare Ubuntu from the provider console

Use the provider VNC console or an existing trusted root SSH session.

### Update the operating system and install base packages

```bash
sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt full-upgrade -y
sudo apt install -y ca-certificates curl gnupg git nginx ufw fail2ban
sudo systemctl enable --now nginx fail2ban
```

### Add a 2 GB swap file

The server has only 1 GB RAM. The application build is off-server, but swap provides a safety margin during image loading and runtime peaks.

```bash
if ! sudo swapon --show | grep -q '/swapfile'; then
  if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
  fi
  sudo swapon /swapfile
fi

grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Install Docker Engine from Docker's Ubuntu repository

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run --rm hello-world
```

The WellFit container is published only on `127.0.0.1`, not on a public Docker port.

## 3. Create the restricted deployment account

```bash
sudo adduser --disabled-password --gecos "" wellfit-deploy
sudo install -d -m 0700 -o wellfit-deploy -g wellfit-deploy /home/wellfit-deploy/.ssh
sudo install -m 0600 -o wellfit-deploy -g wellfit-deploy /dev/null /home/wellfit-deploy/.ssh/authorized_keys
```

Append the contents of `wellfit_staging_deploy.pub` to the server file:

```bash
sudo nano /home/wellfit-deploy/.ssh/authorized_keys
```

Confirm ownership and permissions:

```bash
sudo chown -R wellfit-deploy:wellfit-deploy /home/wellfit-deploy/.ssh
sudo chmod 0700 /home/wellfit-deploy/.ssh
sudo chmod 0600 /home/wellfit-deploy/.ssh/authorized_keys
```

Test the key from the trusted computer before disabling any password or root login method:

```bash
ssh -i ./wellfit_staging_deploy -p 22 wellfit-deploy@SERVER_IP
```

## 4. Install the root-owned WellFit deployment components

After this pull request is merged, run:

```bash
rm -rf /tmp/wellfit-server-bootstrap
git clone --depth 1 https://github.com/Bernds-tech/WellFit-now.git /tmp/wellfit-server-bootstrap

sudo install -m 0755 \
  /tmp/wellfit-server-bootstrap/infra/server/deploy-wellfit.sh \
  /usr/local/sbin/deploy-wellfit

sudo install -m 0644 \
  /tmp/wellfit-server-bootstrap/infra/server/nginx-wellfit.conf \
  /etc/nginx/sites-available/wellfit

sudo ln -sfn /etc/nginx/sites-available/wellfit /etc/nginx/sites-enabled/wellfit
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Allow the deployment account to run only the validated root-owned deployment command:

```bash
echo 'wellfit-deploy ALL=(root) NOPASSWD: /usr/local/sbin/deploy-wellfit *' \
  | sudo tee /etc/sudoers.d/wellfit-deploy >/dev/null
sudo chmod 0440 /etc/sudoers.d/wellfit-deploy
sudo visudo -cf /etc/sudoers.d/wellfit-deploy
```

The account is intentionally not added to the `docker` group because Docker group membership is effectively root-equivalent.

## 5. Create the server-only runtime environment

```bash
sudo install -d -m 0750 -o root -g root /etc/wellfit
sudo install -m 0600 -o root -g root /dev/null /etc/wellfit/wellfit-web.env
sudo nano /etc/wellfit/wellfit-web.env
```

Initial staging contents:

```dotenv
BUDDY_KI_MODEL_PROVIDER_ENABLED=false
BUDDY_KI_PROVIDER=rules
# OPENAI_API_KEY is intentionally omitted until a separate server-side provider rollout.
```

Do not place Firebase Admin credentials, service-account JSON, database passwords or private provider keys in GitHub source files. Public Firebase web configuration is provided to the image build through protected GitHub environment secrets.

## 6. Configure the firewall

Set the actual SSH port before enabling UFW. The default is usually `22`.

```bash
SSH_PORT=22
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow "${SSH_PORT}/tcp"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Do not expose ports `3000` or `3001`; both are localhost-only behind Nginx.

Only after the dedicated key login has been tested successfully should password login and direct root login be disabled in a separate SSH hardening step.

## 7. Record the server SSH host identity

GitHub Actions must not trust a newly scanned host key during each deployment. Read the Ed25519 host key directly from the provider console:

```bash
sudo cat /etc/ssh/ssh_host_ed25519_key.pub
sudo ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Create the `SERVER_KNOWN_HOSTS` value using the server IP, SSH port and the public host-key fields. For port 22, this format is valid:

```text
SERVER_IP ssh-ed25519 BASE64_PUBLIC_HOST_KEY
```

For a non-default port:

```text
[SERVER_IP]:SSH_PORT ssh-ed25519 BASE64_PUBLIC_HOST_KEY
```

Verify the fingerprint from the provider console before saving the value in GitHub.

## 8. Configure the GitHub staging environment

In `Bernds-tech/WellFit-now` open:

`Settings -> Environments -> New environment -> staging`

Recommended protection:

- required reviewer: repository owner;
- deployment branch: `main` only;
- prevent self-review when another trusted reviewer becomes available.

Add these **environment secrets**:

| Secret | Value |
|---|---|
| `SERVER_HOST` | server IPv4 address or deployment hostname |
| `SERVER_PORT` | SSH port, usually `22` |
| `SERVER_USER` | `wellfit-deploy` |
| `SERVER_SSH_KEY` | complete private deployment key including BEGIN/END lines |
| `SERVER_KNOWN_HOSTS` | verified host-key line from the previous section |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | staging Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | staging Firebase auth domain without protocol |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | staging Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | staging Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | staging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | staging Firebase web app ID |
| `NEXT_PUBLIC_FIREBASE_APPCHECK_RECAPTCHA_ENTERPRISE_KEY` | optional; leave absent until the staged rollout is approved |

The deployment workflow is manual by design. It does not deploy every push to `main` until the first staging cycle, monitoring and rollback procedure are verified.

## 9. Run the first deployment

Open:

`Actions -> Deploy WellFit Staging -> Run workflow`

Select `staging` and approve the environment deployment when prompted.

The workflow must pass all of the following before activation:

- runtime environment validation;
- `npm ci`;
- ESLint;
- TypeScript;
- Firebase Functions check;
- Docker build;
- local hardened-container health check;
- image checksum verification on the server;
- server candidate health check;
- active-container health check.

## 10. Verify the deployment

From a trusted computer:

```bash
curl --fail http://SERVER_IP/api/health
```

On the server:

```bash
sudo docker ps
sudo docker logs --tail 100 wellfit-web
curl --fail http://127.0.0.1:3000/api/health
sudo nginx -t
sudo systemctl status nginx docker --no-pager
free -h
df -h
```

The health response must identify `wellfit-web`, report `status: ok`, and show the exact GitHub commit SHA deployed by the workflow.

## 11. Add a domain and HTTPS

Do this only after the HTTP staging deployment is healthy:

1. Point the chosen staging hostname to the server IPv4 address.
2. Replace `server_name _;` in `/etc/nginx/sites-available/wellfit` with the hostname.
3. Install Certbot and request a certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d STAGING_HOSTNAME
sudo certbot renew --dry-run
```

Use a dedicated staging hostname rather than the final public production hostname while the product is not production-authorized.

## 12. Post-activation repository update

After the first successful deployment and external health verification, create a small follow-up pull request that updates:

- `README.md` operating mode;
- `docs/operations/GITHUB_ONLY_DEVELOPMENT_STATUS.md`;
- `docs/status/WELLFIT_RUNTIME_STATE_2026-07-24.md` or its dated successor.

Record the server as a staging runtime only, including monitoring, backup and privacy limitations. Do not mark the application production-ready merely because the web container is online.
