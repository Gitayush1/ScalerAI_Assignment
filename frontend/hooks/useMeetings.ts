/**
 * useMeetings — fetches upcoming and recent meetings for the dashboard.
 * Keeps data-fetching logic out of page components.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { getUpcomingMeetings, getRecentMeetings } from "@/lib/api";
import type { Meeting } from "@/types";

interface UseMeetingsReturn {
  upcoming: Meeting[];
  recent: Meeting[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMeetings(): UseMeetingsReturn {
  const [upcoming, setUpcoming] = useState<Meeting[]>([]);
  const [recent, setRecent] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [up, rec] = await Promise.all([
        getUpcomingMeetings(),
        getRecentMeetings(),
      ]);
      setUpcoming(up);
      setRecent(rec);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load meetings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { upcoming, recent, loading, error, refresh: fetchAll };
}
