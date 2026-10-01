// app/reader/register/page.tsx
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GlassCard } from "@/components/ui/glass-card";
import { WriterShell } from "@/components/ui/writer-shell";
import { ReaderRegister } from "./_components/formRegister";

export default async function ReaderRegisterPage() {
  const h = headers();
  const host = (await h).get("host") || ""; // ex.: sub.example.com:3000

  // Defina seu domínio base (sem porta). Recomendado via env.
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "example.com";

  const hostname = host.split(":")[0]; // remove porta
  const isLocalhost = hostname.endsWith("localhost") || hostname.endsWith("lvh.me");

  const subdomain = (() => {
    if (isLocalhost) {
      // ex.: escritor.localhost
      const parts = hostname.split(".");
      return parts.length > 1 ? parts[0] : "";
    }
    if (hostname === baseDomain) return ""; // acesso direto ao domínio root
    return hostname.replace(`.${baseDomain}`, ""); // ex.: escritor.example.com → escritor
  })();

  const writer = await db.writer.findFirst({
    where: {
      domains: {
        some: { subdomain }
      }
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
    }
  });

  if (!writer) {
    return (
      <WriterShell contained={false} className="grid place-items-center">
        <WriterShell maxWidth="md">
          <GlassCard strong className="text-center">
            <div className="mx-auto mb-4 size-12 rounded-full bg-red-100" />
            <h1 className="text-2xl font-bold text-red-600">Subdomínio inválido</h1>
            <p className="mt-2 text-sm text-[var(--liquid-muted)]">
              O subdomínio <b>{subdomain || "vazio"}</b> não está registrado para nenhum escritor.
            </p>
          </GlassCard>
        </WriterShell>
      </WriterShell>
    );
  }

  return (
    <WriterShell contained={false}>
      <WriterShell maxWidth="lg">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          {writer.logoUrl ? (
            <img
              src={writer.logoUrl}
              alt="Logo do Escritor"
              width={84}
              height={84}
              className="rounded-xl object-contain"
            />
          ) : (
            <div className="grid size-20 place-items-center rounded-xl bg-slate-200 text-slate-500">LOGO</div>
          )}
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[var(--liquid-ink)]">Criar conta</h1>
            <p className="text-sm text-[var(--liquid-muted)]">
              Você está se registrando para <span className="font-medium">{writer.name}</span>
            </p>
          </div>
          <Badge variant="secondary">Leitor</Badge>
        </div>

        <GlassCard strong>
            <ReaderRegister writer={{ id: writer.id, name: writer.name }} />
            <Separator className="my-6" />
            <p className="text-center text-xs text-[var(--liquid-muted)]">
              Ao continuar, você concorda com nossa 
              <a className="underline hover:text-foreground" href="/privacy">Política de Privacidade</a> e 
              <a className="underline hover:text-foreground" href="/terms">Termos de Uso</a>.
            </p>
        </GlassCard>
      </WriterShell>
    </WriterShell>
  );
}
