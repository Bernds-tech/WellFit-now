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

    public void ResetDiagnostics()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Reset failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.ResetDiagnostics();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseFastTiming()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Timing failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.UseFastTiming();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseNormalTiming()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Timing failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.UseNormalTiming();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseTestDistance()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Distance failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.UseTestDistance();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseProductDistance()
    {
        if (autoReturnController == null)
        {
            lastStatus = "Distance failed: controller missing";
            Debug.LogWarning(lastStatus);
            return;
        }

        autoReturnController.UseProductDistance();
        lastStatus = autoReturnController.LastStatus;
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
        float height = 50f;
        float left = 20f;
        float bottom = compactMode ? Screen.height - 118f : Screen.height - 681f;

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 20;

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 19;
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        string diagnostics = autoReturnController != null
            ? autoReturnController.BuildDiagnosticsLabel()
            : "Auto-return controller missing";

        GUI.Box(new Rect(14f, bottom - 76f, width + 12f, 70f), "");
        GUI.Label(new Rect(24f, bottom - 70f, Screen.width - 48f, 64f), "Status: " + lastStatus + "\nDiag: " + diagnostics, labelStyle);

        if (GUI.Button(new Rect(left, bottom, width, height), compactMode ? "Debug zeigen" : "Debug klein", buttonStyle))
        {
            ToggleCompactMode();
        }

        if (compactMode)
        {
            return;
        }

        if (GUI.Button(new Rect(left, bottom + 56f, width, height), "Buddy rufen", buttonStyle))
        {
            CallBuddyToUser();
        }

        if (GUI.Button(new Rect(left, bottom + 112f, width, height), "Rueckruf testen", buttonStyle))
        {
            RequestAutoReturnOnce();
        }

        string autoLabel = "Auto: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 168f, width, height), autoLabel, buttonStyle))
        {
            ToggleAutoReturn();
        }

        string farOnlyLabel = "Nur weit weg: " + (autoReturnController != null && autoReturnController.OnlyReturnWhenFar ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 224f, width, height), farOnlyLabel, buttonStyle))
        {
            ToggleFarOnly();
        }

        if (GUI.Button(new Rect(left, bottom + 280f, width, height), "Timing schnell", buttonStyle))
        {
            UseFastTiming();
        }

        if (GUI.Button(new Rect(left, bottom + 336f, width, height), "Timing normal", buttonStyle))
        {
            UseNormalTiming();
        }

        if (GUI.Button(new Rect(left, bottom + 392f, width, height), "Abstand Test", buttonStyle))
        {
            UseTestDistance();
        }

        if (GUI.Button(new Rect(left, bottom + 448f, width, height), "Abstand Produkt", buttonStyle))
        {
            UseProductDistance();
        }

        if (GUI.Button(new Rect(left, bottom + 504f, width, height), "Diagnose reset", buttonStyle))
        {
            ResetDiagnostics();
        }
    }
}
