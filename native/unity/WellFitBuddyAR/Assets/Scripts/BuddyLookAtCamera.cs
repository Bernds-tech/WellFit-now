using UnityEngine;

public class BuddyLookAtCamera : MonoBehaviour
{
    [SerializeField] private Transform cameraTransform;
    [SerializeField] private float turnSpeed = 6f;
    [SerializeField] private bool keepUpright = true;
    [SerializeField] private bool lookAtEnabled = true;
    [SerializeField] private float minLookDistanceMeters = 0.25f;
    [SerializeField] private float maxLookDistanceMeters = 12f;

    public bool LookAtEnabled => lookAtEnabled;

    void Awake()
    {
        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }
    }

    public void SetLookAtEnabled(bool enabled)
    {
        lookAtEnabled = enabled;
    }

    void Update()
    {
        if (!lookAtEnabled || cameraTransform == null) return;

        Vector3 direction = cameraTransform.position - transform.position;

        if (keepUpright)
        {
            direction.y = 0f;
        }

        float distance = direction.magnitude;
        if (distance < minLookDistanceMeters || distance > maxLookDistanceMeters) return;
        if (direction.sqrMagnitude < 0.001f) return;

        Quaternion targetRotation = Quaternion.LookRotation(direction.normalized, Vector3.up);

        transform.rotation = Quaternion.Slerp(
            transform.rotation,
            targetRotation,
            Time.deltaTime * turnSpeed
        );
    }
}