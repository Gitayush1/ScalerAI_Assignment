"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Settings, User, Bell, Monitor, Shield } from "lucide-react";

const sections = [
  {
    icon: User,
    title: "Profile",
    description: "Display name, avatar, and personal details.",
    value: "Ayush · ayush@meetly.app",
  },
  {
    icon: Monitor,
    title: "Audio & Video",
    description: "Default camera, microphone, and speaker settings.",
    value: "System defaults",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Meeting reminders and alerts.",
    value: "Enabled",
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    description: "Waiting rooms, meeting locks, and recording.",
    value: "Standard",
  },
];

export default function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Settings size={20} className="text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your Meetly preferences.</p>
          </div>
        </div>

        <div className="space-y-2">
          {sections.map(({ icon: Icon, title, description, value }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-600 shrink-0">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">Meetly v1.0.0</p>
          <p className="text-xs text-blue-500 mt-1">
            Authentication is intentionally omitted in this demo. All actions
            run as the default user "Ayush".
          </p>
        </div>
      </div>
    </AppShell>
  );
}
