// Vorlage fuer Assets/Scripts/BuddyAvatarProfile.cs
// Lokales Unity-Profil fuer Darstellung, Stimmung und Companion-Radius.
// Wichtig: Dieses Script speichert keine produktkritischen Rewards, Punkte, XP oder Mission Completion.

using UnityEngine;

public enum BuddyMood
{
    Neutral,
    Happy,
    Curious,
    Tired,
    Focused,
    Playful
}

[CreateAssetMenu(fileName = "BuddyAvatarProfile", menuName = "WellFit/Buddy Avatar Profile")]
public class BuddyAvatarProfile : ScriptableObject
{
    [Header("Identity")]
    public string buddyId = "flammi_demo";
    public string displayName = "Flammi";
    public string species = "dragon";
    public string skinId = "starter_fire_dragon";

    [Header("Visual State")]
    public BuddyMood mood = BuddyMood.Curious;
    public string evolutionStage = "starter";
    public int visualLevel = 1;

    [Header("Companion Radius")]
    [Tooltip("Sicherer Nahbereich fuer erste reale AR-Tests.")]
    public float testCompanionRadiusMeters = 5f;

    [Tooltip("Produktziel laut Companion-Grundlogik. Wird erst nach stabilen Tests aktiv genutzt.")]
    public float productCompanionRadiusMeters = 25f;

    [Header("Equipment Loadout")]
    public string[] equippedItemIds = new string[0];
    public string[] visualCapabilityIds = new string[0];

    [Header("Authority Boundary")]
    public bool rewardsAuthorized = false;
    public bool missionCompletionAuthorized = false;
    public bool tokenOrWftAuthorized = false;

    public float GetSafeCompanionRadius(bool useProductRadius)
    {
        float candidate = useProductRadius ? productCompanionRadiusMeters : testCompanionRadiusMeters;
        return Mathf.Clamp(candidate, 1f, 50f);
    }
}
