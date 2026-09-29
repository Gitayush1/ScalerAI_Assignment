/**
 * useMedia — manages browser camera and microphone access.
 *
 * Architecture note:
 *   This hook is the single place that calls getUserMedia.
 *   The meeting room components consume this hook; they never call
 *   getUserMedia directly. Future WebRTC integration would extend
 *   this hook to also create RTCPeerConnection instances.
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseMediaReturn {
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoEnabled: boolean;
  cameraError: string | null;
  micError: string | null;
  toggleMute: () => void;
  toggleVideo: () => void;
  stopAll: () => void;
}

export function useMedia(): UseMediaReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Keep a ref so stopAll() always closes the current stream even after re-renders
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        setStream(s);
      } catch (err) {
        if (cancelled) return;
        const name = (err as DOMException).name;
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCameraError("Camera permission denied.");
          setMicError("Microphone permission denied.");
        } else if (name === "NotFoundError") {
          setCameraError("No camera found.");
          setMicError("No microphone found.");
        } else {
          setCameraError("Could not access camera.");
        }
        // Try audio-only fallback
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          if (!cancelled) {
            streamRef.current = audioOnly;
            setStream(audioOnly);
            setCameraError("Camera unavailable — audio only.");
          } else {
            audioOnly.getTracks().forEach((t) => t.stop());
          }
        } catch {
          // Both failed — user will see avatar fallback
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMute = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    s.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    const s = streamRef.current;
    if (!s) return;
    s.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setIsVideoEnabled((prev) => !prev);
  }, []);

  const stopAll = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return {
    stream,
    isMuted,
    isVideoEnabled,
    cameraError,
    micError,
    toggleMute,
    toggleVideo,
    stopAll,
  };
}
