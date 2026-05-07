using UnityEngine;

public class BuddyInputController : MonoBehaviour
{
    [SerializeField] private BuddyAnchorController anchorController;
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private Camera arCamera;
    [SerializeField] private BuddyCallDebugController debugController;

    [Header("Input Behaviour")]
    public bool placeOnFirstTap = true;
    public bool moveOnNextTaps = true;
    public float minTapDistancePixels = 12f;

    [Header("Debug Overlay Input Guard")]
    [SerializeField] private bool blockDebugOverlayTouches = true;
    [SerializeField, Range(0.3f, 0.95f)] private float debugOverlaySafeWidthRatio = 0.82f;
    [SerializeField, Range(0.15f, 0.95f)] private float debugOverlaySafeHeightRatio = 0.46f;

    private bool buddyHasBeenPlaced;
    private Vector2 pointerDownPosition;
    private bool pointerDownStarted;
    private bool pointerDownBlockedByDebugOverlay;

    void Awake()
    {
        if (arCamera == null)
        {
            arCamera = Camera.main;
        }

        if (debugController == null)
        {
            debugController = FindObjectOfType<BuddyCallDebugController>();
        }
    }

    void Update()
    {
        HandleTouchInput();
        HandleMouseInputForEditor();
    }

    public void ResetPlacementState()
    {
        buddyHasBeenPlaced = false;
    }

    private void HandleTouchInput()
    {
        if (Input.touchCount == 0)
        {
            pointerDownBlockedByDebugOverlay = false;
            return;
        }

        Touch touch = Input.GetTouch(0);
        if (touch.phase == TouchPhase.Began)
        {
            pointerDownBlockedByDebugOverlay = IsDebugOverlayTouch(touch.position);
            if (pointerDownBlockedByDebugOverlay)
            {
                pointerDownStarted = false;
                return;
            }

            pointerDownStarted = true;
            pointerDownPosition = touch.position;
        }

        if (touch.phase == TouchPhase.Canceled)
        {
            pointerDownStarted = false;
            pointerDownBlockedByDebugOverlay = false;
            return;
        }

        if (touch.phase == TouchPhase.Ended)
        {
            if (pointerDownBlockedByDebugOverlay || IsDebugOverlayTouch(touch.position))
            {
                pointerDownStarted = false;
                pointerDownBlockedByDebugOverlay = false;
                return;
            }

            if (pointerDownStarted)
            {
                pointerDownStarted = false;
                if (Vector2.Distance(pointerDownPosition, touch.position) <= minTapDistancePixels)
                {
                    HandleScreenTap(touch.position);
                }
            }
        }
    }

    private void HandleMouseInputForEditor()
    {
#if UNITY_EDITOR
        if (Input.GetMouseButtonDown(0))
        {
            Vector2 downPosition = Input.mousePosition;
            pointerDownBlockedByDebugOverlay = IsDebugOverlayTouch(downPosition);
            if (pointerDownBlockedByDebugOverlay)
            {
                pointerDownStarted = false;
                return;
            }

            pointerDownStarted = true;
            pointerDownPosition = downPosition;
        }

        if (Input.GetMouseButtonUp(0))
        {
            Vector2 upPosition = Input.mousePosition;
            if (pointerDownBlockedByDebugOverlay || IsDebugOverlayTouch(upPosition))
            {
                pointerDownStarted = false;
                pointerDownBlockedByDebugOverlay = false;
                return;
            }

            if (pointerDownStarted)
            {
                pointerDownStarted = false;
                if (Vector2.Distance(pointerDownPosition, upPosition) <= minTapDistancePixels)
                {
                    HandleScreenTap(upPosition);
                }
            }
        }
#endif
    }

    private void HandleScreenTap(Vector2 screenPoint)
    {
        if (IsDebugOverlayTouch(screenPoint))
        {
            bridge?.SendEventToWellFit(
                "onBuddyActionRejected",
                "{\"reason\":\"tap-on-debug-overlay\",\"source\":\"screen-tap\"}"
            );
            return;
        }

        if (anchorController == null)
        {
            bridge?.SendEventToWellFit(
                "onArError",
                "{\"message\":\"BuddyAnchorController missing\",\"code\":\"buddy-anchor-controller-missing\"}"
            );
            return;
        }

        if (!buddyHasBeenPlaced && placeOnFirstTap)
        {
            bool placed = anchorController.PlaceBuddyAtScreenPoint(screenPoint);
            if (placed)
            {
                buddyHasBeenPlaced = true;
                bridge?.SendEventToWellFit(
                    "onBuddyActionStarted",
                    "{\"action\":\"placeFromTap\",\"source\":\"screen-tap\"}"
                );
            }
            return;
        }

        if (buddyHasBeenPlaced && moveOnNextTaps)
        {
            anchorController.MoveBuddyToScreenPoint(screenPoint);
            return;
        }

        bridge?.SendEventToWellFit(
            "onBuddyActionRejected",
            "{\"reason\":\"tap-ignored\",\"source\":\"screen-tap\"}"
        );
    }

    private bool IsDebugOverlayTouch(Vector2 screenPoint)
    {
        if (!blockDebugOverlayTouches)
        {
            return false;
        }

        if (BuddyCallDebugController.ShouldBlockArInputNow(screenPoint))
        {
            return true;
        }

        if (debugController == null)
        {
            debugController = FindObjectOfType<BuddyCallDebugController>();
        }

        if (debugController != null && debugController.IsScreenPointOverDebugOverlay(screenPoint))
        {
            return true;
        }

        if (BuddyCallDebugController.IsAnyDebugOverlayUnderScreenPoint(screenPoint))
        {
            return true;
        }

        return IsInsideDebugOverlaySafetyZone(screenPoint);
    }

    private bool IsInsideDebugOverlaySafetyZone(Vector2 screenPoint)
    {
        float safeWidth = Screen.width * debugOverlaySafeWidthRatio;
        float safeHeight = Screen.height * debugOverlaySafeHeightRatio;
        return screenPoint.x <= safeWidth && screenPoint.y <= safeHeight;
    }
}
