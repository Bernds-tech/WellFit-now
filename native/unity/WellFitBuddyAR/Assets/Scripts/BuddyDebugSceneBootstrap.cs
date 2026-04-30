using UnityEngine;

public static class BuddyDebugSceneBootstrap
{
    private const string DebugObjectName = "BuddyCallDebug";

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    private static void InstallBuddyDebugControllers()
    {
        WellFitNativeBridge bridge = FindAnyBridge();
        BuddyAnchorController anchorController = FindAnyAnchorController();

        if (bridge == null || anchorController == null)
        {
            Debug.LogWarning("BuddyDebugSceneBootstrap: WellFitNativeBridge or BuddyAnchorController not found. Debug controls not installed.");
            return;
        }

        GameObject debugObject = GameObject.Find(DebugObjectName);
        if (debugObject == null)
        {
            debugObject = new GameObject(DebugObjectName);
        }

        BuddyCompanionAutoReturnController autoReturnController = debugObject.GetComponent<BuddyCompanionAutoReturnController>();
        if (autoReturnController == null)
        {
            autoReturnController = debugObject.AddComponent<BuddyCompanionAutoReturnController>();
        }

        BuddyCallDebugController debugController = debugObject.GetComponent<BuddyCallDebugController>();
        if (debugController == null)
        {
            debugController = debugObject.AddComponent<BuddyCallDebugController>();
        }

        debugController.ConfigureForScene(bridge, autoReturnController, true);
        autoReturnController.ConfigureForScene(anchorController, false);

        Debug.Log("BuddyDebugSceneBootstrap: BuddyCallDebug installed and wired.");
    }

    private static WellFitNativeBridge FindAnyBridge()
    {
        WellFitNativeBridge bridge = Object.FindObjectOfType<WellFitNativeBridge>();
        if (bridge != null)
        {
            return bridge;
        }

        WellFitNativeBridge[] allBridges = Resources.FindObjectsOfTypeAll<WellFitNativeBridge>();
        foreach (WellFitNativeBridge candidate in allBridges)
        {
            if (candidate == null) continue;
            ActivateSceneObject(candidate.gameObject);
            return candidate;
        }

        return null;
    }

    private static BuddyAnchorController FindAnyAnchorController()
    {
        BuddyAnchorController anchorController = Object.FindObjectOfType<BuddyAnchorController>();
        if (anchorController != null)
        {
            return anchorController;
        }

        BuddyAnchorController[] allAnchorControllers = Resources.FindObjectsOfTypeAll<BuddyAnchorController>();
        foreach (BuddyAnchorController candidate in allAnchorControllers)
        {
            if (candidate == null) continue;
            ActivateSceneObject(candidate.gameObject);
            return candidate;
        }

        return null;
    }

    private static void ActivateSceneObject(GameObject sceneObject)
    {
        if (sceneObject == null)
        {
            return;
        }

        if (!sceneObject.activeSelf)
        {
            sceneObject.SetActive(true);
        }
    }
}
