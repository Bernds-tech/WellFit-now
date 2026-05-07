using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem.EnhancedTouch;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

public class SimpleARPlacementTest : MonoBehaviour
{
    [Header("AR Foundation")]
    [SerializeField] private ARRaycastManager raycastManager;
    [SerializeField] private ARAnchorManager anchorManager;
    [SerializeField] private Transform cameraTransform;

    [Header("Buddy")]
    [SerializeField] private GameObject buddyPrefab;
    [SerializeField] private BuddyMovementController movementController;

    [Header("Placement")]
    [SerializeField] private float heightOffset = 0.08f;

    [Header("Autonomous Companion Behaviour")]
    [SerializeField] private bool autonomousMovement = true;
    [SerializeField] private float autoMoveEverySeconds = 5f;

    // Für Zimmer/Garten-Test: 5 Meter.
    // Für Produktlogik später: ca. 25 Meter.
    [SerializeField] private float maxDistanceFromCameraMeters = 5f;

    private static readonly List<ARRaycastHit> hits = new List<ARRaycastHit>();

    private GameObject anchorRoot;
    private GameObject buddy;

    private bool isPlaced;
    private float autoMoveTimer;

    private string status = "Ready: tap a real floor/table point to place Buddy.";

    void OnEnable()
    {
        EnhancedTouchSupport.Enable();
    }

    void OnDisable()
    {
        EnhancedTouchSupport.Disable();
    }

    void Awake()
    {
        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }

        if (movementController == null)
        {
            movementController = GetComponent<BuddyMovementController>();
        }

