"use client";

import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const DEFINITIONS = [
  ["Receita líquida", "Soma das vendas pagas no período, já sem as taxas do gateway. Quando o gateway não informa o líquido, usamos bruto − taxas."],
  ["Volume bruto (GMV)", "Total cobrado dos leitores nas vendas pagas, antes de qualquer taxa."],
  ["Comissão da plataforma", "Parte retida pela plataforma nas vendas (configurável por escritor)."],
  ["Ticket médio", "Volume bruto dividido pelo número de vendas pagas."],
  ["Variação %", "Comparação com o período imediatamente anterior, de mesma duração."],
  ["Leitores ativos", "Leitores que acessaram o app dentro do período selecionado."],
  ["Novos assinantes", "Assinaturas de leitores criadas no período, em qualquer status."],
  ["Cancelamentos", "Assinaturas de leitores que passaram para cancelada no período."],
  ["Taxa de cancelamento", "Cancelamentos do período sobre as assinaturas ativas atuais."],
  ["MRR dos escritores", "Receita mensal recorrente dos planos dos escritores; planos trimestrais, semestrais e anuais são divididos pelo número de meses."],
  ["Repasses pendentes", "Repasses manuais aos escritores ainda não marcados como pagos."],
] as const;

export function MetricsGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="glass" size="sm" className="rounded-full">
          <Info className="size-4" /> Como calculamos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Como as métricas são calculadas</DialogTitle>
          <DialogDescription>Todos os valores consideram o período selecionado no topo da página.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <dl className="grid gap-3">
            {DEFINITIONS.map(([term, description]) => (
              <div key={term} className="rounded-xl bg-slate-50 p-3">
                <dt className="text-sm font-semibold text-slate-900">{term}</dt>
                <dd className="mt-0.5 text-sm text-slate-600">{description}</dd>
              </div>
            ))}
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
