using UnityEngine;

public class BuddyController : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private Transform cameraTransform;

    [Header("Idle Motion")]
    [SerializeField] private bool idleMotionEnabled = true;
    [SerializeField] private float idleBobHeight = 0.025f;
    [SerializeField] private float idleBobSpeed = 1.6f;
    [SerializeField] private float idleScalePulse = 0.018f;

    private Vector3 baseLocalPosition;
    private Vector3 baseLocalScale;

    void Awake()
    {
        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }

        baseLocalPosition = transform.localPosition;
        baseLocalScale = transform.localScale;
    }

    void Update()
    {
        UpdateIdleMotion();
    }

    public void SetIdleMotionEnabled(bool enabled)
    {
        idleMotionEnabled = enabled;
        if (!enabled)
        {
            transform.localPosition = baseLocalPosition;
            transform.localScale = baseLocalScale;
        }
    }

    private void UpdateIdleMotion()
    {
        if (!idleMotionEnabled)
        {
            return;
        }

        float wave = Mathf.Sin(Time.time * idleBobSpeed);
        transform.localPosition = baseLocalPosition + Vector3.up * (wave * idleBobHeight);
        transform.localScale = baseLocalScale * (1f + wave * idleScalePulse);
    }

    public void PlayIdle()
    {
        if (animator != null)
        {
            animator.SetTrigger("idle");
        }
    }

    public void PlayWalk()
    {
        if (animator != null)
        {
            animator.SetTrigger("walk");
        }
    }

    public void PlayHappy()
    {
        if (animator != null)
        {
            animator.SetTrigger("happy");
        }
    }

    public void PlayHop()
    {
        if (animator != null)
        {
            animator.SetTrigger("hop");
        }
    }
}