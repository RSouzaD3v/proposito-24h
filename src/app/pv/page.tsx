"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  PlayCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";

/**
 * Observações:
 * - Substitua CTA_URL e WHATSAPP_URL conforme seu fluxo real.
 * - Os componentes shadcn/ui devem estar instalados no projeto.
 * - Mantivemos a "pegada" original (gradiente, preço ancorado, vídeo, depoimentos),
 *   mas elevamos o design com shadcn/ui e copy voltada a ESCRITORES.
 */

const CTA_URL = "/register-writer"; // fluxo de cadastro do escritor
const WHATSAPP_URL = "#"; // opcional: link de dúvidas no WhatsApp

export default function LandingProposito24h() {
  // Exemplo simples para exibir vagas restantes (gatilho de escassez):
  const vagasRestantes = useMemo(() => 22, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600" />
            <span className="font-bold">Proposito24h</span>
            <Badge variant="secondary" className="ml-2">Para Escritores</Badge>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#como-funciona" className="text-sm hover:underline">Como funciona</a>
            <a href="#recursos" className="text-sm hover:underline">Recursos</a>
            <a href="#depoimentos" className="text-sm hover:underline">Resultados</a>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <a href={WHATSAPP_URL}>Dúvidas</a>
            </Button>
            <Button asChild className="group">
              <a href={CTA_URL}>
                Começar agora
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b bg-gradient-to-r from-blue-700 to-indigo-800 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 md:grid-cols-2">
          <div>
            <Badge className="mb-3 bg-yellow-400 text-black hover:bg-yellow-400">Nova turma • vagas limitadas</Badge>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Descubra como faturar de R$ 3.000 a R$ 10.000/mês publicando <span className="underline decoration-yellow-300">e‑books cristãos</span> na sua própria plataforma.
            </h1>
            <p className="mt-4 text-lg md:text-xl">
              Você recebe uma estrutura <span className="font-semibold">pronta para vender</span>, mantém <span className="font-semibold">100% do lucro*</span> e domina o seu catálogo sem depender de marketplaces.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="text-blue-950">Loja pronta em 1 dia</Badge>
              <Badge variant="secondary" className="text-blue-950">Checkout com Stripe Connect</Badge>
              <Badge variant="secondary" className="text-blue-950">Templates profissionais</Badge>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 text-base font-semibold">
                <a href={CTA_URL}>Quero minha plataforma</a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="h-12 text-base">
                <a href="#video" className="inline-flex items-center">
                  <PlayCircle className="mr-2 size-5" /> Ver como funciona
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs opacity-90">*Sujeito a tarifas do processador de pagamentos.</p>
          </div>

          {/* Vídeo responsivo */}
          <div id="video" className="rounded-xl bg-white/5 p-2 shadow-2xl ring-1 ring-white/10">
            <AspectRatio ratio={16 / 9}>
              <iframe
                src="https://www.youtube.com/embed/pltBcIZZyXY?rel=0&modestbranding=1"
                title="Apresentação Proposito24h"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full rounded-lg border-0"
              />
            </AspectRatio>
          </div>
        </div>

        {/* Métricas rápidas (gatilho de prova) */}
        <div className="relative mx-auto mt-10 max-w-6xl px-4">
          <Card className="bg-white/10 text-white backdrop-blur">
            <CardContent className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
              <Metric icon={<Users className="size-5" />} label="Escritores ativos" value={"+120"} />
              <Metric icon={<TrendingUp className="size-5" />} label="Vendas/dia (média)" value={"3,4"} />
              <Metric icon={<Clock className="size-5" />} label="Primeira venda" value={"≤ 14 dias"} />
              <Metric icon={<BookOpen className="size-5" />} label="Títulos publicados" value={"+850"} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold md:text-4xl">O que é a plataforma Proposito24h?</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Uma plataforma white‑label para você lançar, vender e escalar seus e‑books cristãos com recursos de alto impacto.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Configure em horas"
            icon={<Check className="size-5" />}
            description="Escolha um tema, suba seus e‑books e conecte o pagamento. Sua loja fica pronta muito rápido."
          />
          <FeatureCard
            title="Venda sem intermediários"
            icon={<Wallet className="size-5" />}
            description="Receba direto na sua conta Stripe Connect, controle preços, cupons e bundles."
          />
          <FeatureCard
            title="Cresça com dados"
            icon={<TrendingUp className="size-5" />}
            description="Pixel/UTM, funis de vendas e analytics para escalar com previsibilidade."
          />
        </div>
      </section>

      {/* RECURSOS EM DESTAQUE */}
      <section id="recursos" className="bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h3 className="text-center text-xl font-semibold md:text-2xl">Tudo que você precisa para vender todos os dias</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {recursos.map((r) => (
              <Card key={r.title} className="hover:shadow-lg">
                <CardHeader className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">{r.icon}<span className="font-semibold">{r.title}</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {r.items.map((i) => (
                      <li key={i} className="flex items-start gap-2"><Check className="mt-0.5 size-4" />{i}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-2xl font-bold md:text-3xl">Casos reais de escritores</h3>
          <p className="mt-2 text-muted-foreground">Prova social: resultados de quem aplicou o método e usou a plataforma.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testemunhos.map((t) => (
            <Card key={t.nome} className="hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={t.avatar} />
                    <AvatarFallback>{t.nome.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.nome}</p>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`size-4 ${i < t.stars ? "fill-yellow-500" : "opacity-30"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed">“{t.texto}”</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* PREÇOS / OFERTA */}
      <section className="border-y bg-gradient-to-r from-emerald-600 to-green-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-extrabold md:text-5xl">
              De <span className="line-through opacity-80">R$ 997,00</span> por apenas <span className="text-yellow-300">R$ 67,99</span>
            </h3>
            <p className="mt-2 text-lg">Acesso completo + mentoria individual de 1h</p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span>Vagas desta turma</span>
              <span className="font-semibold">{vagasRestantes} restantes</span>
            </div>
            <Progress value={(vagasRestantes / 100) * 100} className="h-2 bg-white/20" />
          </div>

          <Tabs defaultValue="mensal" className="mx-auto mt-8 max-w-4xl">
            <TabsList className="grid w-full grid-cols-2 bg-white/20">
              <TabsTrigger value="mensal" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">Plano Mensal</TabsTrigger>
              <TabsTrigger value="vitalicio" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700">Vitalício (único)</TabsTrigger>
            </TabsList>
            <TabsContent value="mensal" className="mt-6">
              <Card className="border-emerald-100 bg-white text-emerald-900">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">MELHOR PARA COMEÇAR</p>
                      <h4 className="text-2xl font-extrabold">R$ 67,99/mês</h4>
                    </div>
                    <Badge variant="secondary" className="text-emerald-800">Garantia 30 dias</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Plataforma completa white‑label</li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Mentoria individual (1h)</li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Suporte e atualizações</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
                  <Button asChild size="lg" className="h-12 flex-1">
                    <a href={CTA_URL}>Começar com mensal</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 flex-1">
                    <a href={WHATSAPP_URL}>Falar com especialista</a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="vitalicio" className="mt-6">
              <Card className="border-emerald-100 bg-white text-emerald-900">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">PAGAMENTO ÚNICO</p>
                      <h4 className="text-2xl font-extrabold">R$ 497,00 (vitalício)</h4>
                    </div>
                    <Badge variant="secondary" className="text-emerald-800">Economize 7+ meses</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Acesso vitalício à plataforma</li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Atualizações futuras inclusas</li>
                    <li className="flex items-start gap-2"><Check className="mt-0.5 size-4 text-emerald-600" /> Todos os recursos do plano mensal</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-2 sm:flex-row">
                  <Button asChild size="lg" className="h-12 flex-1">
                    <a href={CTA_URL + "?plan=vitalicio"}>Garantir vitalício</a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 flex-1">
                    <a href={WHATSAPP_URL}>Tirar dúvidas</a>
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mx-auto mt-8 max-w-3xl">
            <Alert className="bg-white/10 text-white">
              <ShieldCheck className="size-5" />
              <AlertTitle>Garantia incondicional de 30 dias</AlertTitle>
              <AlertDescription>
                Se não ficar satisfeito, devolvemos 100% do valor. Simples assim.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h3 className="mb-6 text-center text-2xl font-bold md:text-3xl">Perguntas Frequentes</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Como recebo o acesso?</AccordionTrigger>
            <AccordionContent>
              Você recebe um e‑mail com instruções e acesso imediato à plataforma após a confirmação do pagamento.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Tenho suporte?</AccordionTrigger>
            <AccordionContent>
              Sim! Suporte por WhatsApp/Email e uma mentoria individual de 1h para traçar sua estratégia.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Posso usar meu domínio?</AccordionTrigger>
            <AccordionContent>
              Sim. Suportamos domínio próprio e subdomínios por escritor.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>Quem fica com o lucro das vendas?</AccordionTrigger>
            <AccordionContent>
              Você. O valor das vendas cai na sua conta conectada (Stripe Connect). Podem existir tarifas do processador.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t bg-muted/40 py-8 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Proposito24h — Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <a className="hover:underline" href="#">Política de Privacidade</a>
            <Separator orientation="vertical" className="h-4" />
            <a className="hover:underline" href="#">Aviso Legal</a>
          </div>
        </div>
      </footer>

      {/* BARRA FIXA DE CONVERSÃO */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="hidden items-center gap-3 md:flex">
            <ShieldCheck className="size-5 text-emerald-600" />
            <span className="text-sm">Garantia 30 dias • {vagasRestantes} vagas restantes</span>
          </div>
          <div className="flex flex-1 items-center gap-2 md:flex-none">
            <Button asChild className="w-full md:w-auto">
              <a href={CTA_URL}>Garantir acesso</a>
            </Button>
            <Button asChild variant="outline" className="w-full md:w-auto">
              <a href={WHATSAPP_URL}>Falar no WhatsApp</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------------------- Componentes auxiliares ---------------------- */
function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg bg-white/10">{icon}</div>
      <div>
        <div className="text-lg font-bold leading-none">{value}</div>
        <div className="text-xs opacity-80">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
        <div className="font-semibold">{title}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const recursos = [
  {
    title: "Loja completa",
    icon: <BookOpen className="size-5" />,
    items: [
      "Página de vendas com alta conversão",
      "Upload de e‑books (PDF/EPUB)",
      "Área do leitor com histórico de compras"
    ]
  },
  {
    title: "Vendas & Pagamentos",
    icon: <Wallet className="size-5" />,
    items: [
      "Stripe Connect integrado",
      "Cupons, bundles e upgrades",
      "Relatórios de receita"
    ]
  },
  {
    title: "Crescimento",
    icon: <TrendingUp className="size-5" />,
    items: [
      "Pixel/UTM e funis",
      "PWA e performance para SEO",
      "Coleta de depoimentos"
    ]
  }
];

const testemunhos = [
  {
    nome: "Marina S.",
    avatar: "https://i.pravatar.cc/100?img=5",
    stars: 5,
    texto: "Consegui meus primeiros R$ 5.000 em 2 meses após lançar meu kit de devocionais."
  },
  {
    nome: "Paulo R.",
    avatar: "https://i.pravatar.cc/100?img=12",
    stars: 5,
    texto: "Abandonei o improviso: agora tenho loja e dados para escalar com anúncios."
  },
  {
    nome: "Lívia M.",
    avatar: "https://i.pravatar.cc/100?img=32",
    stars: 5,
    texto: "A mentoria mostrou o caminho de preço e oferta. Vendas diárias!"
  }
];
