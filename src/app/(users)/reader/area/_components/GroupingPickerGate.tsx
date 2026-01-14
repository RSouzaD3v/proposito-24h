"use client";

import { useEffect, useState } from "react";
import { BookHeart } from "lucide-react";
import { GroupingPickerModal } from "./grouping-daily/GroupingPickerModal";

interface GroupingDaily {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
}

interface Props {
  shouldShow: boolean;
  groupings: GroupingDaily[];
}

export function GroupingPickerGate({ shouldShow, groupings }: Props) {
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  // 🔹 Abre automaticamente quando o server mandar
  useEffect(() => {
    if (shouldShow) {
      setOpen(true);
      setShowBubble(false);
    }
  }, [shouldShow]);

  function handleClose() {
    setOpen(false);
    setShowBubble(true); // 🔥 ativa a bolinha
  }

  function handleOpen() {
    setOpen(true);
    setShowBubble(false);
  }

  return (
    <>
      <GroupingPickerModal
        open={open}
        onClose={handleClose}
        groupings={groupings}
      />

      {/* 🔵 BOLINHA FLUTUANTE */}
      {showBubble && (
        <button
          onClick={handleOpen}
          className="
            fixed bottom-16 right-6 z-9999
            w-14 h-14 rounded-full
            bg-background/90 backdrop-blur-xl
            border border-white/20
            shadow-2xl
            flex items-center justify-center
            hover:scale-105 transition
          "
          title="Escolher plano diário"
        >
          <BookHeart className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
