"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LoadingState, ButtonSpinner } from "@/components/ui/loading-state";

interface Personalization {
  writerId: string;
  active: boolean;

  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  bgButtonColor?: string;
  buttonTextColor?: string;
  textColor?: string;

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
    return <LoadingState label="Carregando personalização..." />;
  }

  return (
    <div className="space-y-5">
      <GlassCard strong className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--liquid-ink)]">Personalização ativa</p>
          <p className="text-sm text-[var(--liquid-muted)]">
            Ative ou desative sua identidade visual
          </p>
        </div>

        <Switch
          checked={data.active}
          onCheckedChange={(v) => updateField("active", v)}
        />
      </GlassCard>

      <GlassCard strong className="space-y-6">
        <h2 className="font-semibold text-[var(--liquid-ink)]">Cores</h2>

        <div className="grid gap-4 sm:grid-cols-2">
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
      </GlassCard>

      <div className="flex justify-end">
        <Button
          variant="glass-primary"
          className="rounded-full px-6"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <ButtonSpinner />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </div>
  );
}

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
          className="h-10 w-12 p-1"
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
