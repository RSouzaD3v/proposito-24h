"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  Paintbrush,
  Palette,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GlassCard } from "@/components/ui/glass-card";
import { ButtonSpinner } from "@/components/ui/loading-state";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { StatTile } from "../_components/StatTile";
import { formatDate, INT } from "../_lib/format";
import {
  COLOR_GROUPS,
  COLOR_KEYS,
  ColorInput,
  type Colors,
  contrast,
  ContrastBadge,
  DEFAULT_COLORS,
  isHex,
  normalizeColor,
  PRESETS,
  ThemePreview,
} from "./_components/theme";

type Writer = { id: string; name: string; slug: string; logoUrl?: string | null };

type Personalization = Partial<Record<keyof Colors, string>> & {
  writerId: string;
  active?: boolean;
  updatedAt?: string;
  writer: Writer | null;
};

type Editor = { mode: "create" | "edit"; writerId: string; colors: Colors };

const colorsOf = (row: Partial<Record<keyof Colors, unknown>>): Colors =>
  Object.fromEntries(COLOR_KEYS.map((key) => [key, normalizeColor(row[key], DEFAULT_COLORS[key])])) as Colors;

async function errorMessage(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
  return message || fallback;
}

export default function AdminPersonalizationPage() {
  const [rows, setRows] = useState<Personalization[]>([]);
  const [writers, setWriters] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [toDelete, setToDelete] = useState<Personalization | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const notify = useCallback((ok: boolean, text: string) => setNotice({ ok, text }), []);

  useEffect(() => {
    if (!notice?.ok) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/personalizations", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/v1/admin/writer-options", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setWriters(Array.isArray(data) ? data : []))
      .catch(() => undefined);
  }, [load]);

  const nameOf = useCallback(
    (writerId: string) =>
      rows.find((row) => row.writerId === writerId)?.writer?.name ??
      writers.find((writer) => writer.id === writerId)?.name ??
      writerId,
    [rows, writers],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-BR");
    const sorted = [...rows].sort((a, b) => (a.writer?.name ?? a.writerId).localeCompare(b.writer?.name ?? b.writerId, "pt-BR"));
    if (!term) return sorted;
    return sorted.filter((row) =>
      [row.writer?.name, row.writer?.slug, row.writerId].some((value) => value?.toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [rows, query]);

  const activeCount = rows.filter((row) => row.active !== false).length;
  const personalized = new Set(rows.map((row) => row.writerId));
  const withoutTheme = writers.filter((writer) => !personalized.has(writer.id));

  const save = async (writerId: string, colors: Colors) => {
    setBusy("save");
    try {
      const res = await fetch("/api/v1/admin/personalizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId, ...colors }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Não foi possível salvar."));
      setEditor(null);
      notify(true, `Tema de ${nameOf(writerId)} salvo.`);
      await load();
    } catch (error) {
      notify(false, error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (row: Personalization, active: boolean) => {
    setBusy(`active:${row.writerId}`);
    setRows((current) => current.map((item) => (item.writerId === row.writerId ? { ...item, active } : item)));
    try {
      const res = await fetch("/api/v1/admin/personalizations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId: row.writerId, active }),
      });
      if (!res.ok) throw new Error(await errorMessage(res, "Não foi possível alterar o status."));
      notify(true, `Tema de ${nameOf(row.writerId)} ${active ? "ativado" : "desativado"}.`);
    } catch (error) {
      setRows((current) => current.map((item) => (item.writerId === row.writerId ? { ...item, active: !active } : item)));
      notify(false, error instanceof Error ? error.message : "Não foi possível alterar o status.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/v1/admin/personalizations/${encodeURIComponent(toDelete.writerId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await errorMessage(res, "Não foi possível excluir."));
      notify(true, `Tema de ${nameOf(toDelete.writerId)} removido. O app volta às cores padrão.`);
      setToDelete(null);
      await load();
    } catch (error) {
      notify(false, error instanceof Error ? error.message : "Não foi possível excluir.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 animate-glass-in sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--liquid-ink)] md:text-3xl">Personalização</h1>
          <p className="text-sm text-[var(--liquid-muted)]">Cores do app do leitor de cada escritor.</p>
        </div>
        <Button
          variant="glass-primary"
          className="rounded-full"
          onClick={() => setEditor({ mode: "create", writerId: "", colors: DEFAULT_COLORS })}
        >
          <Plus className="size-4" /> Novo tema
        </Button>
      </header>

      {notice && (
        <div
          role={notice.ok ? "status" : "alert"}
          className={cn(
            "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-xl animate-glass-in",
            notice.ok ? "border-emerald-200/70 bg-emerald-50/85 text-emerald-800" : "border-red-200/70 bg-red-50/85 text-red-800",
          )}
        >
          {notice.ok ? <Check className="size-4 shrink-0" aria-hidden /> : <CircleAlert className="size-4 shrink-0" aria-hidden />}
          <span className="flex-1">{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso" className="rounded-full p-1 hover:bg-black/5">
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Temas criados" value={loading ? "—" : INT.format(rows.length)} icon={Palette} tone="violet" />
        <StatTile label="Ativos" value={loading ? "—" : INT.format(activeCount)} icon={Paintbrush} tone="green" hint={`${INT.format(rows.length - activeCount)} desativados`} />
        <StatTile
          label="Escritores sem tema"
          value={writers.length ? INT.format(withoutTheme.length) : "—"}
          icon={UserX}
          tone="orange"
          hint="usam as cores padrão"
        />
        <StatTile
          label="Cobertura"
          value={writers.length ? `${Math.round(((writers.length - withoutTheme.length) / writers.length) * 100)}%` : "—"}
          icon={Palette}
          tone="blue"
          hint={writers.length ? `${INT.format(writers.length)} escritores no total` : undefined}
        />
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--liquid-muted)]" aria-hidden />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar escritor"
          aria-label="Buscar escritor"
          className="rounded-full border-white/60 bg-white/70 pl-9"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Carregando">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-56 rounded-[var(--glass-radius)] bg-white/50" />
          ))}
        </div>
      ) : loadError ? (
        <GlassCard strong className="flex flex-wrap items-center gap-3 text-sm text-[var(--liquid-muted)]">
          <CircleAlert className="size-5 text-red-600" aria-hidden />
          <span className="flex-1">Não foi possível carregar os temas agora.</span>
          <Button variant="glass" size="sm" className="rounded-full" onClick={() => { setLoading(true); load(); }}>
            Tentar novamente
          </Button>
        </GlassCard>
      ) : visible.length === 0 ? (
        <GlassCard strong className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#7c5cd6]/12 text-[#6446c2]">
            <Palette className="size-6" aria-hidden />
          </span>
          <p className="font-medium text-[var(--liquid-ink)]">{query ? "Nenhum tema encontrado." : "Nenhum tema criado ainda."}</p>
          {!query && (
            <Button variant="glass-primary" className="rounded-full" onClick={() => setEditor({ mode: "create", writerId: "", colors: DEFAULT_COLORS })}>
              <Plus className="size-4" /> Criar o primeiro tema
            </Button>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((row, index) => {
            const colors = colorsOf(row);
            const active = row.active !== false;
            return (
              <GlassCard key={row.writerId} strong padding="none" className="flex flex-col overflow-hidden" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", writerId: row.writerId, colors })}
                  className={cn("relative flex h-28 items-end gap-1 p-3 text-left transition-opacity", !active && "opacity-50 grayscale")}
                  style={{ background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}
                  aria-label={`Editar tema de ${row.writer?.name ?? row.writerId}`}
                >
                  <span className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm" style={{ background: colors.bgButtonColor, color: colors.buttonTextColor }}>
                    Botão
                  </span>
                  {COLOR_KEYS.map((key) => (
                    <span key={key} className="size-5 rounded-full border-2 border-white/80 shadow-sm" style={{ background: colors[key] }} title={`${key}: ${colors[key]}`} />
                  ))}
                </button>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--liquid-ink)]">{row.writer?.name ?? "Escritor não encontrado"}</p>
                      <p className="truncate text-xs text-[var(--liquid-muted)]">
                        {row.writer ? `/${row.writer.slug}` : row.writerId}
                        {row.updatedAt ? ` · atualizado em ${formatDate(row.updatedAt)}` : ""}
                      </p>
                    </div>
                    <Switch
                      checked={active}
                      disabled={busy === `active:${row.writerId}`}
                      onCheckedChange={(checked) => toggleActive(row, checked)}
                      aria-label={active ? "Desativar tema" : "Ativar tema"}
                    />
                  </div>

                  <ContrastBadge ratio={contrast(colors.textColor, colors.backgroundColor)} label="Texto sobre fundo" />

                  <div className="mt-auto flex items-center gap-1">
                    <Button variant="glass" size="sm" className="rounded-full" onClick={() => setEditor({ mode: "edit", writerId: row.writerId, colors })}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full text-[var(--liquid-muted)]"
                      onClick={() => setEditor({ mode: "create", writerId: "", colors })}
                      title="Usar estas cores em outro escritor"
                    >
                      <Copy className="size-3.5" /> Duplicar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto size-8 rounded-full text-[var(--liquid-muted)] hover:bg-red-50 hover:text-red-700"
                      onClick={() => setToDelete(row)}
                      aria-label={`Excluir tema de ${row.writer?.name ?? row.writerId}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <ThemeEditor
        editor={editor}
        onClose={() => busy !== "save" && setEditor(null)}
        onChange={setEditor}
        onSave={save}
        saving={busy === "save"}
        writers={writers}
        personalized={personalized}
        nameOf={nameOf}
      />

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && busy !== "delete" && setToDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir tema?</DialogTitle>
            <DialogDescription>
              O app de <b>{toDelete ? nameOf(toDelete.writerId) : ""}</b> volta às cores padrão da plataforma. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={busy === "delete"}>Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={remove} disabled={busy === "delete"}>
              {busy === "delete" && <ButtonSpinner />} Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ThemeEditor({
  editor,
  onClose,
  onChange,
  onSave,
  saving,
  writers,
  personalized,
  nameOf,
}: {
  editor: Editor | null;
  onClose: () => void;
  onChange: (editor: Editor) => void;
  onSave: (writerId: string, colors: Colors) => void;
  saving: boolean;
  writers: Writer[];
  personalized: Set<string>;
  nameOf: (writerId: string) => string;
}) {
  const [search, setSearch] = useState("");
  const [manualId, setManualId] = useState(false);

  useEffect(() => {
    if (editor === null) {
      setSearch("");
      setManualId(false);
    }
  }, [editor]);

  const options = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return writers
      .filter((writer) => !personalized.has(writer.id))
      .filter((writer) => !term || writer.name.toLocaleLowerCase("pt-BR").includes(term) || writer.slug.includes(term));
  }, [writers, personalized, search]);

  if (!editor) return <Dialog open={false} />;

  const { colors } = editor;
  const setColor = (key: keyof Colors, value: string) => onChange({ ...editor, colors: { ...colors, [key]: value } });
  const invalid = COLOR_KEYS.filter((key) => !isHex(colors[key]));
  const exists = editor.mode === "create" && personalized.has(editor.writerId);
  const canSave = Boolean(editor.writerId) && invalid.length === 0 && !exists && !saving;
  const writerName = editor.writerId ? nameOf(editor.writerId) : "";

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{editor.mode === "edit" ? `Tema de ${writerName}` : "Novo tema"}</DialogTitle>
          <DialogDescription>As alterações aparecem no app do leitor assim que forem salvas.</DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[calc(92vh-9rem)] overflow-y-auto md:grid-cols-[1fr_300px]">
          <div className="space-y-5 p-6">
            {editor.mode === "create" && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Escritor</p>
                {manualId || writers.length === 0 ? (
                  <Input
                    value={editor.writerId}
                    onChange={(event) => onChange({ ...editor, writerId: event.target.value.trim() })}
                    placeholder="ID do escritor"
                    aria-label="ID do escritor"
                  />
                ) : editor.writerId ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-slate-50 px-3 py-2">
                    <span className="truncate text-sm font-medium text-slate-900">{writerName}</span>
                    <Button variant="ghost" size="sm" onClick={() => onChange({ ...editor, writerId: "" })}>
                      Trocar
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="relative border-b">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                      <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar escritor sem tema"
                        aria-label="Buscar escritor"
                        className="border-0 pl-9 shadow-none focus-visible:ring-0"
                        autoFocus
                      />
                    </div>
                    <ScrollArea className="h-40">
                      <ul className="p-1">
                        {options.map((writer) => (
                          <li key={writer.id}>
                            <button
                              type="button"
                              onClick={() => onChange({ ...editor, writerId: writer.id })}
                              className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                            >
                              <span className="truncate text-slate-900">{writer.name}</span>
                              <span className="shrink-0 text-xs text-slate-400">/{writer.slug}</span>
                            </button>
                          </li>
                        ))}
                        {options.length === 0 && <li className="px-2 py-6 text-center text-sm text-slate-500">Nenhum escritor disponível.</li>}
                      </ul>
                    </ScrollArea>
                  </div>
                )}
                {writers.length > 0 && (
                  <button type="button" className="text-xs font-medium text-[#2a78d6] hover:underline" onClick={() => setManualId((value) => !value)}>
                    {manualId ? "Escolher da lista" : "Informar o ID manualmente"}
                  </button>
                )}
                {exists && <p className="text-xs text-red-700">Este escritor já tem um tema. Edite o existente na lista.</p>}
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">Começar de uma paleta</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onChange({ ...editor, colors: preset.colors })}
                    className="flex items-center gap-2 rounded-full border bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex -space-x-1">
                      {[preset.colors.primaryColor, preset.colors.backgroundColor, preset.colors.bgButtonColor].map((color, index) => (
                        <span key={index} className="size-3.5 rounded-full border border-white shadow-sm" style={{ background: color }} />
                      ))}
                    </span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {COLOR_GROUPS.map((group) => (
              <fieldset key={group.title}>
                <legend className="mb-2 text-sm font-semibold text-slate-900">{group.title}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.fields.map((field) => (
                    <ColorInput key={field.key} id={`color-${field.key}`} label={field.label} value={colors[field.key]} onChange={(value) => setColor(field.key, value)} />
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <aside className="space-y-3 border-t bg-slate-50 p-6 md:border-l md:border-t-0">
            <p className="text-sm font-semibold text-slate-900">Prévia</p>
            <ThemePreview colors={colors} name={writerName} />
            <div className="grid gap-1.5 pt-2">
              <ContrastBadge ratio={contrast(colors.textColor, colors.backgroundColor)} label="Texto sobre fundo" />
              <ContrastBadge ratio={contrast(colors.buttonTextColor, colors.bgButtonColor)} label="Texto do botão" />
              <ContrastBadge ratio={contrast(colors.backgroundColor, colors.primaryColor)} label="Cabeçalho" />
            </div>
            <p className="text-[11px] leading-snug text-slate-500">
              AA (4,5:1) é o mínimo recomendado para leitura confortável.
            </p>
          </aside>
        </div>

        <DialogFooter className="flex-row items-center border-t px-6 py-4">
          {invalid.length > 0 && <p className="mr-auto text-xs text-red-700">Use cores no formato #RRGGBB.</p>}
          {editor.mode === "edit" && invalid.length === 0 && (
            <Link href={`/admin/writer/${editor.writerId}`} className="mr-auto text-xs font-medium text-[#2a78d6] hover:underline">
              Ver escritor
            </Link>
          )}
          <DialogClose asChild>
            <Button variant="outline" disabled={saving}>Cancelar</Button>
          </DialogClose>
          <Button onClick={() => onSave(editor.writerId, colors)} disabled={!canSave}>
            {saving && <ButtonSpinner />} {saving ? "Salvando…" : "Salvar tema"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
