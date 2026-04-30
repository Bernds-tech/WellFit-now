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
    private BuddyController buddyController;
    private BuddyLookAtCamera buddyLookAtCamera;
    private BuddyNavigationController buddyNavigationController;
    private BuddyAnchorController buddyAnchorController;
    private BuddyAbilityController buddyAbilityController;

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
        if (bridge != null)
        {
            bridge.ResetEventDiagnostics();
        }
        if (buddyAbilityController != null)
        {
            buddyAbilityController.ResetDiagnostics();
        }
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

    public void ToggleBuddyIdleMotion()
    {
        RefreshBuddyVisualControllers();
        if (buddyController == null)
        {
            lastStatus = "Idle toggle: BuddyController missing";
            return;
        }

        buddyController.SetIdleMotionEnabled(!buddyController.IdleMotionEnabled);
        lastStatus = "Idle motion: " + (buddyController.IdleMotionEnabled ? "AN" : "AUS");
    }

    public void ToggleBuddyLookAt()
    {
        RefreshBuddyVisualControllers();
        if (buddyLookAtCamera == null)
        {
            lastStatus = "Look toggle: BuddyLookAtCamera missing";
            return;
        }

        buddyLookAtCamera.SetLookAtEnabled(!buddyLookAtCamera.LookAtEnabled);
        lastStatus = "Look at camera: " + (buddyLookAtCamera.LookAtEnabled ? "AN" : "AUS");
    }

    public void ToggleDemoAbilities()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Ability toggle: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.ToggleDemoCapabilities();
        lastStatus = "Demo abilities toggled.";
    }

    public void TestScanAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Scan test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TryScanObject("debug_marker_scan");
        lastStatus = "Scan ability test requested.";
    }

    public void TestFetchAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Fetch test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TryFetchClue("debug_marker_clue");
        lastStatus = "Fetch ability test requested.";
    }

    private void RefreshBuddyVisualControllers()
    {
        if (buddyController == null)
        {
            buddyController = FindObjectOfType<BuddyController>();
        }

        if (buddyLookAtCamera == null)
        {
            buddyLookAtCamera = FindObjectOfType<BuddyLookAtCamera>();
        }

        if (buddyNavigationController == null)
        {
            buddyNavigationController = FindObjectOfType<BuddyNavigationController>();
        }

        if (buddyAnchorController == null)
        {
            buddyAnchorController = FindObjectOfType<BuddyAnchorController>();
        }

        if (buddyAbilityController == null)
        {
            buddyAbilityController = FindObjectOfType<BuddyAbilityController>();
        }
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

        RefreshBuddyVisualControllers();

        float width = Mathf.Min(620f, Screen.width - 40f);
        float height = 40f;
        float left = 20f;
        float bottom = compactMode ? Screen.height - 118f : Screen.height - 951f;

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 17;

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 16;
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        string diagnostics = autoReturnController != null
            ? autoReturnController.BuildDiagnosticsLabel()
            : "Auto-return controller missing";

        string navDiagnostics = buddyNavigationController != null
            ? buddyNavigationController.BuildDiagnosticsLabel()
            : "Navigation=not-found";

        string anchorDiagnostics = buddyAnchorController != null
            ? buddyAnchorController.BuildDiagnosticsLabel()
            : "Anchor=not-found";

        string bridgeDiagnostics = bridge != null
            ? bridge.BuildDiagnosticsLabel()
            : "Bridge=not-found";

        string abilityDiagnostics = buddyAbilityController != null
            ? buddyAbilityController.BuildDiagnosticsLabel()
            : "Abilities=not-found";

        GUI.Box(new Rect(14f, bottom - 156f, width + 12f, 150f), "");
        GUI.Label(new Rect(24f, bottom - 150f, Screen.width - 48f, 144f), "Status: " + lastStatus + "\nDiag: " + diagnostics + "\nNav: " + navDiagnostics + "\nAnchor: " + anchorDiagnostics + "\nBridge: " + bridgeDiagnostics + "\nAbility: " + abilityDiagnostics, labelStyle);

        if (GUI.Button(new Rect(left, bottom, width, height), compactMode ? "Debug zeigen" : "Debug klein", buttonStyle))
        {
            ToggleCompactMode();
        }

        if (compactMode)
        {
            return;
        }

        if (GUI.Button(new Rect(left, bottom + 44f, width, height), "Buddy rufen", buttonStyle))
        {
            CallBuddyToUser();
        }

        if (GUI.Button(new Rect(left, bottom + 88f, width, height), "Rueckruf testen", buttonStyle))
        {
            RequestAutoReturnOnce();
        }

        string autoLabel = "Auto: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 132f, width, height), autoLabel, buttonStyle))
        {
            ToggleAutoReturn();
        }

        string farOnlyLabel = "Nur weit weg: " + (autoReturnController != null && autoReturnController.OnlyReturnWhenFar ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, bottom + 176f, width, height), farOnlyLabel, buttonStyle))
        {
            ToggleFarOnly();
        }

        if (GUI.Button(new Rect(left, bottom + 220f, width, height), "Timing schnell", buttonStyle))
        {
            UseFastTiming();
        }

        if (GUI.Button(new Rect(left, bottom + 264f, width, height), "Timing normal", buttonStyle))
        {
            UseNormalTiming();
        }

        if (GUI.Button(new Rect(left, bottom + 308f, width, height), "Abstand Test", buttonStyle))
        {
            UseTestDistance();
        }

        if (GUI.Button(new Rect(left, bottom + 352f, width, height), "Abstand Produkt", buttonStyle))
        {
            UseProductDistance();
        }

        if (GUI.Button(new Rect(left, bottom + 396f, width, height), "Idle AN/AUS", buttonStyle))
        {
            ToggleBuddyIdleMotion();
        }

        if (GUI.Button(new Rect(left, bottom + 440f, width, height), "Blick AN/AUS", buttonStyle))
        {
            ToggleBuddyLookAt();
        }

        if (GUI.Button(new Rect(left, bottom + 484f, width, height), "Fähigkeiten AN/AUS", buttonStyle))
        {
            ToggleDemoAbilities();
        }

        if (GUI.Button(new Rect(left, bottom + 528f, width, height), "Scan testen", buttonStyle))
        {
            TestScanAbility();
        }

        if (GUI.Button(new Rect(left, bottom + 572f, width, height), "Hinweis holen testen", buttonStyle))
        {
            TestFetchAbility();
        }

        if (GUI.Button(new Rect(left, bottom + 616f, width, height), "Diagnose reset", buttonStyle))
        {
            ResetDiagnostics();
        }
    }
}
