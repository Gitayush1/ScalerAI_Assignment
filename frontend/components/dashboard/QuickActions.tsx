"use client";

import { Video, LogIn, CalendarPlus } from "lucide-react";

interface QuickActionsProps {
  onNewMeeting: () => void;
  onJoin: () => void;
  onSchedule: () => void;
}

interface ActionDef {
  key: "new" | "join" | "schedule";
  label: string;
  description: string;
  icon: React.ElementType;
  bg: string;
  hover: string;
  textColor: string;
  descColor: string;
  border?: string;
}

const actions: ActionDef[] = [
  {
    key: "new",
    label: "New Meeting",
    description: "Start an instant meeting",
    icon: Video,
    bg: "bg-blue-600",
    hover: "hover:bg-blue-700",
    textColor: "text-white",
    descColor: "text-blue-100",
  },
  {
    key: "join",
    label: "Join",
    description: "Enter a meeting ID",
    icon: LogIn,
    bg: "bg-white",
    hover: "hover:bg-gray-50",
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    border: "border border-gray-200",
  },
  {
    key: "schedule",
    label: "Schedule",
    description: "Plan a future meeting",
    icon: CalendarPlus,
    bg: "bg-white",
    hover: "hover:bg-gray-50",
    textColor: "text-gray-900",
    descColor: "text-gray-500",
    border: "border border-gray-200",
  },
];

export function QuickActions({ onNewMeeting, onJoin, onSchedule }: QuickActionsProps) {
  const handlers: Record<string, () => void> = {
    new: onNewMeeting,
    join: onJoin,
    schedule: onSchedule,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.key}
            onClick={handlers[a.key]}
            className={`flex items-center gap-4 p-5 rounded-2xl shadow-sm transition-all duration-150 text-left w-full ${a.bg} ${a.hover} ${a.border ?? ""}`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                a.key === "new" ? "bg-blue-500" : "bg-blue-50"
              }`}
            >
              <Icon
                size={22}
                className={a.key === "new" ? "text-white" : "text-blue-600"}
              />
            </div>
            <div>
              <p className={`font-semibold text-base ${a.textColor}`}>{a.label}</p>
              <p className={`text-sm ${a.descColor}`}>{a.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
