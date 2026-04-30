using UnityEngine;

public class WellFitNativeBridge : MonoBehaviour
{
    [SerializeField] private BuddyAnchorController buddyAnchorController;
    [SerializeField] private BuddyInputController buddyInputController;
    [SerializeField] private BuddyKiGuideController buddyKiGuideController;

    private string lastEventName = "none";
    private string lastEventPayload = "none";
    private int eventCount;

    public string LastEventName => lastEventName;
    public string LastEventPayload => lastEventPayload;
    public int EventCount => eventCount;

    public void StartSession()
    {
        Debug.Log("WellFit AR Session start requested");
        SendEventToWellFit("onArReady", "{\"status\":\"session-start-requested\"}");
    }

    public void StopSession()
    {
        Debug.Log("WellFit AR Session stop requested");
        SendEventToWellFit("onArReady", "{\"status\":\"session-stop-requested\"}");
    }

    public void PlaceBuddyAtScreenPointJson(string payloadJson)
    {
        Vector2 screenPoint = ParseScreenPoint(payloadJson);
        if (buddyAnchorController == null)
        {
            SendEventToWellFit("onArError", "{\"message\":\"BuddyAnchorController missing\"}");
            return;
        }

        buddyAnchorController.PlaceBuddyAtScreenPoint(screenPoint);
    }

    public void MoveBuddyToScreenPointJson(string payloadJson)
    {
        Vector2 screenPoint = ParseScreenPoint(payloadJson);
        if (buddyAnchorController == null)
        {
            SendEventToWellFit("onArError", "{\"message\":\"BuddyAnchorController missing\"}");
            return;
        }

        buddyAnchorController.MoveBuddyToScreenPoint(screenPoint);
    }

    public void CallBuddyToUserJson(string payloadJson)
    {
        Vector2 screenPoint = ParseScreenPointWithFallback(
            payloadJson,
            Screen.width * 0.5f,
            Screen.height * 0.35f
        );

        if (buddyAnchorController == null)
        {
            SendEventToWellFit("onArError", "{\"message\":\"BuddyAnchorController missing\",\"code\":\"buddy-anchor-controller-missing\"}");
            return;
        }

        bool started = buddyAnchorController.CallBuddyToScreenPoint(screenPoint);
        if (started)
        {
            SendEventToWellFit("onBuddyActionStarted", "{\"action\":\"callBuddyToUser\",\"source\":\"native-bridge\"}");
        }
    }

    public void ResetBuddyPlacement()
    {
        buddyInputController?.ResetPlacementState();
        SendEventToWellFit("onBuddyActionStarted", "{\"action\":\"resetPlacement\"}");
    }

    public void SuggestMissionJson(string payloadJson)
    {
        string missionId = ExtractString(payloadJson, "missionId", "demo_ar_walk_001");
        string reason = ExtractString(payloadJson, "reason", "backend-suggested");
        buddyKiGuideController?.SuggestNextMission(missionId, reason);
    }

    public void ExplainMissingCapabilityJson(string payloadJson)
    {
        string capabilityId = ExtractString(payloadJson, "capabilityId", "unknown");
        buddyKiGuideController?.ExplainMissingCapability(capabilityId);
    }

    public void ResetEventDiagnostics()
    {
        lastEventName = "none";
        lastEventPayload = "none";
        eventCount = 0;
    }

    public string BuildDiagnosticsLabel()
    {
        return "Events=" + eventCount + " | Last=" + lastEventName;
    }

    public void SendEventToWellFit(string eventName, string payloadJson)
    {
        lastEventName = string.IsNullOrEmpty(eventName) ? "unknown" : eventName;
        lastEventPayload = string.IsNullOrEmpty(payloadJson) ? "{}" : payloadJson;
        eventCount += 1;
        Debug.Log($"WellFit AR Event: {lastEventName} {lastEventPayload}");
    }

    private Vector2 ParseScreenPoint(string payloadJson)
    {
        return ParseScreenPointWithFallback(
            payloadJson,
            Screen.width * 0.5f,
            Screen.height * 0.5f
        );
    }

    private Vector2 ParseScreenPointWithFallback(string payloadJson, float fallbackX, float fallbackY)
    {
        float x = ExtractFloat(payloadJson, "x", fallbackX);
        float y = ExtractFloat(payloadJson, "y", fallbackY);

        if (x >= 0f && x <= 1f && y >= 0f && y <= 1f)
        {
            return new Vector2(x * Screen.width, y * Screen.height);
        }

        return new Vector2(x, y);
    }

    private float ExtractFloat(string json, string key, float fallback)
    {
        string raw = ExtractRawValue(json, key);
        if (string.IsNullOrEmpty(raw)) return fallback;

        if (float.TryParse(
            raw,
            System.Globalization.NumberStyles.Float,
            System.Globalization.CultureInfo.InvariantCulture,
            out float value
        ))
        {
            return value;
        }

        return fallback;
    }

    private string ExtractString(string json, string key, string fallback)
    {
        string raw = ExtractRawValue(json, key);
        if (string.IsNullOrEmpty(raw)) return fallback;
        return raw.Trim().Trim('"');
    }

    private string ExtractRawValue(string json, string key)
    {
        if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(key)) return string.Empty;

        string token = "\"" + key + "\"";
        int keyIndex = json.IndexOf(token, System.StringComparison.OrdinalIgnoreCase);
        if (keyIndex < 0) return string.Empty;

        int colonIndex = json.IndexOf(':', keyIndex);
        if (colonIndex < 0) return string.Empty;

        int start = colonIndex + 1;
        while (start < json.Length && char.IsWhiteSpace(json[start])) start++;

        int end = start;
        bool inString = start < json.Length && json[start] == '"';

        if (inString)
        {
            end++;
            while (end < json.Length && json[end] != '"') end++;
            return json.Substring(start, Mathf.Max(0, end - start + 1));
        }

        while (end < json.Length && json[end] != ',' && json[end] != '}') end++;

        return json.Substring(start, Mathf.Max(0, end - start)).Trim();
    }
}
