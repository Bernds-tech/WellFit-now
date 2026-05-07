"use client";

import type { ComponentType } from "react";
import type { NotificationsForm } from "../types";
import SettingsCard from "./SettingsCard";

type NotificationKey = keyof NotificationsForm;

type ToggleButtonComponent = ComponentType<{
  enabled: boolean;
  onClick: () => void;
  toggleBase: string;
}>;

type NotificationsCardProps = {
  notifications: NotificationsForm;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateNotificationField: (key: NotificationKey, value: boolean) => void;
  saveNotifications: () => void | Promise<void>;
  ToggleButton: ToggleButtonComponent;
  toggleBase: string;
};

const notificationItems: { key: NotificationKey; label: string }[] = [
  { key: "missionReminder", label: "Missions-Erinnerung" },
  { key: "sleepReminder", label: "Schlaf-Erinnerung" },
  { key: "weeklyReport", label: "Wochenreport" },
  { key: "glitchAlert", label: "Glitch-Alarm" },
];

export default function NotificationsCard({
  notifications,
  saveButtonClass,
  isLoadingUser,
  updateNotificationField,
  saveNotifications,
  ToggleButton,
  toggleBase,
}: NotificationsCardProps) {
  return (
    <SettingsCard title="Benachrichtigungen">
      <div className="space-y-3">
        {notificationItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
          >
            <span>{item.label}</span>
            <ToggleButton
              enabled={notifications[item.key]}
              onClick={() => updateNotificationField(item.key, !notifications[item.key])}
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
