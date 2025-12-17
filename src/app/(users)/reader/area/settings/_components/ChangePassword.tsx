"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChangePassword = () => {
  const [revealCurrent, setRevealCurrent] = useState(false);
  const [revealNew, setRevealNew] = useState(false);
  const [revealConfirm, setRevealConfirm] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate() {
    if (!currentPwd) return "Informe sua senha atual.";
    if (newPwd.length < 6) return "A nova senha deve ter no mínimo 6 caracteres.";
    if (newPwd !== newPwd2) return "A confirmação não confere.";
    if (newPwd === currentPwd) return "A nova senha deve ser diferente da atual.";
    return null;
  }

  async function handleChangePassword() {
    setError(null);
    setSuccess(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/reader/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Falha ao atualizar senha.");
      setSuccess("Senha atualizada com sucesso.");
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    } catch (e: any) {
      setError(e?.message || "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  const disabled =
    saving ||
    !currentPwd ||
    newPwd.length < 6 ||
    newPwd !== newPwd2 ||
    newPwd === currentPwd;

    return (
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Alterar senha do leitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>Importante</AlertTitle>
              <AlertDescription>
                Essa ação substitui imediatamente a senha do leitor.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Senha atual */}
              <div className="grid gap-2">
                <Label htmlFor="currentPwd">Senha atual</Label>
                <div className="relative">
                  <Input
                    id="currentPwd"
                    type={revealCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    placeholder="sua senha atual"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    onClick={() => setRevealCurrent((v) => !v)}
                    aria-label={revealCurrent ? "Ocultar senha atual" : "Mostrar senha atual"}
                  >
                    {revealCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Nova senha */}
              <div className="grid gap-2">
                <Label htmlFor="newPwd">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="newPwd"
                    type={revealNew ? "text" : "password"}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    onClick={() => setRevealNew((v) => !v)}
                    aria-label={revealNew ? "Ocultar nova senha" : "Mostrar nova senha"}
                  >
                    {revealNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar nova senha */}
              <div className="grid gap-2">
                <Label htmlFor="newPwd2">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="newPwd2"
                    type={revealConfirm ? "text" : "password"}
                    value={newPwd2}
                    onChange={(e) => setNewPwd2(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
                    onClick={() => setRevealConfirm((v) => !v)}
                    aria-label={revealConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                  >
                    {revealConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-600">{success}</p>}

              <div className="pt-2">
                <Button disabled={disabled} onClick={handleChangePassword} className="gap-2">
                  <KeyRound className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar nova senha"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    )
}