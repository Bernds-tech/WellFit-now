using UnityEngine;

public class BuddyCallDebugController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyCompanionAutoReturnController autoReturnController;
    [SerializeField] private bool showDebugButton = true;
    [SerializeField] private bool compactMode = false;
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

        bool started = autoReturnController.RequestAutoReturn(true);
        lastStatus = started ? "Manual auto-return requested" : "Manual auto-return rejected";
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

    public void ToggleFarOnly()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Far-only toggle failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.ToggleOnlyReturnWhenFar();
        lastStatus = autoReturnController.LastStatus;
        Debug.Log(lastStatus);
    }

    public void ToggleCompactMode()
    {
        compactMode = !compactMode;
        lastStatus = compactMode ? "Debug overlay compact" : "Debug overlay expanded";
    }

    void OnGUI()
    {
        if (!showDebugButton)
        {
            return;
        }

        float width = Mathf.Min(620f, Screen.width - 40f);
        float height = 58f;
        float left = 20f;
        float bottom = compactMode ? Screen.height - 118f : Screen.height - 385f;

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 22;

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 19;
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        string diagnostics = autoReturnController != null
            ? autoReturnController.BuildDiagnosticsLabel()
            : "Auto-return controller missing";

        GUI.Label(new Rect(24f, bottom - 66f, Screen.width - 48f, 58f), lastStatus + "\n" + diagnostics, labelStyle);

        if (GUI.Button(new Rect(left, bottom, width, height), compactMode ? "Debug anzeigen" : "Debug einklappen", buttonStyle))
        {
            ToggleCompactMode();
        }

        if (compactMode)
        {
            return;
        }

        if (GUI.Button(new Rect(left, bottom + 64f, width, height), "Buddy rufen", buttonStyle))
        {
            CallBuddyToUser();
        }

        if (GUI.Button(new Rect(left, bottom + 128f, width, height), "Auto-Return einmal testen", buttonStyle))
        {
            RequestAutoReturnOnce();
        }

        string autoLabel = "Auto-Return: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 192f, width, height), autoLabel, buttonStyle))
        {
            ToggleAutoReturn();
        }

        string farOnlyLabel = "Nur wenn weit weg: " + (autoReturnController != null && autoReturnController.OnlyReturnWhenFar ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 256f, width, height), farOnlyLabel, buttonStyle))
        {
            ToggleFarOnly();
        }
    }
}
