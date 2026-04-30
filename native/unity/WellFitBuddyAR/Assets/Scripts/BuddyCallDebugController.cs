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
    private BuddyKiGuideController buddyKiGuideController;

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
        debugPage = (debugPage + 1) % 4;
        lastStatus = "Debug page " + (debugPage + 1) + "/4";
    }

    public void SetDebugPage(int pageIndex)
    {
        debugPage = Mathf.Clamp(pageIndex, 0, 3);
        lastStatus = "Debug page " + (debugPage + 1) + "/4";
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
        if (debugPage == 2) return "Faehigkeiten & Events";
        return "KI-Guide & Missionen";
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
        if (buddyKiGuideController != null)
        {
            buddyKiGuideController.ResetDiagnostics();
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

    public void TestGuideWalkMission()
    {
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null)
        {
            lastStatus = "Guide test: BuddyKiGuideController missing";
            return;
        }

        buddyKiGuideController.DebugSuggestWalkMission();
        lastStatus = "Guide walk mission requested.";
    }

    public void TestGuideScanMission()
    {
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null)
        {
            lastStatus = "Guide test: BuddyKiGuideController missing";
            return;
        }

        buddyKiGuideController.DebugSuggestScanMission();
        lastStatus = "Guide scan mission requested.";
    }

    public void TestGuideMissingJumpBoost()
    {
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null)
        {
            lastStatus = "Guide test: BuddyKiGuideController missing";
            return;
        }

        buddyKiGuideController.DebugExplainJumpBoost();
        lastStatus = "Guide missing capability requested.";
    }

    public void ClearGuide()
    {
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null)
        {
            lastStatus = "Guide clear: BuddyKiGuideController missing";
            return;
        }

        buddyKiGuideController.ClearGuide();
        lastStatus = "Guide cleared.";
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

        if (buddyKiGuideController == null)
        {
            buddyKiGuideController = FindObjectOfType<BuddyKiGuideController>();
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
        labelStyle.fontSize = 15;
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

            string guideDiagnostics = buddyKiGuideController != null
                ? buddyKiGuideController.BuildDiagnosticsLabel()
                : "Guide=not-found";

            GUI.Box(new Rect(14f, top - 198f, width + 12f, 192f), "");
            GUI.Label(new Rect(24f, top - 192f, Screen.width - 48f, 186f), "Status: " + lastStatus + "\nPage: " + (debugPage + 1) + "/4 - " + GetPageTitle() + "\nDiag: " + diagnostics + "\nNav: " + navDiagnostics + "\nAnchor: " + anchorDiagnostics + "\nBridge: " + bridgeDiagnostics + "\nAbility: " + abilityDiagnostics + "\nGuide: " + guideDiagnostics, labelStyle);
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
        float tabWidth = (width - 18f) / 4f;
        if (GUI.Button(new Rect(left, pageTop, tabWidth, height), "Rueckruf", buttonStyle)) SetDebugPage(0);
        if (GUI.Button(new Rect(left + tabWidth + 6f, pageTop, tabWidth, height), "Visual", buttonStyle)) SetDebugPage(1);
        if (GUI.Button(new Rect(left + 2f * (tabWidth + 6f), pageTop, tabWidth, height), "Faehigk.", buttonStyle)) SetDebugPage(2);
        if (GUI.Button(new Rect(left + 3f * (tabWidth + 6f), pageTop, tabWidth, height), "Guide", buttonStyle)) SetDebugPage(3);

        if (debugPage == 0)
        {
            DrawReturnPage(left, top + 144f, width, height, buttonStyle);
        }
        else if (debugPage == 1)
        {
            DrawVisualPage(left, top + 144f, width, height, buttonStyle);
        }
        else if (debugPage == 2)
        {
            DrawAbilityPage(left, top + 144f, width, height, buttonStyle);
        }
        else
        {
            DrawGuidePage(left, top + 144f, width, height, buttonStyle);
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

    private void DrawGuidePage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Mission: Gehen", buttonStyle)) TestGuideWalkMission();
        if (GUI.Button(new Rect(left, top + 48f, width, height), "Mission: Scannen", buttonStyle)) TestGuideScanMission();
        if (GUI.Button(new Rect(left, top + 96f, width, height), "Fehlt: Sprungboost", buttonStyle)) TestGuideMissingJumpBoost();
        if (GUI.Button(new Rect(left, top + 144f, width, height), "Guide leeren", buttonStyle)) ClearGuide();
        if (GUI.Button(new Rect(left, top + 192f, width, height), "Diagnose reset", buttonStyle)) ResetDiagnostics();
    }
}
