using UnityEngine;

public class BuddyCallDebugController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private bool showDebugButton = true;
    [SerializeField] private float normalizedScreenX = 0.5f;
    [SerializeField] private float normalizedScreenY = 0.35f;

    private string lastStatus = "Buddy recall debug ready";

    void Awake()
    {
        if (bridge == null)
        {
            bridge = FindObjectOfType<WellFitNativeBridge>();
        }
    }

    public void CallBuddyToUser()
    {
        if (bridge == null)
        {
            lastStatus = "Buddy recall failed: WellFitNativeBridge missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        float x = Mathf.Clamp01(normalizedScreenX);
        float y = Mathf.Clamp01(normalizedScreenY);
        string payloadJson = "{\"x\":" + x.ToString(System.Globalization.CultureInfo.InvariantCulture) + ",\"y\":" + y.ToString(System.Globalization.CultureInfo.InvariantCulture) + "}";

        bridge.CallBuddyToUserJson(payloadJson);
        lastStatus = "Buddy recall requested at screen point " + x + ", " + y;
        Debug.Log(lastStatus);
    }

    void OnGUI()
    {
        if (!showDebugButton)
        {
            return;
        }

        float width = Mathf.Min(520f, Screen.width - 40f);
        float height = 70f;
        Rect buttonRect = new Rect(20f, Screen.height - 110f, width, height);

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 28;

        if (GUI.Button(buttonRect, "Buddy rufen", buttonStyle))
        {
            CallBuddyToUser();
        }

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 22;
        labelStyle.normal.textColor = Color.white;
        GUI.Label(new Rect(24f, Screen.height - 145f, Screen.width - 48f, 30f), lastStatus, labelStyle);
    }
}
