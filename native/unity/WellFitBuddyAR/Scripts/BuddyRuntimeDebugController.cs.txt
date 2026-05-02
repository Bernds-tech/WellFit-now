using UnityEngine;

public class BuddyRuntimeDebugController : MonoBehaviour
{
    public WellFitNativeBridge bridge;
    public BuddyAnchorController anchorController;
    public BuddyCompanionController companionController;
    public BuddyKiGuideController guideController;
    public BuddyAbilityController abilityController;

    public bool showDebugUi = true;
    public int buttonHeight = 96;
    public int buttonWidth = 520;
    public int fontSize = 28;
    public int statusFontSize = 24;
    public int gap = 14;

    private string lastAction = "runtime-debug-ready";
    private Vector2 scroll;
    private GUIStyle panelStyle;
    private GUIStyle buttonStyle;
    private GUIStyle labelStyle;
    private GUIStyle statusStyle;
    private Texture2D panelTexture;
    private Texture2D buttonTexture;
    private Texture2D buttonActiveTexture;

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void EnsureRuntimeDebugController()
    {
        if (FindObjectOfType<BuddyRuntimeDebugController>() != null) return;

        GameObject host = new GameObject("BuddyRuntimeDebugController");
        host.AddComponent<BuddyRuntimeDebugController>();
        DontDestroyOnLoad(host);
    }

    void Awake()
    {
        ResolveReferences();
        BuildStyles();
    }

    void Update()
    {
        if (bridge == null || anchorController == null || companionController == null || guideController == null)
        {
            ResolveReferences();
        }

        if (Input.GetKeyDown(KeyCode.F1))
        {
            showDebugUi = !showDebugUi;
        }
    }

    private void ResolveReferences()
    {
        if (bridge == null) bridge = FindObjectOfType<WellFitNativeBridge>();
        if (anchorController == null) anchorController = FindObjectOfType<BuddyAnchorController>();
        if (companionController == null) companionController = FindObjectOfType<BuddyCompanionController>();
        if (guideController == null) guideController = FindObjectOfType<BuddyKiGuideController>();
        if (abilityController == null) abilityController = FindObjectOfType<BuddyAbilityController>();
    }

