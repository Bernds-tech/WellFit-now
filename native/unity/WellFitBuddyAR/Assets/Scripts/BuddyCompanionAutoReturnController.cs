using UnityEngine;

public class BuddyCompanionAutoReturnController : MonoBehaviour
{
    [SerializeField] private BuddyAnchorController anchorController;
    [SerializeField] private bool autoReturnEnabled = false;
    [SerializeField] private float checkEverySeconds = 8f;
    [SerializeField] private float normalizedScreenX = 0.5f;
    [SerializeField] private float normalizedScreenY = 0.35f;

    private float timer;
    private string lastStatus = "Companion auto-return disabled";

    public bool AutoReturnEnabled => autoReturnEnabled;
    public string LastStatus => lastStatus;

    void Awake()
    {
        if (anchorController == null)
        {
            anchorController = FindObjectOfType<BuddyAnchorController>();
        }
    }

    void Update()
    {
        if (!autoReturnEnabled)
        {
            return;
        }

        timer += Time.deltaTime;
        if (timer < checkEverySeconds)
        {
            return;
        }

        timer = 0f;
        RequestAutoReturn();
    }

    public void SetAutoReturnEnabled(bool enabled)
    {
        autoReturnEnabled = enabled;
        timer = 0f;
        lastStatus = enabled ? "Companion auto-return enabled" : "Companion auto-return disabled";
        Debug.Log(lastStatus);
    }

    public void ToggleAutoReturn()
    {
        SetAutoReturnEnabled(!autoReturnEnabled);
    }

    public bool RequestAutoReturn()
    {
        if (anchorController == null)
        {
            lastStatus = "Auto-return skipped: BuddyAnchorController missing";
            Debug.LogWarning(lastStatus);
            return false;
        }

        Vector2 screenPoint = new Vector2(
            Mathf.Clamp01(normalizedScreenX) * Screen.width,
            Mathf.Clamp01(normalizedScreenY) * Screen.height
        );

        bool started = anchorController.CallBuddyToScreenPoint(screenPoint);
        lastStatus = started
            ? "Auto-return requested"
            : "Auto-return skipped or rejected";

        Debug.Log(lastStatus);
        return started;
    }
}
