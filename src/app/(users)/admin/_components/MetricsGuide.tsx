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
  ["Ativos hoje / semana / mês", "Leitores com último acesso nas últimas 24 horas, 7 dias ou 30 dias (DAU, WAU e MAU)."],
  ["Fidelidade (DAU/MAU)", "Quantos dos ativos no mês voltam todo dia. Acima de 20% indica hábito diário."],
  ["Leitores engajados", "Leitores que fizeram ao menos uma ação no período: concluir devocional, ler livro, destacar versículo, jogar quiz etc."],
  ["Ações", "Cada devocional, frase ou versículo concluído, destaque, pedido de oração, leitura de livro, quiz, nível do game ou abertura do app."],
  ["Retenção por mês", "Dos cadastrados em cada mês: quem voltou depois do primeiro dia, quem acessou nos últimos 30 dias e quem tem assinatura ativa."],
  ["Assinantes em risco", "Assinantes ativos que não abrem o app há mais de 14 dias."],
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
        <Button variant="glass" size="sm">
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
              <div key={term} className="rounded-lg border border-[#e4dfd5] bg-[#faf8f4] p-3">
                <dt className="text-sm font-semibold text-[#1d1b17]">{term}</dt>
                <dd className="mt-0.5 text-sm text-[#6e685e]">{description}</dd>
              </div>
            ))}
          </dl>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
