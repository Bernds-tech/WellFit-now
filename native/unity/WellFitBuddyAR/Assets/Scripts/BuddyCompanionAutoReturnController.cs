using UnityEngine;

public class BuddyCompanionAutoReturnController : MonoBehaviour
{
    [SerializeField] private BuddyAnchorController anchorController;
    [SerializeField] private Transform cameraTransform;
    [SerializeField] private Transform buddyTransform;

    [Header("Auto Return")]
    [SerializeField] private bool autoReturnEnabled = false;
    [SerializeField] private bool onlyReturnWhenFar = true;
    [SerializeField] private float checkEverySeconds = 8f;
    [SerializeField] private float cooldownAfterRequestSeconds = 4f;
    [SerializeField] private float nearDistanceMeters = 2f;
    [SerializeField] private float farDistanceMeters = 5f;

    [Header("Screen Target")]
    [SerializeField] private float normalizedScreenX = 0.5f;
    [SerializeField] private float normalizedScreenY = 0.35f;

    private float timer;
    private float cooldownTimer;
    private float currentDistanceMeters;
    private int requestCount;
    private int rejectCount;
    private string lastStatus = "Companion auto-return disabled";
    private string lastReason = "none";

    public bool AutoReturnEnabled => autoReturnEnabled;
    public bool OnlyReturnWhenFar => onlyReturnWhenFar;
    public float CurrentDistanceMeters => currentDistanceMeters;
    public float SecondsUntilNextCheck => Mathf.Max(0f, checkEverySeconds - timer);
    public float CooldownRemainingSeconds => Mathf.Max(0f, cooldownTimer);
    public int RequestCount => requestCount;
    public int RejectCount => rejectCount;
    public string LastStatus => lastStatus;
    public string LastReason => lastReason;

    void Awake()
    {
        if (anchorController == null)
        {
            anchorController = FindObjectOfType<BuddyAnchorController>();
        }

        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }
    }

    public void ConfigureForScene(BuddyAnchorController sceneAnchorController, bool enabledAtStart)
    {
        anchorController = sceneAnchorController;
        SetAutoReturnEnabled(enabledAtStart);
    }

    void Update()
    {
        RefreshBuddyTransform();
        RefreshDistance();

        if (cooldownTimer > 0f)
        {
            cooldownTimer -= Time.deltaTime;
        }

        if (!autoReturnEnabled)
        {
            return;
        }

        timer += Time.deltaTime;
        if (timer < checkEverySeconds)
        {
            if (onlyReturnWhenFar && buddyTransform != null && currentDistanceMeters < farDistanceMeters)
            {
                lastStatus = "Auto-Return AN: Buddy ist nah genug (" + currentDistanceMeters.ToString("0.00") + "m).";
            }
            else
            {
                lastStatus = "Auto-Return AN: wartet noch " + SecondsUntilNextCheck.ToString("0.0") + "s.";
            }
            return;
        }

        timer = 0f;
        RequestAutoReturn(false);
    }

    public void SetAutoReturnEnabled(bool enabled)
    {
        autoReturnEnabled = enabled;
        timer = 0f;
        cooldownTimer = 0f;
        lastStatus = enabled ? "Auto-Return eingeschaltet." : "Auto-Return ausgeschaltet.";
        Debug.Log(lastStatus);
    }

    public void ToggleAutoReturn()
    {
        SetAutoReturnEnabled(!autoReturnEnabled);
    }

    public void ToggleOnlyReturnWhenFar()
    {
        onlyReturnWhenFar = !onlyReturnWhenFar;
        lastStatus = onlyReturnWhenFar ? "Auto-Return nur bei Abstand aktiv." : "Auto-Return bei jedem Intervall aktiv.";
        Debug.Log(lastStatus);
    }

    public bool RequestAutoReturn()
    {
        return RequestAutoReturn(true);
    }

    public bool RequestAutoReturn(bool force)
    {
        if (anchorController == null)
        {
            rejectCount += 1;
            lastReason = "anchor-controller-missing";
            lastStatus = "Auto-return skipped: BuddyAnchorController missing";
            Debug.LogWarning(lastStatus);
            return false;
        }

        if (cooldownTimer > 0f && !force)
        {
            rejectCount += 1;
            lastReason = "cooldown";
            lastStatus = "Auto-return skipped: cooldown " + cooldownTimer.ToString("0.0") + "s";
            Debug.Log(lastStatus);
            return false;
        }

        RefreshBuddyTransform();
        RefreshDistance();

        if (onlyReturnWhenFar && !force && buddyTransform != null && currentDistanceMeters < farDistanceMeters)
        {
            rejectCount += 1;
            lastReason = "buddy-not-far";
            lastStatus = "Auto-Return prueft: Buddy ist nah genug (" + currentDistanceMeters.ToString("0.00") + "m).";
            Debug.Log(lastStatus);
            return false;
        }

        Vector2 screenPoint = new Vector2(
            Mathf.Clamp01(normalizedScreenX) * Screen.width,
            Mathf.Clamp01(normalizedScreenY) * Screen.height
        );

        bool started = anchorController.CallBuddyToScreenPoint(screenPoint);
        if (started)
        {
            requestCount += 1;
            lastReason = force ? "manual" : "auto";
            lastStatus = force ? "Manueller Rueckruf gestartet." : "Buddy ist weit weg: Auto-Return startet Rueckruf.";
            cooldownTimer = cooldownAfterRequestSeconds;
        }
        else
        {
            rejectCount += 1;
            lastReason = "controller-rejected";
            lastStatus = "Auto-Return wollte starten, aber keine passende Flaeche wurde gefunden.";
        }

        Debug.Log(lastStatus);
        return started;
    }

    public string BuildDiagnosticsLabel()
    {
        string distance = buddyTransform == null ? "no buddy" : currentDistanceMeters.ToString("0.00") + "m";
        return "Auto=" + (autoReturnEnabled ? "ON" : "OFF")
            + " | FarOnly=" + (onlyReturnWhenFar ? "ON" : "OFF")
            + " | Dist=" + distance
            + " | Next=" + SecondsUntilNextCheck.ToString("0.0") + "s"
            + " | Cool=" + CooldownRemainingSeconds.ToString("0.0") + "s"
            + " | Req=" + requestCount
            + " | Rej=" + rejectCount
            + " | Reason=" + lastReason;
    }

    private void RefreshDistance()
    {
        if (buddyTransform == null || cameraTransform == null)
        {
            currentDistanceMeters = 0f;
            return;
        }

        Vector3 a = buddyTransform.position;
        Vector3 b = cameraTransform.position;
        a.y = 0f;
        b.y = 0f;
        currentDistanceMeters = Vector3.Distance(a, b);
    }

    private void RefreshBuddyTransform()
    {
        if (buddyTransform != null)
        {
            return;
        }

        GameObject buddy = GameObject.Find("RuntimeBuddyPlaceholder");
        if (buddy == null)
        {
            buddy = GameObject.Find("RuntimeGreenBuddyBall");
        }
        if (buddy == null)
        {
            buddy = GameObject.Find("BuddyPlaceholder(Clone)");
        }
        if (buddy == null)
        {
            buddy = GameObject.Find("BuddyPlaceholder");
        }

        if (buddy != null)
        {
            buddyTransform = buddy.transform;
        }
    }
}
