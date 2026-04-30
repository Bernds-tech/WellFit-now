using UnityEngine;

public class BuddyKiGuideController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyDialogueEventBridge dialogueBridge;

    private string currentMissionId = "none";
    private string currentReason = "none";
    private string lastGuideEvent = "none";
    private int guideEventCount;

    public string CurrentMissionId => currentMissionId;
    public string CurrentReason => currentReason;
    public string LastGuideEvent => lastGuideEvent;
    public int GuideEventCount => guideEventCount;

    public void SuggestNextMission(string missionId, string reason)
    {
        currentMissionId = string.IsNullOrEmpty(missionId) ? "demo_ar_walk_001" : missionId;
        currentReason = string.IsNullOrEmpty(reason) ? "backend-suggested" : reason;
        MarkGuideEvent("mission-suggested");

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
        MarkGuideEvent("capability-needed:" + safeCapabilityId);

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
        MarkGuideEvent("guide-cleared");

        bridge?.SendEventToWellFit(
            "onBuddyContextUpdated",
            "{\"status\":\"guide-cleared\",\"rewardStatus\":\"preview-only\"}"
        );
    }

    public void ResetDiagnostics()
    {
        lastGuideEvent = "none";
        guideEventCount = 0;
    }

    public string BuildDiagnosticsLabel()
    {
        return "Guide=" + lastGuideEvent
            + " | Mission=" + currentMissionId
            + " | Reason=" + currentReason
            + " | Count=" + guideEventCount;
    }

    private void MarkGuideEvent(string eventName)
    {
        lastGuideEvent = string.IsNullOrEmpty(eventName) ? "unknown" : eventName;
        guideEventCount += 1;
    }
}