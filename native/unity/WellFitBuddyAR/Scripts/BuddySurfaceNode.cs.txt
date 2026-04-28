using UnityEngine;

public enum BuddySurfaceKind
{
    Unknown,
    Floor,
    Table,
    Couch,
    Shelf,
    Platform
}

public class BuddySurfaceNode : MonoBehaviour
{
    public string surfaceId = "surface_manual_001";
    public BuddySurfaceKind surfaceKind = BuddySurfaceKind.Unknown;
    public float confidence = 0.5f;
    public bool isWalkable = true;
    public bool isJumpTarget = true;
    public float surfaceHeight;

    void Awake()
    {
        surfaceHeight = transform.position.y;
        if (string.IsNullOrEmpty(surfaceId))
        {
            surfaceId = "surface_manual";
        }
    }
}
