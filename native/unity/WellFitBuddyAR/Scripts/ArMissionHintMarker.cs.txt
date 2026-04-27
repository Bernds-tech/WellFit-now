using UnityEngine;

public class ArMissionHintMarker : MonoBehaviour
{
    public string markerId;
    public string missionId;
    public string markerType = "Generic";
    public Transform target;
    public WellFitNativeBridge bridge;

    public void SetMarker(string id, string currentMissionId, string type, Transform targetTransform)
    {
        markerId = id;
        missionId = currentMissionId;
        markerType = type;
        target = targetTransform;

        if (target != null)
        {
            transform.position = target.position;
        }

        SendMarkerEvent("onArHintMarkerCreated");
    }

    public void FocusMarker()
    {
        SendMarkerEvent("onArHintMarkerFocused");
    }

    public void ResolveMarker()
    {
        SendMarkerEvent("onArHintMarkerResolved");
        gameObject.SetActive(false);
    }

    private void SendMarkerEvent(string eventName)
    {
        string payload = "{\"markerId\":\"" + markerId + "\",\"missionId\":\"" + missionId + "\",\"type\":\"" + markerType + "\"}";
        bridge?.SendEventToWellFit(eventName, payload);
    }
}
