"use client";

import { useEffect } from "react";

export function TrackAccess() {
  useEffect(() => {
    fetch("/api/user/track-access", { method: "POST" });
  }, []);

  return null;
}
