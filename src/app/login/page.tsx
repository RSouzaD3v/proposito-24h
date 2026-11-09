import { Suspense } from "react";
import Link from "next/link";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import { authLinkClass } from "@/components/auth/auth-fields";
import { getWriterFromHost } from "@/lib/writer-host";
import { LoginForm } from "./_components/LoginForm";

export default async function LoginPage() {
  // Uma falha ao buscar a marca do escritor não deve impedir o acesso ao login.
  const writer = await getWriterFromHost()
    .then((result) => result.writer)
    .catch(() => null);

  return (
    <AuthShell
      image="/bible3d.webp"
      hideSceneOnMobile
      sceneEyebrow="Salmos 119:105"
      sceneTitle="A tua palavra é lâmpada que ilumina os meus passos."
      {...(writer && { brandName: writer.name, brandLogoUrl: writer.logoUrl, accent: writer.colorPrimary })}
      topAction={
        <>
          <span className="hidden sm:inline">Ainda não tem conta? </span>
          <Link href={writer ? "/reader/register" : "/register-writer"} className={authLinkClass}>
            Criar conta
          </Link>
        </>
      }
    >
      <AuthHeading
        title="Que bom ter você aqui"
        description={writer ? `Entre para continuar com ${writer.name}.` : "Entre para continuar sua jornada."}
      />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
