using System;
using UnityEngine;

public class BuddyMovementController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float walkSpeed = 0.55f;
    [SerializeField] private float rotationSpeed = 8f;
    [SerializeField] private float reachedDistance = 0.03f;

    [Header("Movement Rules")]
    [SerializeField] private float maxSingleMoveDistance = 3f;
    [SerializeField] private float maxHeightDifference = 0.45f;

    private Transform buddyTransform;
    private Vector3 targetPosition;
    private bool isMoving;
    private Action onReachedTarget;

    public bool IsMoving => isMoving;
    public float WalkSpeed => walkSpeed;
    public float MaxSingleMoveDistance => maxSingleMoveDistance;
    public float MaxHeightDifference => maxHeightDifference;

    public void SetBuddy(Transform buddy)
    {
        buddyTransform = buddy;
        isMoving = false;
        onReachedTarget = null;
    }

    public bool CanMoveTo(Vector3 worldTarget, out string reason)
    {
        reason = string.Empty;

        if (buddyTransform == null)
        {
            reason = "Buddy transform missing.";
            return false;
        }

        float horizontalDistance = HorizontalDistance(buddyTransform.position, worldTarget);

        if (horizontalDistance > maxSingleMoveDistance)
        {
            reason = "Target too far away.";
            return false;
        }

        float heightDifference = Mathf.Abs(worldTarget.y - buddyTransform.position.y);

        if (heightDifference > maxHeightDifference)
        {
            reason = "Height difference too large.";
            return false;
        }

        return true;
    }

    public bool MoveTo(Vector3 worldTarget, Action reachedCallback = null)
    {
        if (!CanMoveTo(worldTarget, out string reason))
        {
            Debug.LogWarning("BuddyMovementController: Cannot move. " + reason);
            return false;
        }

        targetPosition = worldTarget;
        onReachedTarget = reachedCallback;
        isMoving = true;

        return true;
    }

    public void ForceMoveTo(Vector3 worldTarget, Action reachedCallback = null)
    {
        targetPosition = worldTarget;
        onReachedTarget = reachedCallback;
        isMoving = true;
    }

    public void Stop()
    {
        isMoving = false;
        onReachedTarget = null;
    }

    private void Update()
    {
        UpdateMovement();
    }

    private void UpdateMovement()
    {
        if (!isMoving || buddyTransform == null)
        {
            return;
        }

        Vector3 current = buddyTransform.position;
        Vector3 next = Vector3.MoveTowards(
            current,
            targetPosition,
            walkSpeed * Time.deltaTime
        );

        buddyTransform.position = next;

        RotateTowardsTarget(current, targetPosition);

        if (Vector3.Distance(next, targetPosition) <= reachedDistance)
        {
            buddyTransform.position = targetPosition;
            isMoving = false;

            Action callback = onReachedTarget;
            onReachedTarget = null;

            callback?.Invoke();
        }
    }

    private void RotateTowardsTarget(Vector3 current, Vector3 target)
    {
        Vector3 direction = target - current;
        direction.y = 0f;

        if (direction.sqrMagnitude < 0.001f)
        {
            return;
        }

        Quaternion targetRotation = Quaternion.LookRotation(direction.normalized, Vector3.up);

        buddyTransform.rotation = Quaternion.Slerp(
            buddyTransform.rotation,
            targetRotation,
            Time.deltaTime * rotationSpeed
        );
    }

    private float HorizontalDistance(Vector3 a, Vector3 b)
    {
        a.y = 0f;
        b.y = 0f;
        return Vector3.Distance(a, b);
    }
}