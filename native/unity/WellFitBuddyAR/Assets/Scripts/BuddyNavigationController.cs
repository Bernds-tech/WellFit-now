using UnityEngine;

public class BuddyNavigationController : MonoBehaviour
{
    public Transform buddyRoot;
    public float walkSpeed = 0.45f;
    public float jumpDuration = 0.55f;
    public float jumpHeight = 0.22f;
    public float reachedDistanceMeters = 0.02f;

    [Header("Movement Limits")]
    public float maxWalkDistanceMeters = 3f;
    public float maxJumpHeightDifferenceMeters = 0.45f;

    private WellFitNativeBridge bridge;
    private Vector3 targetPosition;
    private bool isWalking;
    private bool isJumping;
    private float jumpTimer;
    private Vector3 jumpStart;
    private Vector3 jumpEnd;
    private string targetSurfaceId = "unknown";
    private string currentAction = "idle";

    public bool IsMoving => isWalking || isJumping;
    public string CurrentAction => currentAction;
    public string TargetSurfaceId => targetSurfaceId;

    void Awake()
    {
        if (buddyRoot == null)
        {
            buddyRoot = transform;
        }

        targetPosition = buddyRoot.position;
    }

    void Update()
    {
        if (isJumping)
        {
            UpdateJump();
            return;
        }

        if (isWalking)
        {
            UpdateWalk();
        }
    }

    public void SetBridge(WellFitNativeBridge nativeBridge)
    {
        bridge = nativeBridge;
    }

    public void SetTargetSurfaceId(string surfaceId)
    {
        targetSurfaceId = string.IsNullOrEmpty(surfaceId) ? "unknown" : surfaceId;
    }

    public bool CanNavigateTo(Vector3 worldPosition, bool allowJump, out string reason)
    {
        reason = string.Empty;

        if (buddyRoot == null)
        {
            reason = "buddy-root-missing";
            return false;
        }

        if (IsMoving)
        {
            reason = "buddy-already-moving";
            return false;
        }

        float horizontalDistance = HorizontalDistance(buddyRoot.position, worldPosition);
        if (horizontalDistance > maxWalkDistanceMeters)
        {
            reason = "target-too-far";
            return false;
        }

        float heightDifference = Mathf.Abs(worldPosition.y - buddyRoot.position.y);
        if (heightDifference > maxJumpHeightDifferenceMeters)
        {
            reason = allowJump ? "height-too-large" : "jump-not-allowed";
            return false;
        }

        return true;
    }

    public bool WalkTo(Vector3 worldPosition)
    {
        return WalkTo(worldPosition, "walkToSurface");
    }

    public bool WalkTo(Vector3 worldPosition, string action)
    {
        if (!CanNavigateTo(worldPosition, false, out string reason))
        {
            SendRejected(action, reason);
            return false;
        }

        targetPosition = worldPosition;
        isWalking = true;
        isJumping = false;
        currentAction = string.IsNullOrEmpty(action) ? "walkToSurface" : action;
        return true;
    }

    public bool JumpTo(Vector3 worldPosition)
    {
        return JumpTo(worldPosition, "jumpToSurface");
    }

    public bool JumpTo(Vector3 worldPosition, string action)
    {
        if (!CanNavigateTo(worldPosition, true, out string reason))
        {
            SendRejected(action, reason);
            return false;
        }

        jumpStart = buddyRoot.position;
        jumpEnd = worldPosition;
        jumpTimer = 0f;
        isWalking = false;
        isJumping = true;
        currentAction = string.IsNullOrEmpty(action) ? "jumpToSurface" : action;
        return true;
    }

    public void Stop(string reason = "stopped")
    {
        isWalking = false;
        isJumping = false;
        SendRejected(currentAction, reason);
        currentAction = "idle";
    }

    private void UpdateWalk()
    {
        Vector3 current = buddyRoot.position;
        Vector3 next = Vector3.MoveTowards(current, targetPosition, walkSpeed * Time.deltaTime);
        buddyRoot.position = next;

        Vector3 direction = targetPosition - current;
        direction.y = 0f;

        if (direction.sqrMagnitude > 0.001f)
        {
            buddyRoot.rotation = Quaternion.Slerp(
                buddyRoot.rotation,
                Quaternion.LookRotation(direction.normalized, Vector3.up),
                Time.deltaTime * 8f
            );
        }

        if (Vector3.Distance(next, targetPosition) <= reachedDistanceMeters)
        {
            buddyRoot.position = targetPosition;
            isWalking = false;
            SendReachedEvents();
        }
    }

    private void UpdateJump()
    {
        jumpTimer += Time.deltaTime;
        float t = Mathf.Clamp01(jumpTimer / Mathf.Max(0.01f, jumpDuration));
        Vector3 flatPosition = Vector3.Lerp(jumpStart, jumpEnd, t);
        float arc = Mathf.Sin(t * Mathf.PI) * jumpHeight;
        buddyRoot.position = flatPosition + Vector3.up * arc;

        Vector3 direction = jumpEnd - jumpStart;
        direction.y = 0f;

        if (direction.sqrMagnitude > 0.001f)
        {
            buddyRoot.rotation = Quaternion.Slerp(
                buddyRoot.rotation,
                Quaternion.LookRotation(direction.normalized, Vector3.up),
                Time.deltaTime * 8f
            );
        }

        if (t >= 1f)
        {
            isJumping = false;
            buddyRoot.position = jumpEnd;
            SendReachedEvents();
        }
    }

    private void SendReachedEvents()
    {
        bridge?.SendEventToWellFit(
            "onBuddyReachedSurface",
            "{\"surfaceId\":\"" + targetSurfaceId + "\"}"
        );

        bridge?.SendEventToWellFit(
            "onBuddyActionCompleted",
            "{\"action\":\"" + currentAction + "\",\"surfaceId\":\"" + targetSurfaceId + "\",\"status\":\"completed\"}"
        );

        currentAction = "idle";
    }

    private void SendRejected(string action, string reason)
    {
        bridge?.SendEventToWellFit(
            "onBuddyActionRejected",
            "{\"action\":\"" + (string.IsNullOrEmpty(action) ? "move" : action) + "\",\"surfaceId\":\"" + targetSurfaceId + "\",\"reason\":\"" + reason + "\"}"
        );
    }

    private float HorizontalDistance(Vector3 a, Vector3 b)
    {
        a.y = 0f;
        b.y = 0f;
        return Vector3.Distance(a, b);
    }
}
