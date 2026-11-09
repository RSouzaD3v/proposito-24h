import { apiGet } from "@/lib/api/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Suspense } from "react";
import NewReadersAreaChart from "./_charts/NewReadersAreaChart";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const ACTIVE_STATUSES = ["ACTIVE", "TRIALING", "PAST_DUE", "PAUSED"] as const;

function formatDate(date?: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date?: Date | null) {
  if (!date) return "Nunca acessou";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default async function WriterReadersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; range?: string; filter?: "all" | "subs" | "nonsubs" }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim() || "";
  const filter = sp.filter ?? "all";
  const r = sp.range ?? "30d";
  const query = new URLSearchParams({ range: r, filter, ...(q ? { q } : {}) });
  const data = await apiGet<any>(`/writer/analytics/readers?${query}`);
  const { totalReaders, newReaders, subsActive, newReadersByDay, readers } = data;
  const start = new Date(data.start);
  const end = new Date(data.end);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leitores</h1>
          <p className="text-sm text-muted-foreground">Acompanhe sua base de clientes</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">Período: {r.toUpperCase()}</Badge>
          <span>Início: {start.toLocaleDateString()}</span>
          <span>Fim: {end.toLocaleDateString()}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Kpi title="Leitores totais" value={String(totalReaders)} />
        <Kpi title="Novos no período" value={String(newReaders)} />
        <Kpi title="Assinantes ativos/vitalícios" value={String(subsActive)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Novos leitores por dia</CardTitle>
            <CardDescription>Último período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded" />}>
              <NewReadersAreaChart data={newReadersByDay.map((r: any) => ({ day: new Date(r.day), qty: r.qty }))} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Status, período e busca</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex gap-2">
              <FilterLink label="Todos" href={`/writer/analytics/readers?filter=all&range=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`} active={filter === "all"} />
              <FilterLink label="Assinantes" href={`/writer/analytics/readers?filter=subs&range=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`} active={filter === "subs"} />
              <FilterLink label="Não assinantes" href={`/writer/analytics/readers?filter=nonsubs&range=${r}${q ? `&q=${encodeURIComponent(q)}` : ""}`} active={filter === "nonsubs"} />
            </div>
            <div className="flex gap-2">
              {["7d", "30d", "90d", "365d"].map((x) => (
                <FilterLink
                  key={x}
                  label={x === "365d" ? "1 ano" : x}
                  href={`/writer/analytics/readers?filter=${filter}&range=${x}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                  active={r === x}
                />
              ))}
            </div>
            <form className="flex gap-2" action="/writer/analytics/readers" method="get">
              <input type="hidden" name="filter" value={filter} />
              <input type="hidden" name="range" value={r} />
              <Input name="q" placeholder="Buscar por nome ou e-mail..." defaultValue={q} />
              <Button type="submit" variant="secondary">Buscar</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Leitores (até 100)</CardTitle>
          <CardDescription>Mais recentes primeiro</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead className="text-right">Gasto total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readers.map((u: any) => {
                const isSub = u.isSubscriber;
                const spent = u.spent;
                return (
                  <TableRow key={u.id}>
                    <TableCell className="max-w-60 truncate">
                      <a className="underline" href={`/writer/analytics/readers/${u.id}`}>{u.name ?? "-"}</a>
                    </TableCell>
                    <TableCell className="max-w-70 truncate">{u.email}</TableCell>
                    <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={isSub ? "default" : "secondary"}>{isSub ? "ASSINANTE" : "LEITOR"}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {formatDateTime(u.lastAccess)}
                    </TableCell>

                    <TableCell className="text-right">{BRL.format(spent / 100)}</TableCell>
                  </TableRow>
                );
              })}
              {readers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum leitor encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`rounded-md px-3 py-1.5 text-sm ${active ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
    >
      {label}
    </a>
  );
}
