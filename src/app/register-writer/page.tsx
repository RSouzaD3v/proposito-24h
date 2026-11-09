"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import S3Uploader from "@/components/S3Uploader";
import { AuthHeading, AuthShell } from "@/components/auth/auth-shell";
import {
  AuthAlert,
  AuthField,
  AuthSubmit,
  PasswordField,
  authInputClass,
  authLinkClass,
} from "@/components/auth/auth-fields";
import { Input } from "@/components/ui/input";
import { readableOn } from "@/lib/readable-on";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "devotionalapp.com.br";

const BENEFITS = [
  "Devocionais, orações e versículos diários",
  "Publicações e e-books em um só lugar",
  "Endereço próprio, com sua logo e suas cores",
];

/** Mantém o endereço no formato aceito para subdomínios. */
function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, 63);
}

const trimSlug = (slug: string) => slug.replace(/-+$/, "");

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-[var(--border)] pt-7 first:border-t-0 first:pt-0">
      <legend className="contents">
        <span className="reader-serif block text-xl">{title}</span>
      </legend>
      {description && <p className="-mt-3 text-[13px] text-[var(--liquid-muted)]">{description}</p>}
      {children}
    </fieldset>
  );
}

function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <AuthField id={name} label={label}>
      <div className="flex h-12 items-center gap-3 rounded-xl border border-[var(--input)] bg-[var(--reader-surface)] px-3 focus-within:ring-[3px] focus-within:ring-[var(--liquid-accent)]/20">
        <input
          id={name}
          type="color"
          name={name}
          value={value}
          onChange={onChange}
          className="size-7 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
        />
        <span className="text-sm font-medium uppercase tabular-nums">{value}</span>
      </div>
    </AuthField>
  );
}

function BrandPreview({
  name,
  logoUrl,
  primary,
  secondary,
}: {
  name: string;
  logoUrl: string;
  primary: string;
  secondary: string;
}) {
  const ink = readableOn(secondary);
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-4"
      style={{ backgroundColor: secondary, color: ink }}
      aria-label="Prévia da identidade visual"
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="size-11 rounded-xl object-contain" />
      ) : (
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl font-bold"
          style={{ backgroundColor: primary, color: readableOn(primary) }}
        >
          {(name.trim().charAt(0) || "D").toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate font-bold">{name.trim() || "Sua plataforma"}</span>
      <span
        className="shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-bold"
        style={{ backgroundColor: primary, color: readableOn(primary) }}
      >
        Ler agora
      </span>
    </div>
  );
}

export default function RegistrarEscritorPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    writerName: "",
    slug: "",
    email: "",
    password: "",
    name: "",
    logoUrl: "",
    colorPrimary: "#0dcaf0",
    colorSecondary: "#f1f5f9",
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleWriterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const writerName = e.target.value;
    setForm((current) => ({
      ...current,
      writerName,
      slug: slugEdited ? current.slug : trimSlug(toSlug(writerName)),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = toSlug(e.target.value);
    setSlugEdited(slug !== "");
    setForm((current) => ({ ...current, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/web/register-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: trimSlug(form.slug) }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erro ao registrar.");
        setLoading(false);
        return;
      }

      router.push("/login?success=1");
    } catch (err) {
      console.error(err);
      setError("Erro inesperado.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      image="/writer.jpg"
      wide
      sceneEyebrow="Para escritores"
      sceneTitle="Leve sua mensagem para o dia a dia de quem lê você."
      sceneBody={
        <ul className="grid gap-2.5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <Check className="mt-1 size-4 shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      }
      topAction={
        <>
          <span className="hidden sm:inline">Já tem conta? </span>
          <Link href="/login" className={authLinkClass}>
            Entrar
          </Link>
        </>
      }
    >
      <AuthHeading title="Crie sua plataforma" description="Comece com o essencial. O resto você ajusta depois." />

      <form onSubmit={handleSubmit} className="grid gap-7">
        <FormSection title="Sua plataforma">
          <AuthField id="writerName" label="Nome da plataforma">
            <Input
              id="writerName"
              name="writerName"
              placeholder="Ex.: Igreja Vida"
              value={form.writerName}
              onChange={handleWriterNameChange}
              className={authInputClass}
              minLength={2}
              maxLength={120}
              required
            />
          </AuthField>
          <AuthField
            id="slug"
            label="Endereço"
            hint={
              <>
                Seu site será{" "}
                <b className="font-semibold break-all text-[var(--liquid-ink)]">
                  {form.slug ? trimSlug(form.slug) : "seu-endereco"}.{BASE_DOMAIN}
                </b>
              </>
            }
          >
            <Input
              id="slug"
              name="slug"
              placeholder="igreja-vida"
              value={form.slug}
              onChange={handleSlugChange}
              onBlur={() => setForm((current) => ({ ...current, slug: trimSlug(current.slug) }))}
              className={authInputClass}
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </AuthField>
        </FormSection>

        <FormSection title="Sua conta">
          <div className="grid gap-5 sm:grid-cols-2">
            <AuthField id="name" label="Seu nome">
              <Input
                id="name"
                name="name"
                placeholder="Nome completo"
                value={form.name}
                onChange={handleChange}
                className={authInputClass}
                autoComplete="name"
                required
              />
            </AuthField>
            <AuthField id="email" label="E-mail">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@email.com"
                value={form.email}
                onChange={handleChange}
                className={authInputClass}
                autoComplete="email"
                required
              />
            </AuthField>
          </div>
          <PasswordField
            id="password"
            name="password"
            label="Senha"
            placeholder="Crie uma senha"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
            showStrength
          />
        </FormSection>

        <FormSection title="Identidade visual" description="Opcional. Você pode alterar depois no seu perfil.">
          <BrandPreview
            name={form.writerName}
            logoUrl={form.logoUrl}
            primary={form.colorPrimary}
            secondary={form.colorSecondary}
          />
          <div className="grid gap-2">
            <span className="text-[13px] font-semibold">Logo</span>
            <S3Uploader
              compact
              folder="logos"
              onUploaded={({ publicUrl }) => setForm((prev) => ({ ...prev, logoUrl: publicUrl }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ColorField name="colorPrimary" label="Cor primária" value={form.colorPrimary} onChange={handleChange} />
            <ColorField name="colorSecondary" label="Cor de fundo" value={form.colorSecondary} onChange={handleChange} />
          </div>
        </FormSection>

        <div className="grid gap-4">
          {error && <AuthAlert tone="error">{error}</AuthAlert>}
          <AuthSubmit loading={loading} loadingLabel="Criando plataforma…">
            Criar minha plataforma
          </AuthSubmit>
        </div>
      </form>
    </AuthShell>
  );
}
