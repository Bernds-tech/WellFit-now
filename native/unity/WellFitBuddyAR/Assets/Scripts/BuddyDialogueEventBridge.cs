using UnityEngine;

public class BuddyDialogueEventBridge : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;

    public void ShowDialogue(string messageKey, string text)
    {
        string safeMessageKey = string.IsNullOrEmpty(messageKey) ? "dialogue.unknown" : messageKey;
        string safeText = string.IsNullOrEmpty(text) ? "" : text.Replace("\"", "'");

        bridge?.SendEventToWellFit(
            "onBuddyDialogueShown",
            "{\"messageKey\":\"" + safeMessageKey + "\",\"text\":\"" + safeText + "\"}"
        );
    }

    public void CompleteDialogue(string messageKey)
    {
        string safeMessageKey = string.IsNullOrEmpty(messageKey) ? "dialogue.unknown" : messageKey;

        bridge?.SendEventToWellFit(
            "onBuddyDialogueCompleted",
            "{\"messageKey\":\"" + safeMessageKey + "\",\"status\":\"completed\"}"
        );
    }
}