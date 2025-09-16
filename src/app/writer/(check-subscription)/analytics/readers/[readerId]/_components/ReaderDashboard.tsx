"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import { Mail, User as UserIcon, ShieldCheck, KeyRound, CreditCard, BookOpenText, CalendarDays, Lock, Eye, EyeOff } from "lucide-react";

// Tipagens simples do payload vindo do Server Component
type SessionUser = { id: string; role?: "ADMIN" | "WRITER_ADMIN" | "CLIENT"; writerId?: string | null };

type Writer = {
  id: string;
  name: string | null;
  slug: string | null;
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  titleApp?: string | null;
};

type PublicationType = "DEVOTIONAL" | "EBOOK";

// Minimiza a tipagem vinda do Prisma – apenas o que usamos na UI
interface ReaderLite {
  id: string;
  email: string;
  name: string | null;
  role: "CLIENT" | "WRITER_ADMIN" | "ADMIN";
  writerId: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  readerSubscriptions: Array<{
    id: string;
    status: string;
    lifetime: boolean;
    priceId: string;
    currentPeriodStart: string | Date | null;
    currentPeriodEnd: string | Date | null;
    createdAt: string | Date;
  }>;
  purchases: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string | Date;
    publication: { id: string; title: string; type: PublicationType; slug: string };
  }>;
  _count: {
    purchases: number;
    readerSubscriptions: number;
    userCompletationQuote: number;
    userCompletationDevotional: number;
    userCompletationVerse: number;
    userCompletationPrayer: number;
  };
}

export default function ReaderDashboard({
  initialData,
}: {
  initialData: { sessionUser: SessionUser; writer: Writer | null; reader: ReaderLite };
}) {
  const router = useRouter();
  const { sessionUser, writer, reader } = initialData;

  const [reveal, setReveal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tz = "America/Santarem"; // coerente com o projeto

  const currency = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }),
    []
  );
  const fmtDateTime = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleString("pt-BR", { timeZone: tz }) : "—";

  const activeSub = useMemo(() => {
    const statuses = new Set(["ACTIVE", "TRIALING"]);
    return reader.readerSubscriptions.find((s) => statuses.has(s.status));
  }, [reader.readerSubscriptions]);

  const totalGasto = useMemo(() => reader.purchases.reduce((acc, p) => acc + (p.amount ?? 0), 0), [reader.purchases]);

  // ======= Segurança: Troca de senha direta (admin/writer-admin) =======
  const schema = useMemo(
    () =>
      z
        .object({
          newPwd: z.string().min(6, "Mínimo de 6 caracteres"),
          newPwd2: z.string(),
        })
        .refine((v) => v.newPwd === v.newPwd2, { message: "As senhas não conferem", path: ["newPwd2"] }),
    []
  );

  async function handleChangePassword() {
    setError(null);
    setSuccess(null);
    const parsed = schema.safeParse({ newPwd, newPwd2 });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Dados inválidos";
      setError(msg);
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/writer/readers/${reader.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao atualizar senha");
      setSuccess("Senha atualizada com sucesso.");
      setNewPwd("");
      setNewPwd2("");
    } catch (e: any) {
      setError(e?.message || "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border bg-card shadow-sm">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              {reader.name || "Leitor sem nome"}
              <span className="ml-2 align-middle">
                <Badge variant="secondary">CLIENT</Badge>
              </span>
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{reader.email}</span>
              {writer?.name && (
                <>
                  <span className="opacity-60">•</span>
                  <span>Writer: {writer.name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSub ? (
            <Badge className="gap-1"><ShieldCheck className="h-4 w-4" /> Assinante ativo</Badge>
          ) : (
            <Badge variant="outline" className="gap-1"><ShieldCheck className="h-4 w-4" /> Sem assinatura</Badge>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Assinaturas</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{reader._count.readerSubscriptions}</div>
            <p className="text-xs text-muted-foreground">{activeSub ? "Possui assinatura ativa" : "Nenhuma ativa"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Compras</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{reader._count.purchases}</div>
            <p className="text-xs text-muted-foreground">Gasto total {currency.format(totalGasto / 100)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Concl. Devocionais</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{reader._count.userCompletationDevotional}</div>
            <p className="text-xs text-muted-foreground">Última atualização {fmtDateTime(reader.updatedAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Concl. Citações/Versos/Oração</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {reader._count.userCompletationQuote + reader._count.userCompletationVerse + reader._count.userCompletationPrayer}
            </div>
            <p className="text-xs text-muted-foreground">Somatório geral</p>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subs">Assinaturas</TabsTrigger>
          <TabsTrigger value="orders">Compras</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Criado em</div>
                <div className="font-medium">{fmtDateTime(reader.createdAt)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Última atualização</div>
                <div className="font-medium">{fmtDateTime(reader.updatedAt)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">WriterId</div>
                <div className="font-medium">{reader.writerId || "—"}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assinaturas */}
        <TabsContent value="subs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Assinaturas do leitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Lifetime</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Fim</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reader.readerSubscriptions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma assinatura.</TableCell>
                      </TableRow>
                    )}
                    {reader.readerSubscriptions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Badge variant={s.status === "ACTIVE" ? "default" : "outline"}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>{s.lifetime ? "Sim" : "Não"}</TableCell>
                        <TableCell>{fmtDateTime(s.currentPeriodStart)}</TableCell>
                        <TableCell>{fmtDateTime(s.currentPeriodEnd)}</TableCell>
                        <TableCell>{fmtDateTime(s.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compras */}
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpenText className="h-5 w-5" /> Compras do leitor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reader.purchases.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma compra.</TableCell>
                      </TableRow>
                    )}
                    {reader.purchases.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.publication.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{p.publication.type}</Badge>
                        </TableCell>
                        <TableCell>{currency.format(p.amount / 100)}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === "SUCCESS" ? "default" : "outline"}>{p.status}</Badge>
                        </TableCell>
                        <TableCell>{fmtDateTime(p.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atividade */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Resumo de atividade</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Citações concluídas</div>
                <div className="text-2xl font-semibold">{reader._count.userCompletationQuote}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Devocionais concluídos</div>
                <div className="text-2xl font-semibold">{reader._count.userCompletationDevotional}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Versos concluídos</div>
                <div className="text-2xl font-semibold">{reader._count.userCompletationVerse}</div>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="text-sm text-muted-foreground">Orações concluídas</div>
                <div className="text-2xl font-semibold">{reader._count.userCompletationPrayer}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Alterar senha do leitor</CardTitle>
            </CardHeader>
            <CardContent className="max-w-lg">
              <Alert className="mb-4">
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Essa ação substitui imediatamente a senha do leitor. Recomende que ele faça login e altere em seguida, se desejar.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label>Novo password</Label>
                  <div className="relative">
                    <Input type={reveal ? "text" : "password"} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="mínimo 6 caracteres" />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground" onClick={() => setReveal((v) => !v)}>
                      {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Confirmar novo password</Label>
                  <Input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} />
                </div>

                {error && (
                  <p className="text-sm font-medium text-destructive">{error}</p>
                )}
                {success && (
                  <p className="text-sm font-medium text-emerald-600">{success}</p>
                )}

                <div className="pt-2">
                  <Button disabled={saving} onClick={handleChangePassword} className="gap-2">
                    <KeyRound className="h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar nova senha"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}