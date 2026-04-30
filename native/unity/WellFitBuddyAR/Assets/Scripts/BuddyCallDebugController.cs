using UnityEngine;

public class BuddyCallDebugController : MonoBehaviour
{
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyCompanionAutoReturnController autoReturnController;
    [SerializeField] private bool showDebugButton = true;
    [SerializeField] private bool compactMode = false;
    [SerializeField] private bool showDiagnostics = true;
    [SerializeField] private float normalizedScreenX = 0.5f;
    [SerializeField] private float normalizedScreenY = 0.35f;

    private string lastStatus = "Buddy recall debug ready";
    private int debugPage;
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

    public void NextDebugPage()
    {
        debugPage = (debugPage + 1) % 3;
        lastStatus = "Debug page " + (debugPage + 1) + "/3";
    }

    public void SetDebugPage(int pageIndex)
    {
        debugPage = Mathf.Clamp(pageIndex, 0, 2);
        lastStatus = "Debug page " + (debugPage + 1) + "/3";
    }

    public void ToggleDiagnostics()
    {
        showDiagnostics = !showDiagnostics;
        lastStatus = showDiagnostics ? "Diagnose sichtbar." : "Diagnose ausgeblendet.";
    }

    private string GetPageTitle()
    {
        if (debugPage == 0) return "Rueckruf & Auto-Return";
        if (debugPage == 1) return "Visuals & Verhalten";
        return "Faehigkeiten & Events";
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

    public void TestCarryAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Carry test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TryCarry("debug_marker_carry");
        lastStatus = "Carry ability test requested.";
    }

    public void TestPointAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Point test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TryPointAtObject("debug_marker_point");
        lastStatus = "Point ability test requested.";
    }

    public void TestClimbAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Climb test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TestClimbUpNearBuddy();
        lastStatus = "Climb ability test requested.";
    }

    public void TestJumpAbility()
    {
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null)
        {
            lastStatus = "Jump test: BuddyAbilityController missing";
            return;
        }

        buddyAbilityController.TestJumpBoostNearBuddy();
        lastStatus = "Jump ability test requested.";
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
        float height = 44f;
        float left = 20f;
        float top = showDiagnostics ? Screen.height - 500f : Screen.height - 315f;

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = 17;

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = 16;
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        if (showDiagnostics)
        {
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

            GUI.Box(new Rect(14f, top - 176f, width + 12f, 170f), "");
            GUI.Label(new Rect(24f, top - 170f, Screen.width - 48f, 164f), "Status: " + lastStatus + "\nPage: " + (debugPage + 1) + "/3 - " + GetPageTitle() + "\nDiag: " + diagnostics + "\nNav: " + navDiagnostics + "\nAnchor: " + anchorDiagnostics + "\nBridge: " + bridgeDiagnostics + "\nAbility: " + abilityDiagnostics, labelStyle);
        }

        if (GUI.Button(new Rect(left, top, width, height), compactMode ? "Debug zeigen" : "Debug klein", buttonStyle))
        {
            ToggleCompactMode();
        }

        if (compactMode)
        {
            return;
        }

        if (GUI.Button(new Rect(left, top + 48f, width, height), showDiagnostics ? "Diagnose aus" : "Diagnose an", buttonStyle))
        {
            ToggleDiagnostics();
        }

        float pageTop = top + 96f;
        if (GUI.Button(new Rect(left, pageTop, (width - 12f) / 3f, height), "Rueckruf", buttonStyle)) SetDebugPage(0);
        if (GUI.Button(new Rect(left + (width + 6f) / 3f, pageTop, (width - 12f) / 3f, height), "Visual", buttonStyle)) SetDebugPage(1);
        if (GUI.Button(new Rect(left + 2f * (width + 6f) / 3f, pageTop, (width - 12f) / 3f, height), "Faehigk.", buttonStyle)) SetDebugPage(2);

        if (debugPage == 0)
        {
            DrawReturnPage(left, top + 144f, width, height, buttonStyle);
        }
        else if (debugPage == 1)
        {
            DrawVisualPage(left, top + 144f, width, height, buttonStyle);
        }
        else
        {
            DrawAbilityPage(left, top + 144f, width, height, buttonStyle);
        }
    }

    private void DrawReturnPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Buddy rufen", buttonStyle)) CallBuddyToUser();
        if (GUI.Button(new Rect(left, top + 48f, width, height), "Rueckruf testen", buttonStyle)) RequestAutoReturnOnce();
        string autoLabel = "Auto: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, top + 96f, width, height), autoLabel, buttonStyle)) ToggleAutoReturn();
        string farOnlyLabel = "Nur weit weg: " + (autoReturnController != null && autoReturnController.OnlyReturnWhenFar ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, top + 144f, width, height), farOnlyLabel, buttonStyle)) ToggleFarOnly();
        if (GUI.Button(new Rect(left, top + 192f, width, height), "Timing schnell", buttonStyle)) UseFastTiming();
        if (GUI.Button(new Rect(left, top + 240f, width, height), "Timing normal", buttonStyle)) UseNormalTiming();
        if (GUI.Button(new Rect(left, top + 288f, width, height), "Abstand Test", buttonStyle)) UseTestDistance();
        if (GUI.Button(new Rect(left, top + 336f, width, height), "Abstand Produkt", buttonStyle)) UseProductDistance();
    }

    private void DrawVisualPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Idle AN/AUS", buttonStyle)) ToggleBuddyIdleMotion();
        if (GUI.Button(new Rect(left, top + 48f, width, height), "Blick AN/AUS", buttonStyle)) ToggleBuddyLookAt();
        if (GUI.Button(new Rect(left, top + 96f, width, height), "Diagnose reset", buttonStyle)) ResetDiagnostics();
    }

    private void DrawAbilityPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Fähigkeiten AN/AUS", buttonStyle)) ToggleDemoAbilities();
        if (GUI.Button(new Rect(left, top + 48f, width, height), "Scan testen", buttonStyle)) TestScanAbility();
        if (GUI.Button(new Rect(left, top + 96f, width, height), "Hinweis holen testen", buttonStyle)) TestFetchAbility();
        if (GUI.Button(new Rect(left, top + 144f, width, height), "Tragen testen", buttonStyle)) TestCarryAbility();
        if (GUI.Button(new Rect(left, top + 192f, width, height), "Zeigen testen", buttonStyle)) TestPointAbility();
        if (GUI.Button(new Rect(left, top + 240f, width, height), "Klettern testen", buttonStyle)) TestClimbAbility();
        if (GUI.Button(new Rect(left, top + 288f, width, height), "Sprung testen", buttonStyle)) TestJumpAbility();
        if (GUI.Button(new Rect(left, top + 336f, width, height), "Diagnose reset", buttonStyle)) ResetDiagnostics();
    }
}
