using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using System.Collections.Generic;

public class BuddyAnchorController : MonoBehaviour
{
    [SerializeField] private GameObject buddyPrefab;
    [SerializeField] private WellFitNativeBridge bridge;
    [SerializeField] private BuddyNavigationController navigationController;

    [Header("AR Foundation")]
    [SerializeField] private ARRaycastManager raycastManager;
    [SerializeField] private ARAnchorManager anchorManager;

    [Header("Movement")]
    [SerializeField] private float jumpHeightThresholdMeters = 0.12f;

    private static readonly List<ARRaycastHit> hits = new List<ARRaycastHit>();

    private GameObject currentBuddy;
    private Transform currentAnchorTransform;
    private string currentAnchorId;
    private int anchorSequence;
    private int surfaceSequence;
    private string lastSurfaceId = "none";
    private string lastAnchorStatus = "not-placed";
    private string lastRaycastStatus = "none";
    private Vector3 lastHitPosition;

    public string LastSurfaceId => lastSurfaceId;
    public string LastAnchorStatus => lastAnchorStatus;
    public string LastRaycastStatus => lastRaycastStatus;
    public Vector3 LastHitPosition => lastHitPosition;

    public bool PlaceBuddyAtScreenPoint(Vector2 screenPoint)
    {
        if (!ValidateSetup()) return false;

        if (!TryGetPlanePose(screenPoint, out Pose pose, out TrackableId trackableId))
        {
            lastRaycastStatus = "place-no-plane";
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"No plane hit\",\"code\":\"ar-no-plane-hit\"}");
            return false;
        }

