"use client";

import SettingsCard from "./SettingsCard";

export default function NotificationsCard({
  notifications,
  saveButtonClass,
  isLoadingUser,
  updateNotificationField,
  saveNotifications,
  ToggleButton,
  toggleBase,
}: any) {
  return (
    <SettingsCard title="Benachrichtigungen">
      <div className="space-y-3">
        {[
          { key: "missionReminder", label: "Missions-Erinnerung" },
          { key: "sleepReminder", label: "Schlaf-Erinnerung" },
          { key: "weeklyReport", label: "Wochenreport" },
          { key: "glitchAlert", label: "Glitch-Alarm" },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
          >
            <span>{item.label}</span>
            <ToggleButton
              enabled={notifications[item.key]}
              onClick={() =>
                updateNotificationField(item.key, !notifications[item.key])
              }
              toggleBase={toggleBase}
            />
          </div>
        ))}
      </div>

      <button
        className={saveButtonClass}
        onClick={saveNotifications}
        disabled={isLoadingUser}
      >
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
