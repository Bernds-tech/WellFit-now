using UnityEngine;

public class BuddyAbilityController : MonoBehaviour
{
    [SerializeField] private BuddyNavigationController navigationController;
    [SerializeField] private WellFitNativeBridge bridge;

    public bool canClimbUp = false;
    public bool canJumpBoost = false;
    public bool canFetchClue = false;
    public bool canScanObject = false;
    public bool canCarry = false;

    void Awake()
    {
        if (navigationController == null)
        {
            navigationController = GetComponent<BuddyNavigationController>();
        }
    }

    public void TryClimbUp(Vector3 targetPosition)
    {
        if (!canClimbUp)
        {
            Reject("climbUp");
            return;
        }

        navigationController?.JumpTo(targetPosition);
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"climbUp\",\"capabilityId\":\"climbUp\"}"
        );
    }

    public void TryJumpBoost(Vector3 targetPosition)
    {
        if (!canJumpBoost)
        {
            Reject("jumpBoost");
            return;
        }

        navigationController?.JumpTo(targetPosition);
        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"jumpBoost\",\"capabilityId\":\"jumpBoost\"}"
        );
    }

    public void TryFetchClue(string markerId)
    {
        if (!canFetchClue)
        {
            Reject("fetchClue");
            return;
        }

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

        bridge?.SendEventToWellFit(
            "onBuddyActionStarted",
            "{\"action\":\"scanObject\",\"capabilityId\":\"scanObject\",\"markerId\":\"" + markerId + "\"}"
        );
    }

    private void Reject(string capabilityId)
    {
        bridge?.SendEventToWellFit(
            "onBuddyActionRejected",
            "{\"reason\":\"capability-missing\",\"capabilityId\":\"" + capabilityId + "\"}"
        );
    }
}