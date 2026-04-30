using UnityEngine;

public class BuddyCompanionController : MonoBehaviour
{
    [Header("Companion Behaviour")]
    [SerializeField] private bool autonomousMovement = true;
    [SerializeField] private float autoMoveEverySeconds = 5f;

    [Header("Follow User")]
    [SerializeField] private float maxDistanceFromCameraMeters = 5f;

    private Transform buddyTransform;
    private Transform cameraTransform;
    private BuddyMovementController movementController;

    private float autoMoveTimer;

    public bool AutonomousMovement => autonomousMovement;
    public float AutoMoveEverySeconds => autoMoveEverySeconds;
    public float MaxDistanceFromCameraMeters => maxDistanceFromCameraMeters;

    public void Initialize(
        Transform buddy,
        Transform cameraTarget,
        BuddyMovementController buddyMovementController
    )
    {
        buddyTransform = buddy;
        cameraTransform = cameraTarget;
        movementController = buddyMovementController;
        autoMoveTimer = 0f;
    }

    public void ResetTimer()
    {
        autoMoveTimer = 0f;
    }

    public bool ShouldFollowUser()
    {
        if (buddyTransform == null || cameraTransform == null)
        {
            return false;
        }

        float distance = HorizontalDistance(
            buddyTransform.position,
            cameraTransform.position
        );

        return distance > maxDistanceFromCameraMeters;
    }

    public bool ShouldAutoWander()
    {
        if (!autonomousMovement)
        {
            return false;
        }

        if (movementController != null && movementController.IsMoving)
        {
            return false;
        }

        if (buddyTransform == null)
        {
            return false;
        }

        autoMoveTimer += Time.deltaTime;

        return autoMoveTimer >= autoMoveEverySeconds;
    }

    public void MarkAutoWanderStarted()
    {
        autoMoveTimer = 0f;
    }

    public void SetAutonomousMovement(bool enabled)
    {
        autonomousMovement = enabled;
    }

    public void SetMaxDistanceFromCamera(float distanceMeters)
    {
        maxDistanceFromCameraMeters = Mathf.Max(0.5f, distanceMeters);
    }

    private float HorizontalDistance(Vector3 a, Vector3 b)
    {
        a.y = 0f;
        b.y = 0f;

        return Vector3.Distance(a, b);
    }
}