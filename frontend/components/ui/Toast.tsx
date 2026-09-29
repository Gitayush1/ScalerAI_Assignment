"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import type { Toast as ToastType } from "@/types";

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const config = {
  success: {
    icon: CheckCircle,
    classes: "bg-green-50 border-green-200 text-green-800",
    iconClass: "text-green-500",
  },
  error: {
    icon: XCircle,
    classes: "bg-red-50 border-red-200 text-red-800",
    iconClass: "text-red-500",
  },
  info: {
    icon: Info,
    classes: "bg-blue-50 border-blue-200 text-blue-800",
    iconClass: "text-blue-500",
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { icon: Icon, classes, iconClass } = config[toast.type];
  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-sm",
        "animate-in slide-in-from-right-5 fade-in duration-300",
        classes
      )}
    >
      <Icon size={18} className={clsx("mt-0.5 shrink-0", iconClass)} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
