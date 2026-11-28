"use client";

import { usePathname } from "next/navigation";
import { StudioSidebar, type StudioWriter } from "./StudioSidebar";

/** Telas que ocupam a janela inteira: a prévia roda dentro de um iframe com a moldura do leitor. */
const BARE = ["/writer/preview"];

export function StudioFrame({ writer, children }: { writer: StudioWriter; children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE.some((prefix) => pathname.startsWith(prefix))) return <>{children}</>;

  return (
    <div className="studio-shell relative isolate min-h-screen w-full md:grid md:grid-cols-[256px_minmax(0,1fr)]">
      <StudioSidebar writer={writer} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
