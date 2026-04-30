using UnityEngine;

public class BuddyAbilityController : MonoBehaviour
{
    [SerializeField] private BuddyNavigationController navigationController;
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private float debugClimbHeightMeters = 0.18f;
    [SerializeField] private float debugJumpForwardMeters = 0.35f;

    public bool canClimbUp = false;
    public bool canJumpBoost = false;
    public bool canFetchClue = false;
    public bool canScanObject = false;
    public bool canCarry = false;
    public bool canPointAtObject = false;

    private string lastAbilityEvent = "none";
    private string lastRejectedCapability = "none";
    private int abilityStartedCount;
    private int abilityRejectedCount;

    public string LastAbilityEvent => lastAbilityEvent;
    public string LastRejectedCapability => lastRejectedCapability;
    public int AbilityStartedCount => abilityStartedCount;
    public int AbilityRejectedCount => abilityRejectedCount;

    void Awake()
    {
        if (navigationController == null)
        {
            navigationController = GetComponent<BuddyNavigationController>();
        }
    }

    public void SetDemoCapabilities(bool enabled)
    {
        canClimbUp = enabled;
        canJumpBoost = enabled;
        canFetchClue = enabled;
        canScanObject = enabled;
        canCarry = enabled;
        canPointAtObject = enabled;
        lastAbilityEvent = enabled ? "demo-capabilities-on" : "demo-capabilities-off";
    }

    public void ToggleDemoCapabilities()
    {
        bool enabled = !(canClimbUp && canJumpBoost && canFetchClue && canScanObject && canCarry && canPointAtObject);
        SetDemoCapabilities(enabled);
    }

    public void ResetDiagnostics()
    {
        lastAbilityEvent = "none";
        lastRejectedCapability = "none";
        abilityStartedCount = 0;
        abilityRejectedCount = 0;
    }

    public string BuildDiagnosticsLabel()
    {
        return "Abilities=" + (canClimbUp || canJumpBoost || canFetchClue || canScanObject || canCarry || canPointAtObject ? "some" : "none")
            + " | climb=" + canClimbUp
            + " | jump=" + canJumpBoost
            + " | scan=" + canScanObject
            + " | fetch=" + canFetchClue
            + " | carry=" + canCarry
            + " | point=" + canPointAtObject
            + " | start=" + abilityStartedCount
            + " | reject=" + abilityRejectedCount
            + " | last=" + lastAbilityEvent
            + " | denied=" + lastRejectedCapability;
    }

    public void TestClimbUpNearBuddy()
    {
        Vector3 target = transform.position + Vector3.up * debugClimbHeightMeters;
        TryClimbUp(target);
    }

    public void TestJumpBoostNearBuddy()
    {
        Vector3 target = transform.position + transform.forward * debugJumpForwardMeters + Vector3.up * debugClimbHeightMeters;
        TryJumpBoost(target);
    }

    public void TryClimbUp(Vector3 targetPosition)
    {
        if (!canClimbUp)
        {
            Reject("climbUp");
            return;
        }

        bool started = navigationController != null && navigationController.JumpTo(targetPosition, "climbUp");
        if (started)
        {
            MarkStarted("climbUp");
            bridge?.SendEventToWellFit(
                "onBuddyActionStarted",
                "{\"action\":\"climbUp\",\"capabilityId\":\"climbUp\"}"
            );
        }
    }

    public void TryJumpBoost(Vector3 targetPosition)
    {
        if (!canJumpBoost)
        {
            Reject("jumpBoost");
            return;
        }

        bool started = navigationController != null && navigationController.JumpTo(targetPosition, "jumpBoost");
        if (started)
        {
            MarkStarted("jumpBoost");
            bridge?.SendEventToWellFit(
                "onBuddyActionStarted",
                "{\"action\":\"jumpBoost\",\"capabilityId\":\"jumpBoost\"}"
            );
        }
    }

    public void TryFetchClue(string markerId)
    {
        if (!canFetchClue)
        {
            Reject("fetchClue");
            return;
        }

        MarkStarted("fetchClue");
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"fetchClue\",\"capabilityId\":\"fetchClue\",\"markerId\":\"" + markerId + "\"}"
        );
    }

    public void TryScanObject(string markerId)
    {
        if (!canScanObject)
        {
            Reject("scanObject");
            return;
        }

        MarkStarted("scanObject");
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"scanObject\",\"capabilityId\":\"scanObject\",\"markerId\":\"" + markerId + "\"}"
        );
    }

    public void TryCarry(string markerId)
    {
        if (!canCarry)
        {
            Reject("carry");
            return;
        }

        MarkStarted("carry");
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"carry\",\"capabilityId\":\"carry\",\"markerId\":\"" + markerId + "\"}"
        );
    }

    public void TryPointAtObject(string markerId)
    {
        if (!canPointAtObject)
        {
            Reject("pointAtObject");
            return;
        }

        MarkStarted("pointAtObject");
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"pointAtObject\",\"capabilityId\":\"pointAtObject\",\"markerId\":\"" + markerId + "\"}"
        );
    }

    private void MarkStarted(string capabilityId)
    {
        abilityStartedCount += 1;
        lastAbilityEvent = capabilityId;
        lastRejectedCapability = "none";
    }

    private void Reject(string capabilityId)
    {
        abilityRejectedCount += 1;
        lastRejectedCapability = capabilityId;
        lastAbilityEvent = "rejected";
        bridge?.SendEventToWellFit(
            "onBuddyActionRejected",
            "{\"reason\":\"capability-missing\",\"capabilityId\":\"" + capabilityId + "\"}"
        );
    }
}