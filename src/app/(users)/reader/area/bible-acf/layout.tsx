import type { ReactNode } from "react";

export default function BibleLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 pt-4 pb-10">{children}</div>;
}