    void OnGUI()
    {
        if (!showDebugUi) return;
        if (panelStyle == null || buttonStyle == null || labelStyle == null || statusStyle == null)
        {
            BuildStyles();
        }

        GUI.depth = -100;

        int safeMargin = 18;
        int panelWidth = Mathf.Min(Screen.width - safeMargin * 2, buttonWidth + 48);
        int panelHeight = Mathf.Min(Screen.height - safeMargin * 2, 980);

        GUILayout.BeginArea(new Rect(safeMargin, safeMargin, panelWidth, panelHeight), panelStyle);
        scroll = GUILayout.BeginScrollView(scroll, GUILayout.Width(panelWidth - 8), GUILayout.Height(panelHeight - 8));

        GUILayout.Label("WellFit AR Buddy Debug", labelStyle);
        GUILayout.Space(gap);
        GUILayout.Label(BuildStatusLine(), statusStyle);
        GUILayout.Space(gap);
        GUILayout.Label("Letzte Aktion: " + lastAction, statusStyle);
        GUILayout.Space(gap * 2);

        if (DebugButton("PLACE / MOVE CENTER"))
        {
            NotifyUi();
            PlaceOrMoveCenter();
        }

        if (DebugButton("BUDDY RUECKRUF"))
        {
            NotifyUi();
            if (bridge != null)
            {
                bridge.CallBuddyToUser();
                lastAction = "recall-requested";
            }
            else
            {
                lastAction = "bridge-missing";
            }
        }

        GUILayout.BeginHorizontal();
        if (GUILayout.Button("AUTO AN", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            SetAutoRecall(true);
        }
        GUILayout.Space(gap);
        if (GUILayout.Button("AUTO AUS", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            SetAutoRecall(false);
        }
        GUILayout.EndHorizontal();
        GUILayout.Space(gap);

        if (DebugButton("GUIDE: SCAN VORSCHLAGEN"))
        {
            NotifyUi();
            if (guideController != null)
            {
                guideController.SuggestNextMission("debug_scan_mission", "runtime-debug");
                lastAction = "guide-scan-suggested";
            }
            else
            {
                lastAction = "guide-missing";
            }
        }

        if (DebugButton("GUIDE: SPRUNG ERKLAEREN"))
        {
            NotifyUi();
            if (guideController != null)
            {
                guideController.ExplainMissingCapability("jumpBoost");
                lastAction = "guide-jump-explained";
            }
            else
            {
                lastAction = "guide-missing";
            }
        }

        GUILayout.BeginHorizontal();
        if (GUILayout.Button("SCAN", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            PerformAbility(BuddyAbility.ScanObject);
        }
        GUILayout.Space(gap);
        if (GUILayout.Button("TRAGEN", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            PerformAbility(BuddyAbility.Carry);
        }
        GUILayout.EndHorizontal();
        GUILayout.Space(gap);

        GUILayout.BeginHorizontal();
        if (GUILayout.Button("MARKIEREN", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            PerformAbility(BuddyAbility.Mark);
        }
        GUILayout.Space(gap);
        if (GUILayout.Button("SPRUNG", buttonStyle, GUILayout.Height(buttonHeight), GUILayout.MinWidth((panelWidth - 70) / 2)))
        {
            NotifyUi();
            PerformAbility(BuddyAbility.JumpBoost);
        }
        GUILayout.EndHorizontal();
        GUILayout.Space(gap);

        if (DebugButton("DEBUG AUSBLENDEN"))
        {
            NotifyUi();
            showDebugUi = false;
        }

        GUILayout.Space(gap);
        GUILayout.Label("Hinweis: Wenn anchor/bridge/companion missing steht, ist WellFitARSystem in der Szene nicht verdrahtet.", statusStyle);

        GUILayout.EndScrollView();
        GUILayout.EndArea();
    }

    private bool DebugButton(string label)
    {
        bool clicked = GUILayout.Button(label, buttonStyle, GUILayout.Height(buttonHeight), GUILayout.Width(buttonWidth));
        GUILayout.Space(gap);
        return clicked;
    }

    private void NotifyUi()
    {
        if (bridge != null)
        {
            bridge.NotifyUiPressed();
        }
    }

    private void PlaceOrMoveCenter()
    {
        if (anchorController == null)
        {
            lastAction = "anchor-controller-missing";
            return;
        }

        Vector2 center = new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);
        bool ok = anchorController.HasBuddy
            ? anchorController.MoveBuddyToScreenPoint(center)
            : anchorController.PlaceBuddyAtScreenPoint(center);

        lastAction = ok ? "center-place-or-move-requested" : "center-place-or-move-failed";
        abilityController = FindObjectOfType<BuddyAbilityController>();
    }

    private void SetAutoRecall(bool enabled)
    {
        if (companionController != null)
        {
            companionController.SetAutoRecallEnabled(enabled);
            lastAction = enabled ? "auto-recall-on" : "auto-recall-off";
            return;
        }

        if (bridge != null)
        {
            bridge.SetAutoRecallJson("{\"enabled\":" + (enabled ? "true" : "false") + "}");
            lastAction = enabled ? "auto-recall-on-via-bridge" : "auto-recall-off-via-bridge";
            return;
        }

        lastAction = "auto-recall-controller-missing";
    }

    private void PerformAbility(BuddyAbility ability)
    {
        if (abilityController == null)
        {
            abilityController = FindObjectOfType<BuddyAbilityController>();
        }

        if (abilityController == null)
        {
            lastAction = "ability-controller-missing-place-buddy-first";
            return;
        }

        abilityController.bridge = bridge;
        abilityController.ApplyCapability("scanObject");
        abilityController.ApplyCapability("carry");
        abilityController.ApplyCapability("jumpBoost");
        abilityController.ApplyCapability("climbUp");
        abilityController.PerformAbility(ability, null);
        lastAction = "ability-" + ability.ToString();
    }

    private string BuildStatusLine()
    {
        string placed = anchorController != null && anchorController.HasBuddy ? "BUDDY: PLATZIERT" : "BUDDY: NICHT PLATZIERT";
        string anchor = anchorController != null ? "ANCHOR: " + anchorController.CurrentAnchorId : "ANCHOR: FEHLT";
        string bridgeState = bridge != null ? "BRIDGE: OK" : "BRIDGE: FEHLT";
        string companion = companionController != null ? "COMPANION: OK" : "COMPANION: FEHLT";
        string guide = guideController != null ? "GUIDE: OK" : "GUIDE: FEHLT";
        string ability = abilityController != null ? "ABILITY: OK" : "ABILITY: FEHLT";
        return placed + "\n" + anchor + "\n" + bridgeState + " | " + companion + "\n" + guide + " | " + ability;
    }

    private void BuildStyles()
    {
        panelTexture = MakeTexture(new Color(0.02f, 0.03f, 0.035f, 0.96f));
        buttonTexture = MakeTexture(new Color(0.03f, 0.28f, 0.32f, 1f));
        buttonActiveTexture = MakeTexture(new Color(0.08f, 0.55f, 0.62f, 1f));

        panelStyle = new GUIStyle(GUI.skin.box);
        panelStyle.normal.background = panelTexture;
        panelStyle.padding = new RectOffset(22, 22, 22, 22);
        panelStyle.margin = new RectOffset(0, 0, 0, 0);

        buttonStyle = new GUIStyle(GUI.skin.button);
        buttonStyle.normal.background = buttonTexture;
        buttonStyle.hover.background = buttonActiveTexture;
        buttonStyle.active.background = buttonActiveTexture;
        buttonStyle.normal.textColor = Color.white;
        buttonStyle.hover.textColor = Color.white;
        buttonStyle.active.textColor = Color.white;
        buttonStyle.fontSize = fontSize;
        buttonStyle.fontStyle = FontStyle.Bold;
        buttonStyle.alignment = TextAnchor.MiddleCenter;
        buttonStyle.padding = new RectOffset(16, 16, 12, 12);
        buttonStyle.margin = new RectOffset(0, 0, 0, 0);

        labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.fontSize = fontSize;
        labelStyle.fontStyle = FontStyle.Bold;
        labelStyle.normal.textColor = Color.white;
        labelStyle.wordWrap = true;

        statusStyle = new GUIStyle(GUI.skin.label);
        statusStyle.fontSize = statusFontSize;
        statusStyle.fontStyle = FontStyle.Bold;
        statusStyle.normal.textColor = Color.white;
        statusStyle.wordWrap = true;
    }

    private Texture2D MakeTexture(Color color)
    {
        Texture2D texture = new Texture2D(1, 1);
        texture.SetPixel(0, 0, color);
        texture.Apply();
        return texture;
    }
}
