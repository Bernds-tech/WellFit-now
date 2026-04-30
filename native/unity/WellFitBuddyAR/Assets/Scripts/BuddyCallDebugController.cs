using UnityEngine;

public class BuddyCallDebugController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyCompanionAutoReturnController autoReturnController;
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

        if (autoReturnController == null)
        {
            autoReturnController = FindObjectOfType<BuddyCompanionAutoReturnController>();
        }
    }

    public void ConfigureForScene(
        WellFitNativeBridge sceneBridge,
        BuddyCompanionAutoReturnController sceneAutoReturnController,
        bool showButtons
    )
    {
        bridge = sceneBridge;
        autoReturnController = sceneAutoReturnController;
        showDebugButton = showButtons;
        lastStatus = "Buddy recall debug wired by scene bootstrap";
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

    public void RequestAutoReturnOnce()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Auto-return test failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        bool started = autoReturnController.RequestAutoReturn();
        lastStatus = started ? "Auto-return test requested" : "Auto-return test rejected";
        Debug.Log(lastStatus);
    }

    public void ToggleAutoReturn()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Auto-return toggle failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.ToggleAutoReturn();
        lastStatus = autoReturnController.LastStatus;
        Debug.Log(lastStatus);
    }

    void OnGUI()
    {
        if (!showDebugButton)
        {
            return;
        }

        float width = Mathf.Min(520f, Screen.width - 40f);
        float height = 62f;
        float left = 20f;
        float bottom = Screen.height - 245f;

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 24;

        if (GUI.Button(new Rect(left, bottom, width, height), "Buddy rufen", buttonStyle))
        {
            CallBuddyToUser();
        }

        if (GUI.Button(new Rect(left, bottom + 68f, width, height), "Auto-Return einmal testen", buttonStyle))
        {
            RequestAutoReturnOnce();
        }

        string autoLabel = "Auto-Return: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 136f, width, height), autoLabel, buttonStyle))
        {
            ToggleAutoReturn();
        }

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 20;
        labelStyle.normal.textColor = Color.white;
        GUI.Label(new Rect(24f, bottom - 34f, Screen.width - 48f, 30f), lastStatus, labelStyle);
    }
}
