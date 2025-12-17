"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Personalization {
  writerId: string;
  active: boolean;

  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  bgButtonColor?: string;
  buttonTextColor?: string;
  textColor?: string;

  // 🎨 cores livres
  independenteColor1?: string;
  independenteColor2?: string;
}

export default function PersonalizationForm({
  writerId,
}: {
  writerId: string;
}) {
  const [data, setData] = useState<Personalization | null>(null);
  const [isPending, startTransition] = useTransition();

  /* -------------------------
     Load personalization
  ------------------------- */
  useEffect(() => {
    fetch(`/api/personalization?writerId=${writerId}`)
      .then((res) => res.json())
      .then((res) => {
        if (Array.isArray(res)) {
          const found = res.find((p) => p.writerId === writerId);
          setData(found || { writerId, active: true });
        } else {
          setData(res || { writerId, active: true });
        }
      });
  }, [writerId]);

  function updateField<K extends keyof Personalization>(
    key: K,
    value: Personalization[K]
  ) {
    if (!data) return;
    setData({ ...data, [key]: value });
  }

  /* -------------------------
     Save
  ------------------------- */
  function handleSave() {
    if (!data) return;

    startTransition(async () => {
      const res = await fetch("/api/personalization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Personalização salva com sucesso");
      } else {
        toast.error("Erro ao salvar personalização");
      }
    });
  }

  if (!data) {
    return (
      <p className="text-muted-foreground mt-5">
        Carregando personalização…
      </p>
    );
  }

  return (
    <div className="space-y-8 mt-5">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Personalização</h1>
        <p className="text-sm text-muted-foreground">
          Defina as cores do seu aplicativo.
        </p>
      </header>

      {/* Status */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <p className="font-medium">Personalização ativa</p>
          <p className="text-sm text-muted-foreground">
            Ative ou desative sua identidade visual
          </p>
        </div>

        <Switch
          checked={data.active}
          onCheckedChange={(v) => updateField("active", v)}
        />
      </Card>

      {/* Colors */}
      <Card className="p-6 space-y-6">
        <h2 className="font-semibold">Cores</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <ColorField
            label="Cor primária"
            value={data.primaryColor}
            onChange={(v) => updateField("primaryColor", v)}
          />

          <ColorField
            label="Cor secundária"
            value={data.secondaryColor}
            onChange={(v) => updateField("secondaryColor", v)}
          />

          <ColorField
            label="Cor de fundo"
            value={data.backgroundColor}
            onChange={(v) => updateField("backgroundColor", v)}
          />

          <ColorField
            label="Cor do botão"
            value={data.bgButtonColor}
            onChange={(v) => updateField("bgButtonColor", v)}
          />

          <ColorField
            label="Texto do botão"
            value={data.buttonTextColor}
            onChange={(v) => updateField("buttonTextColor", v)}
          />

          <ColorField
            label="Texto geral"
            value={data.textColor}
            onChange={(v) => updateField("textColor", v)}
          />

          {/* 🎨 Cores independentes */}
          <ColorField
            label="Cor independente 1"
            value={data.independenteColor1}
            onChange={(v) => updateField("independenteColor1", v)}
          />

          <ColorField
            label="Cor independente 2"
            value={data.independenteColor2}
            onChange={(v) => updateField("independenteColor2", v)}
          />
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

/* -------------------------
   Helper
------------------------- */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1"
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
