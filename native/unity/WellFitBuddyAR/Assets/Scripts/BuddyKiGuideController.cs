using UnityEngine;

public class BuddyKiGuideController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyDialogueEventBridge dialogueBridge;

    private string currentMissionId = "none";
    private string currentReason = "none";

    public void SuggestNextMission(string missionId, string reason)
    {
        currentMissionId = string.IsNullOrEmpty(missionId) ? "demo_ar_walk_001" : missionId;
        currentReason = string.IsNullOrEmpty(reason) ? "backend-suggested" : reason;

        bridge?.SendEventToWellFit(
            "onBuddyMissionSuggested",
            "{\"missionId\":\"" + currentMissionId + "\",\"reason\":\"" + currentReason + "\",\"rewardStatus\":\"preview-only\"}"
        );

        dialogueBridge?.ShowDialogue(
            "mission.start.suggestion",
            "Ich habe eine passende AR-Mission fuer dich gefunden."
        );
    }

    public void ExplainMissingCapability(string capabilityId)
    {
        string safeCapabilityId = string.IsNullOrEmpty(capabilityId) ? "unknown" : capabilityId;

        bridge?.SendEventToWellFit(
            "onBuddyCapabilityNeeded",
            "{\"capabilityId\":\"" + safeCapabilityId + "\",\"reason\":\"capability-needed\"}"
        );

        dialogueBridge?.ShowDialogue(
            "capability.needed",
            "Dafuer brauche ich spaeter die passende Ausruestung."
        );
    }

    public void ClearGuide()
    {
        currentMissionId = "none";
        currentReason = "none";

        bridge?.SendEventToWellFit(
            "onBuddyContextUpdated",
            "{\"status\":\"guide-cleared\",\"rewardStatus\":\"preview-only\"}"
        );
    }
}