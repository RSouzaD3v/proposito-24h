"use client";

import { useEffect } from "react";

export function TrackAccess() {
  useEffect(() => {
    fetch("/api/v1/reader/track-access", { method: "POST" });
  }, []);

  return null;
}
