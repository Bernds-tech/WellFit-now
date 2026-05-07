using UnityEngine;

public class BuddyCallDebugController : MonoBehaviour
{
    private static BuddyCallDebugController activeOverlay;

    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyCompanionAutoReturnController autoReturnController;
    [SerializeField] private bool showDebugButton = true;
    [SerializeField] private bool compactMode = false;
    [SerializeField] private bool showDiagnostics = true;
    [SerializeField] private float normalizedScreenX = 0.5f;
    [SerializeField] private float normalizedScreenY = 0.35f;

    [Header("Debug Overlay Touch UI")]
    [SerializeField] private float minimumDebugButtonHeight = 64f;
    [SerializeField] private int minimumDebugButtonFontSize = 24;
    [SerializeField] private int minimumDebugLabelFontSize = 20;

    private Rect debugInputBlockRect;
    private string lastStatus = "Buddy recall debug ready";
    private int debugPage;
    private float debugRowGap = 72f;
    private BuddyController buddyController;
    private BuddyLookAtCamera buddyLookAtCamera;
    private BuddyNavigationController buddyNavigationController;
    private BuddyAnchorController buddyAnchorController;
    private BuddyAbilityController buddyAbilityController;
    private BuddyKiGuideController buddyKiGuideController;

    void OnEnable() { activeOverlay = this; }
    void OnDisable() { if (activeOverlay == this) activeOverlay = null; }

    void Awake()
    {
        if (bridge == null) bridge = FindObjectOfType<WellFitNativeBridge>();
        if (autoReturnController == null) autoReturnController = FindObjectOfType<BuddyCompanionAutoReturnController>();
    }

    public static bool IsAnyDebugOverlayUnderScreenPoint(Vector2 screenPoint)
    {
        return activeOverlay != null && activeOverlay.IsScreenPointOverDebugOverlay(screenPoint);
    }

    public bool IsScreenPointOverDebugOverlay(Vector2 screenPoint)
    {
        if (!showDebugButton) return false;
        float guiY = Screen.height - screenPoint.y;
        return debugInputBlockRect.Contains(new Vector2(screenPoint.x, guiY));
    }

    public void ConfigureForScene(WellFitNativeBridge sceneBridge, BuddyCompanionAutoReturnController sceneAutoReturnController, bool showButtons)
    {
        bridge = sceneBridge;
        autoReturnController = sceneAutoReturnController;
        showDebugButton = showButtons;
        lastStatus = "Buddy recall debug wired by scene bootstrap";
    }

    public void NextDebugPage()
    {
        SetDebugPage((debugPage + 1) % 5);
    }

    public void SetDebugPage(int pageIndex)
    {
        debugPage = Mathf.Clamp(pageIndex, 0, 4);
        if (debugPage != 0)
        {
            PauseAutoReturnForNonRecallTest("Debug page " + (debugPage + 1) + "/5");
        }
        else
        {
            lastStatus = "Debug page 1/5 - Rueckruf";
        }
    }

    public void ToggleDiagnostics()
    {
        PauseAutoReturnForNonRecallTest("Diagnose umgeschaltet");
        showDiagnostics = !showDiagnostics;
        lastStatus = showDiagnostics ? "Diagnose sichtbar." : "Diagnose ausgeblendet.";
    }

    public void ToggleCompactMode()
    {
        PauseAutoReturnForNonRecallTest("Debug kompakt umgeschaltet");
        compactMode = !compactMode;
        lastStatus = compactMode ? "Debug overlay compact" : "Debug overlay expanded";
    }

    private string GetPageTitle()
    {
        if (debugPage == 0) return "Rueckruf";
        if (debugPage == 1) return "Visuals & Verhalten";
        if (debugPage == 2) return "Faehigkeiten & Events";
        if (debugPage == 3) return "KI-Guide & Missionen";
        return "Auto-Tuning & Bewegung";
    }

