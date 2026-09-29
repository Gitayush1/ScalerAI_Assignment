/**
 * useToast — lightweight toast notification state.
 * Toasts auto-dismiss after 3 seconds.
 */

"use client";

import { useState, useCallback } from "react";
import type { Toast, ToastType } from "@/types";
import { localId } from "@/lib/utils";

interface UseToastReturn {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = localId();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  return { toasts, addToast, removeToast };
}
