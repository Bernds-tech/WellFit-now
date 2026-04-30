using UnityEngine;

public class BuddyController : MonoBehaviour
{
    [SerializeField] private Animator animator;
    [SerializeField] private Transform cameraTransform;

    void Awake()
    {
        if (cameraTransform == null && Camera.main != null)
        {
            cameraTransform = Camera.main.transform;
        }
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