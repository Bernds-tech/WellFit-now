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

    void OnEnable()
    {
        activeOverlay = this;
    }

    void OnDisable()
    {
        if (activeOverlay == this)
        {
            activeOverlay = null;
        }
    }

    public static bool IsAnyDebugOverlayUnderScreenPoint(Vector2 screenPoint)
    {
        if (activeOverlay == null) return false;
        return activeOverlay.IsScreenPointOverDebugOverlay(screenPoint);
    }

    public bool IsScreenPointOverDebugOverlay(Vector2 screenPoint)
    {
        float guiY = Screen.height - screenPoint.y;
        Vector2 guiPoint = new Vector2(screenPoint.x, guiY);
        return debugInputBlockRect.Contains(guiPoint);
    }

    void OnGUI()
    {
        if (!showDebugButton)
        {
            return;
        }

        float horizontalMargin = 16f;
        float width = Mathf.Min(760f, Screen.width - (horizontalMargin * 2f));
        float height = Mathf.Max(minimumDebugButtonHeight, Screen.height * 0.044f);
        debugRowGap = height + 10f;
        float left = horizontalMargin;
        float top = showDiagnostics ? Screen.height - 760f : Screen.height - 520f;
        top = Mathf.Max(24f, top);

        float diagnosticsHeight = showDiagnostics ? Mathf.Max(232f, Screen.height * 0.15f) : 0f;

        float blockTop = showDiagnostics ? top - diagnosticsHeight - 12f : top - 8f;
        float maxRows = 10f;
        float blockHeight = diagnosticsHeight + (debugRowGap * maxRows);

        debugInputBlockRect = new Rect(left - 12f, blockTop, width + 24f, blockHeight);

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
            GUI.Box(new Rect(left - 6f, top - diagnosticsHeight - 8f, width + 12f, diagnosticsHeight), "");
        }

        if (GUI.Button(new Rect(left, top, width, height), compactMode ? "Debug zeigen" : "Debug klein", buttonStyle))
        {
            compactMode = !compactMode;
        }
    }
}