        ARAnchor anchor = CreateAnchor(pose);
        if (anchor == null)
        {
            lastAnchorStatus = "anchor-failed";
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"Anchor creation failed\",\"code\":\"ar-anchor-creation-failed\"}");
            return false;
        }

        currentAnchorTransform = anchor.transform;
        currentAnchorId = CreateAnchorId();
        string surfaceId = CreateSurfaceId(trackableId);
        lastSurfaceId = surfaceId;
        lastAnchorStatus = "placed";
        lastHitPosition = pose.position;

        bridge?.SendEventToWellFit("onAnchorCreated", "{\"anchorId\":\"" + currentAnchorId + "\",\"surfaceId\":\"" + surfaceId + "\"}");

        if (currentBuddy == null)
        {
            currentBuddy = Instantiate(buddyPrefab, anchor.transform);
            currentBuddy.transform.localPosition = Vector3.zero;
            currentBuddy.transform.localRotation = Quaternion.identity;
            EnsureNavigationController();
        }
        else
        {
            currentBuddy.transform.SetParent(anchor.transform, false);
            currentBuddy.transform.localPosition = Vector3.zero;
            currentBuddy.transform.localRotation = Quaternion.identity;
        }

        bridge?.SendEventToWellFit("onBuddyPlaced", "{\"anchorId\":\"" + currentAnchorId + "\",\"surfaceId\":\"" + surfaceId + "\",\"status\":\"placed\",\"source\":\"plane-raycast\"}");
        return true;
    }

    public bool MoveBuddyToScreenPoint(Vector2 screenPoint)
    {
        if (currentBuddy == null)
        {
            return PlaceBuddyAtScreenPoint(screenPoint);
        }

        if (!ValidateSetup()) return false;

        if (!TryGetPlanePose(screenPoint, out Pose pose, out TrackableId trackableId))
        {
            lastRaycastStatus = "move-no-plane";
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"No movement plane hit\",\"code\":\"ar-no-movement-plane-hit\"}");
            return false;
        }

        EnsureNavigationController();
        string surfaceId = CreateSurfaceId(trackableId);
        lastSurfaceId = surfaceId;
        lastHitPosition = pose.position;
        Vector3 targetPosition = pose.position;

        if (navigationController == null)
        {
            currentBuddy.transform.position = targetPosition;
            bridge?.SendEventToWellFit("onBuddyActionCompleted", "{\"action\":\"move\",\"mode\":\"teleport-fallback\",\"surfaceId\":\"" + surfaceId + "\"}");
            return true;
        }

        navigationController.SetBridge(bridge);
        navigationController.SetTargetSurfaceId(surfaceId);

        Vector3 currentPosition = currentBuddy.transform.position;
        float heightDifference = targetPosition.y - currentPosition.y;
        bool shouldJump = Mathf.Abs(heightDifference) > jumpHeightThresholdMeters;
        bool started = shouldJump
            ? navigationController.JumpTo(targetPosition)
            : navigationController.WalkTo(targetPosition);

        if (!started)
        {
            lastAnchorStatus = "navigation-rejected";
            return false;
        }

        string action = shouldJump ? "jumpToSurface" : "walkToSurface";
        bridge?.SendEventToWellFit("onBuddyActionStarted", "{\"action\":\"" + action + "\",\"surfaceId\":\"" + surfaceId + "\",\"anchorId\":\"" + currentAnchorId + "\"}");
        return true;
    }

    public bool CallBuddyToScreenPoint(Vector2 screenPoint)
    {
        if (currentBuddy == null)
        {
            lastAnchorStatus = "buddy-not-placed";
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"Buddy not placed\",\"code\":\"buddy-not-placed\"}");
            return false;
        }

        if (!ValidateSetup()) return false;

        if (!TryGetPlanePose(screenPoint, out Pose pose, out TrackableId trackableId))
        {
            lastRaycastStatus = "call-no-plane";
            bridge?.SendEventToWellFit("onBuddyActionRejected", "{\"action\":\"callBuddyToUser\",\"reason\":\"no-plane-hit\"}");
            return false;
        }

        EnsureNavigationController();
        if (navigationController == null)
        {
            lastAnchorStatus = "navigation-missing";
            return false;
        }

        string surfaceId = CreateSurfaceId(trackableId);
        lastSurfaceId = surfaceId;
        lastHitPosition = pose.position;
        navigationController.SetBridge(bridge);
        navigationController.SetTargetSurfaceId(surfaceId);
        bool started = navigationController.WalkTo(pose.position, "returnToUser");

        if (!started)
        {
            lastAnchorStatus = "return-rejected";
            return false;
        }

        bridge?.SendEventToWellFit("onBuddyActionStarted", "{\"action\":\"returnToUser\",\"surfaceId\":\"" + surfaceId + "\",\"anchorId\":\"" + currentAnchorId + "\"}");
        return true;
    }

    public void CallBuddyToCamera(Vector3 cameraForwardPoint)
    {
        if (currentBuddy == null)
        {
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"Buddy not placed\",\"code\":\"buddy-not-placed\"}");
            return;
        }

        EnsureNavigationController();
        if (navigationController != null)
        {
            navigationController.SetBridge(bridge);
            navigationController.SetTargetSurfaceId("user-forward-point");
            bool started = navigationController.WalkTo(cameraForwardPoint, "returnToUser");
            if (started)
            {
                bridge?.SendEventToWellFit("onBuddyActionStarted", "{\"action\":\"returnToUser\"}");
            }
        }
    }

    public string BuildDiagnosticsLabel()
    {
        return "Anchor=" + lastAnchorStatus
            + " | Raycast=" + lastRaycastStatus
            + " | Surface=" + lastSurfaceId
            + " | Hit=" + lastHitPosition.ToString("F2");
    }

    private bool ValidateSetup()
    {
        if (buddyPrefab == null)
        {
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"Buddy prefab missing\",\"code\":\"buddy-prefab-missing\"}");
            return false;
        }

        if (raycastManager == null)
        {
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"ARRaycastManager missing\",\"code\":\"ar-raycast-manager-missing\"}");
            return false;
        }

        if (anchorManager == null)
        {
            bridge?.SendEventToWellFit("onArError", "{\"message\":\"ARAnchorManager missing\",\"code\":\"ar-anchor-manager-missing\"}");
            return false;
        }

        return true;
    }

    private bool TryGetPlanePose(Vector2 screenPoint, out Pose pose, out TrackableId trackableId)
    {
        pose = default;
        trackableId = TrackableId.invalidId;

        if (!raycastManager.Raycast(screenPoint, hits, TrackableType.PlaneWithinPolygon))
        {
            return false;
        }

        ARRaycastHit hit = hits[0];
        pose = hit.pose;
        trackableId = hit.trackableId;
        lastRaycastStatus = "hit";
        return true;
    }

    private ARAnchor CreateAnchor(Pose pose)
    {
        return anchorManager.AddAnchor(pose);
    }

    private void EnsureNavigationController()
    {
        if (navigationController != null) return;
        if (currentBuddy == null) return;

        navigationController = currentBuddy.GetComponent<BuddyNavigationController>();
        if (navigationController == null)
        {
            navigationController = currentBuddy.AddComponent<BuddyNavigationController>();
        }

        navigationController.buddyRoot = currentBuddy.transform;
        navigationController.SetBridge(bridge);
    }

    private string CreateAnchorId()
    {
        anchorSequence += 1;
        return "anchor_" + anchorSequence.ToString("000");
    }

    private string CreateSurfaceId(TrackableId trackableId)
    {
        surfaceSequence += 1;
        if (trackableId == TrackableId.invalidId)
        {
            return "surface_" + surfaceSequence.ToString("000");
        }

        return "surface_" + trackableId.ToString();
    }
}