        if (movementController == null)
        {
            movementController = gameObject.AddComponent<BuddyMovementController>();
        }
    }

    void Update()
    {
        HandleTouch();
        UpdateAutonomousBehaviour();
    }

    private void HandleTouch()
    {
        var touches = UnityEngine.InputSystem.EnhancedTouch.Touch.activeTouches;

        if (touches.Count == 0)
        {
            return;
        }

        var touch = touches[0];

        if (touch.phase != UnityEngine.InputSystem.TouchPhase.Began)
        {
            return;
        }

        TryHandleTap(touch.screenPosition);
    }

    private void TryHandleTap(Vector2 screenPosition)
    {
        if (raycastManager == null)
        {
            status = "ERROR: Raycast Manager missing. Connect XR Origin.";
            Debug.LogError(status);
            return;
        }

        if (!raycastManager.Raycast(screenPosition, hits, TrackableType.PlaneWithinPolygon))
        {
            status = "No plane hit. Move phone slowly over textured floor/table and tap again.";
            Debug.Log(status);
            return;
        }

        Pose pose = hits[0].pose;
        Vector3 worldPoint = pose.position + Vector3.up * heightOffset;

        if (!isPlaced || buddy == null)
        {
            PlaceBuddyAt(pose, worldPoint);
        }
        else
        {
            MoveBuddyTo(pose, worldPoint, "manual-tap", false);
        }
    }

    private void PlaceBuddyAt(Pose pose, Vector3 worldPoint)
    {
        anchorRoot = CreateAnchorRoot(pose, "BuddyWorldAnchor");

        if (buddyPrefab != null)
        {
            buddy = Instantiate(buddyPrefab);
            buddy.name = "RuntimeBuddyPlaceholder";
        }
        else
        {
            buddy = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            buddy.name = "RuntimeGreenBuddyBall";

            Renderer renderer = buddy.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = Color.green;
            }

            buddy.transform.localScale = Vector3.one * 0.15f;
        }

        buddy.transform.SetPositionAndRotation(worldPoint, Quaternion.identity);
        buddy.transform.SetParent(anchorRoot.transform, true);

        movementController.SetBuddy(buddy.transform);

        isPlaced = true;
        autoMoveTimer = 0f;

        status = "Buddy placed. Tap another real surface or wait for autonomous movement.";
        Debug.Log(status);
    }

    private GameObject CreateAnchorRoot(Pose pose, string name)
    {
        GameObject root = new GameObject(name);
        root.transform.SetPositionAndRotation(pose.position, pose.rotation);

        if (anchorManager != null)
        {
            ARAnchor anchor = root.AddComponent<ARAnchor>();

            if (anchor == null)
            {
                Debug.LogWarning("ARAnchor component failed. Object may still be stable while tracking is active.");
            }
        }
        else
        {
            Debug.LogWarning("Anchor Manager missing. Buddy anchor root created without ARAnchorManager reference.");
        }

        return root;
    }

    private void MoveBuddyTo(Pose pose, Vector3 worldPoint, string source, bool forceMove)
    {
        if (movementController == null || buddy == null)
        {
            status = "ERROR: Movement Controller or Buddy missing.";
            Debug.LogError(status);
            return;
        }

        bool started;

        if (forceMove)
        {
            movementController.ForceMoveTo(
                worldPoint,
                () => OnBuddyReachedTarget(pose, source)
            );

            started = true;
        }
        else
        {
            started = movementController.MoveTo(
                worldPoint,
                () => OnBuddyReachedTarget(pose, source)
            );
        }

        if (!started)
        {
            status = "Movement rejected. Target may be too far or too high. Tap closer.";
            Debug.LogWarning(status);
            return;
        }

        autoMoveTimer = 0f;
        status = "Buddy moving to " + source + " target.";
        Debug.Log(status);
    }

    private void OnBuddyReachedTarget(Pose pose, string source)
    {
        ReanchorBuddyAt(pose);

        if (source == "follow-user")
        {
            status = "Buddy returned near you and re-anchored.";
        }
        else if (source == "auto-wander")
        {
            status = "Buddy wandered to a nearby real-world point and re-anchored.";
        }
        else
        {
            status = "Buddy reached target and re-anchored.";
        }

        Debug.Log(status);
    }

    private void ReanchorBuddyAt(Pose pose)
    {
        if (buddy == null)
        {
            return;
        }

        GameObject newAnchorRoot = CreateAnchorRoot(pose, "BuddyWorldAnchor_Reanchored");

        buddy.transform.SetParent(newAnchorRoot.transform, true);

        if (anchorRoot != null)
        {
            Destroy(anchorRoot);
        }

        anchorRoot = newAnchorRoot;

        if (movementController != null)
        {
            movementController.SetBuddy(buddy.transform);
        }
    }

    private void UpdateAutonomousBehaviour()
    {
        if (!autonomousMovement || buddy == null || movementController == null)
        {
            return;
        }

        if (movementController.IsMoving)
        {
            return;
        }

        autoMoveTimer += Time.deltaTime;

        if (cameraTransform != null)
        {
            float distanceToCamera = HorizontalDistance(buddy.transform.position, cameraTransform.position);

            if (distanceToCamera > maxDistanceFromCameraMeters)
            {
                TryMoveNearCamera();
                return;
            }
        }

        if (autoMoveTimer >= autoMoveEverySeconds)
        {
            autoMoveTimer = 0f;
            TryAutoWander();
        }
    }

    private void TryMoveNearCamera()
    {
        Vector2 screenPoint = new Vector2(Screen.width * 0.5f, Screen.height * 0.35f);

        if (raycastManager != null && raycastManager.Raycast(screenPoint, hits, TrackableType.PlaneWithinPolygon))
        {
            Pose pose = hits[0].pose;
            Vector3 worldPoint = pose.position + Vector3.up * heightOffset;

            MoveBuddyTo(pose, worldPoint, "follow-user", true);
        }
        else
        {
            status = "Buddy wants to follow, but no nearby plane was found.";
            Debug.Log(status);
        }
    }

    private void TryAutoWander()
    {
        if (raycastManager == null)
        {
            return;
        }

        for (int attempt = 0; attempt < 5; attempt++)
        {
            float x = Random.Range(Screen.width * 0.25f, Screen.width * 0.75f);
            float y = Random.Range(Screen.height * 0.25f, Screen.height * 0.65f);

            Vector2 screenPoint = new Vector2(x, y);

            if (raycastManager.Raycast(screenPoint, hits, TrackableType.PlaneWithinPolygon))
            {
                Pose pose = hits[0].pose;
                Vector3 worldPoint = pose.position + Vector3.up * heightOffset;

                MoveBuddyTo(pose, worldPoint, "auto-wander", false);
                return;
            }
        }

        status = "Auto-wander skipped: no valid nearby plane found.";
        Debug.Log(status);
    }

    private float HorizontalDistance(Vector3 a, Vector3 b)
    {
        a.y = 0f;
        b.y = 0f;

        return Vector3.Distance(a, b);
    }

    void OnGUI()
    {
        GUIStyle style = new GUIStyle();
        style.fontSize = 34;
        style.normal.textColor = Color.white;
        style.wordWrap = true;

        GUI.Box(new Rect(10, 10, Screen.width - 20, 170), "");
        GUI.Label(new Rect(25, 25, Screen.width - 50, 150), status, style);
    }
}