    private void PauseAutoReturnForNonRecallTest(string statusPrefix)
    {
        if (autoReturnController != null && autoReturnController.AutoReturnEnabled)
        {
            autoReturnController.SetAutoReturnEnabled(false);
            lastStatus = statusPrefix + ": Auto-Return fuer Debug-Test ausgeschaltet.";
        }
        else
        {
            lastStatus = statusPrefix;
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
        PauseAutoReturnForNonRecallTest("Diagnose reset");
        if (autoReturnController != null) autoReturnController.ResetDiagnostics();
        if (bridge != null) bridge.ResetEventDiagnostics();
        if (buddyAbilityController != null) buddyAbilityController.ResetDiagnostics();
        if (buddyKiGuideController != null) buddyKiGuideController.ResetDiagnostics();
    }

    public void UseFastTiming()
    {
        if (autoReturnController == null) { lastStatus = "Timing failed: controller missing"; return; }
        autoReturnController.UseFastTiming();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseNormalTiming()
    {
        if (autoReturnController == null) { lastStatus = "Timing failed: controller missing"; return; }
        autoReturnController.UseNormalTiming();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseTestDistance()
    {
        if (autoReturnController == null) { lastStatus = "Distance failed: controller missing"; return; }
        autoReturnController.UseTestDistance();
        lastStatus = autoReturnController.LastStatus;
    }

    public void UseProductDistance()
    {
        if (autoReturnController == null) { lastStatus = "Distance failed: controller missing"; return; }
        autoReturnController.UseProductDistance();
        lastStatus = autoReturnController.LastStatus;
    }

    public void ToggleBuddyIdleMotion()
    {
        PauseAutoReturnForNonRecallTest("Idle toggle");
        RefreshBuddyVisualControllers();
        if (buddyController == null) { lastStatus = "Idle toggle: BuddyController missing"; return; }
        buddyController.SetIdleMotionEnabled(!buddyController.IdleMotionEnabled);
        lastStatus = "Idle motion: " + (buddyController.IdleMotionEnabled ? "AN" : "AUS") + ". Buddy darf sich weiter per Bodentap bewegen.";
    }

    public void ToggleBuddyLookAt()
    {
        PauseAutoReturnForNonRecallTest("Look toggle");
        RefreshBuddyVisualControllers();
        if (buddyLookAtCamera == null) { lastStatus = "Look toggle: BuddyLookAtCamera missing"; return; }
        buddyLookAtCamera.SetLookAtEnabled(!buddyLookAtCamera.LookAtEnabled);
        lastStatus = "Look at camera: " + (buddyLookAtCamera.LookAtEnabled ? "AN" : "AUS") + ". Keine Positionsaenderung erwartet.";
    }

    public void ToggleDemoAbilities()
    {
        PauseAutoReturnForNonRecallTest("Ability toggle");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Ability toggle: BuddyAbilityController missing"; return; }
        buddyAbilityController.ToggleDemoCapabilities();
        lastStatus = "Demo abilities toggled. Sichtbare Animationen kommen spaeter.";
    }

    public void TestScanAbility()
    {
        PauseAutoReturnForNonRecallTest("Scan test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Scan test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TryScanObject("debug_marker_scan");
        lastStatus = "Scan event sent. Noch keine sichtbare Scan-Animation erwartet.";
    }

    public void TestFetchAbility()
    {
        PauseAutoReturnForNonRecallTest("Fetch test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Fetch test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TryFetchClue("debug_marker_clue");
        lastStatus = "Hinweis-holen event sent. Noch keine sichtbare Animation erwartet.";
    }

    public void TestCarryAbility()
    {
        PauseAutoReturnForNonRecallTest("Carry test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Carry test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TryCarry("debug_marker_carry");
        lastStatus = "Tragen event sent. Noch keine sichtbare Trageanimation erwartet.";
    }

    public void TestPointAbility()
    {
        PauseAutoReturnForNonRecallTest("Point test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Point test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TryPointAtObject("debug_marker_point");
        lastStatus = "Zeigen event sent. Noch keine sichtbare Zeigeanimation erwartet.";
    }

    public void TestClimbAbility()
    {
        PauseAutoReturnForNonRecallTest("Climb test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Climb test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TestClimbUpNearBuddy();
        lastStatus = "Klettern event sent. Sichtbare Kletteranimation kommt spaeter.";
    }

    public void TestJumpAbility()
    {
        PauseAutoReturnForNonRecallTest("Jump test");
        RefreshBuddyVisualControllers();
        if (buddyAbilityController == null) { lastStatus = "Jump test: BuddyAbilityController missing"; return; }
        buddyAbilityController.TestJumpBoostNearBuddy();
        lastStatus = "Sprung event sent. Sichtbare Sprunganimation kommt spaeter.";
    }

    public void TestGuideWalkMission()
    {
        PauseAutoReturnForNonRecallTest("Guide walk mission");
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null) { lastStatus = "Guide test: BuddyKiGuideController missing"; return; }
        buddyKiGuideController.DebugSuggestWalkMission();
        lastStatus = "Guide walk mission suggested. Buddy soll nicht automatisch laufen.";
    }

    public void TestGuideScanMission()
    {
        PauseAutoReturnForNonRecallTest("Guide scan mission");
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null) { lastStatus = "Guide test: BuddyKiGuideController missing"; return; }
        buddyKiGuideController.DebugSuggestScanMission();
        lastStatus = "Guide scan mission suggested. Buddy soll nicht automatisch laufen.";
    }

    public void TestGuideMissingJumpBoost()
    {
        PauseAutoReturnForNonRecallTest("Guide missing jumpboost");
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null) { lastStatus = "Guide test: BuddyKiGuideController missing"; return; }
        buddyKiGuideController.DebugExplainJumpBoost();
        lastStatus = "Guide explains missing jumpboost. Keine Bewegung erwartet.";
    }

    public void ClearGuide()
    {
        PauseAutoReturnForNonRecallTest("Guide clear");
        RefreshBuddyVisualControllers();
        if (buddyKiGuideController == null) { lastStatus = "Guide clear: BuddyKiGuideController missing"; return; }
        buddyKiGuideController.ClearGuide();
        lastStatus = "Guide cleared.";
    }

    private void RefreshBuddyVisualControllers()
    {
        if (buddyController == null) buddyController = FindObjectOfType<BuddyController>();
        if (buddyLookAtCamera == null) buddyLookAtCamera = FindObjectOfType<BuddyLookAtCamera>();
        if (buddyNavigationController == null) buddyNavigationController = FindObjectOfType<BuddyNavigationController>();
        if (buddyAnchorController == null) buddyAnchorController = FindObjectOfType<BuddyAnchorController>();
        if (buddyAbilityController == null) buddyAbilityController = FindObjectOfType<BuddyAbilityController>();
        if (buddyKiGuideController == null) buddyKiGuideController = FindObjectOfType<BuddyKiGuideController>();
    }

    void OnGUI()
    {
        if (!showDebugButton) { debugInputBlockRect = Rect.zero; return; }
        RefreshBuddyVisualControllers();

        float horizontalMargin = 16f;
        float width = Mathf.Min(760f, Screen.width - (horizontalMargin * 2f));
        float height = Mathf.Max(minimumDebugButtonHeight, Screen.height * 0.044f);
        debugRowGap = height + 10f;
        float left = horizontalMargin;
        float top = showDiagnostics ? Screen.height - 760f : Screen.height - 520f;
        top = Mathf.Max(24f, top);

        float diagnosticsHeight = showDiagnostics ? Mathf.Max(232f, Screen.height * 0.15f) : 0f;
        float blockTop = showDiagnostics ? top - diagnosticsHeight - 12f : top - 8f;
        debugInputBlockRect = new Rect(left - 12f, blockTop, width + 24f, diagnosticsHeight + (debugRowGap * 10f));

        GUIStyle buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.fontSize = Mathf.Max(minimumDebugButtonFontSize, Mathf.RoundToInt(Screen.height * 0.018f));
        buttonStyle.wordWrap = true;
        buttonStyle.alignment = TextAnchor.MiddleCenter;
        buttonStyle.padding = new RectOffset(10, 10, 8, 8);

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = Mathf.Max(minimumDebugLabelFontSize, Mathf.RoundToInt(Screen.height * 0.014f));
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        if (showDiagnostics)
        {
            string diagnostics = autoReturnController != null ? autoReturnController.BuildDiagnosticsLabel() : "Auto-return controller missing";
            string navDiagnostics = buddyNavigationController != null ? buddyNavigationController.BuildDiagnosticsLabel() : "Navigation=not-found";
            string anchorDiagnostics = buddyAnchorController != null ? buddyAnchorController.BuildDiagnosticsLabel() : "Anchor=not-found";
            string bridgeDiagnostics = bridge != null ? bridge.BuildDiagnosticsLabel() : "Bridge=not-found";
            string abilityDiagnostics = buddyAbilityController != null ? buddyAbilityController.BuildDiagnosticsLabel() : "Abilities=not-found";
            string guideDiagnostics = buddyKiGuideController != null ? buddyKiGuideController.BuildDiagnosticsLabel() : "Guide=not-found";
            GUI.Box(new Rect(left - 6f, top - diagnosticsHeight - 8f, width + 12f, diagnosticsHeight), "");
            GUI.Label(new Rect(left + 4f, top - diagnosticsHeight, width - 8f, diagnosticsHeight - 8f), "Status: " + lastStatus + "\nPage: " + (debugPage + 1) + "/5 - " + GetPageTitle() + "\nDiag: " + diagnostics + "\nNav: " + navDiagnostics + "\nAnchor: " + anchorDiagnostics + "\nBridge: " + bridgeDiagnostics + "\nAbility: " + abilityDiagnostics + "\nGuide: " + guideDiagnostics, labelStyle);
        }

        if (GUI.Button(new Rect(left, top, width, height), compactMode ? "Debug zeigen" : "Debug klein", buttonStyle)) ToggleCompactMode();
        if (compactMode) return;
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), showDiagnostics ? "Diagnose aus" : "Diagnose an", buttonStyle)) ToggleDiagnostics();

        float pageTop = top + debugRowGap * 2f;
        float tabGap = 8f;
        float tabWidth = (width - tabGap * 4f) / 5f;
        if (GUI.Button(new Rect(left, pageTop, tabWidth, height), "Rueckruf", buttonStyle)) SetDebugPage(0);
        if (GUI.Button(new Rect(left + tabWidth + tabGap, pageTop, tabWidth, height), "Visual", buttonStyle)) SetDebugPage(1);
        if (GUI.Button(new Rect(left + 2f * (tabWidth + tabGap), pageTop, tabWidth, height), "Faehigk.", buttonStyle)) SetDebugPage(2);
        if (GUI.Button(new Rect(left + 3f * (tabWidth + tabGap), pageTop, tabWidth, height), "Guide", buttonStyle)) SetDebugPage(3);
        if (GUI.Button(new Rect(left + 4f * (tabWidth + tabGap), pageTop, tabWidth, height), "Auto/Move", buttonStyle)) SetDebugPage(4);

        float contentTop = top + debugRowGap * 3f;
        if (debugPage == 0) DrawReturnPage(left, contentTop, width, height, buttonStyle);
        else if (debugPage == 1) DrawVisualPage(left, contentTop, width, height, buttonStyle);
        else if (debugPage == 2) DrawAbilityPage(left, contentTop, width, height, buttonStyle);
        else if (debugPage == 3) DrawGuidePage(left, contentTop, width, height, buttonStyle);
        else DrawAutoAndMovementPage(left, contentTop, width, height, buttonStyle);
    }

    private void DrawReturnPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Buddy rufen", buttonStyle)) CallBuddyToUser();
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), "Rueckruf testen", buttonStyle)) RequestAutoReturnOnce();
        string autoLabel = "Auto: " + (autoReturnController != null && autoReturnController.AutoReturnEnabled ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, top + debugRowGap * 2f, width, height), autoLabel, buttonStyle)) ToggleAutoReturn();
        string farOnlyLabel = "Nur weit weg: " + (autoReturnController != null && autoReturnController.OnlyReturnWhenFar ? "AN" : "AUS");
        if (GUI.Button(new Rect(left, top + debugRowGap * 3f, width, height), farOnlyLabel, buttonStyle)) ToggleFarOnly();
    }

    private void DrawVisualPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Idle AN/AUS", buttonStyle)) ToggleBuddyIdleMotion();
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), "Blick AN/AUS", buttonStyle)) ToggleBuddyLookAt();
        if (GUI.Button(new Rect(left, top + debugRowGap * 2f, width, height), "Diagnose reset", buttonStyle)) ResetDiagnostics();
    }

    private void DrawAbilityPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Fähigkeiten AN/AUS", buttonStyle)) ToggleDemoAbilities();
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), "Scan testen", buttonStyle)) TestScanAbility();
        if (GUI.Button(new Rect(left, top + debugRowGap * 2f, width, height), "Hinweis holen testen", buttonStyle)) TestFetchAbility();
        if (GUI.Button(new Rect(left, top + debugRowGap * 3f, width, height), "Tragen testen", buttonStyle)) TestCarryAbility();
        if (GUI.Button(new Rect(left, top + debugRowGap * 4f, width, height), "Zeigen testen", buttonStyle)) TestPointAbility();
    }

    private void DrawGuidePage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Mission: Gehen", buttonStyle)) TestGuideWalkMission();
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), "Mission: Scannen", buttonStyle)) TestGuideScanMission();
        if (GUI.Button(new Rect(left, top + debugRowGap * 2f, width, height), "Fehlt: Sprungboost", buttonStyle)) TestGuideMissingJumpBoost();
        if (GUI.Button(new Rect(left, top + debugRowGap * 3f, width, height), "Guide leeren", buttonStyle)) ClearGuide();
        if (GUI.Button(new Rect(left, top + debugRowGap * 4f, width, height), "Diagnose reset", buttonStyle)) ResetDiagnostics();
    }

    private void DrawAutoAndMovementPage(float left, float top, float width, float height, GUIStyle buttonStyle)
    {
        if (GUI.Button(new Rect(left, top, width, height), "Timing schnell", buttonStyle)) UseFastTiming();
        if (GUI.Button(new Rect(left, top + debugRowGap, width, height), "Timing normal", buttonStyle)) UseNormalTiming();
        if (GUI.Button(new Rect(left, top + debugRowGap * 2f, width, height), "Abstand Test", buttonStyle)) UseTestDistance();
        if (GUI.Button(new Rect(left, top + debugRowGap * 3f, width, height), "Abstand Produkt", buttonStyle)) UseProductDistance();
        if (GUI.Button(new Rect(left, top + debugRowGap * 4f, width, height), "Klettern testen", buttonStyle)) TestClimbAbility();
        if (GUI.Button(new Rect(left, top + debugRowGap * 5f, width, height), "Sprung testen", buttonStyle)) TestJumpAbility();
    }
}
