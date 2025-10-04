"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useReaderPrefs, ReaderTheme, ReaderFont } from "./ReaderPrefsContext";
import { cn } from "@/lib/utils";
import { List, Moon, Sun, Square, Type, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  chaptersCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
};

export default function ReaderControls({
  chaptersCount,
  currentIndex,
  onPrev,
  onNext,
  onJump,
}: Props) {
  const { prefs, setPrefs } = useReaderPrefs();

  const progress = useMemo(() => {
    if (chaptersCount <= 0) return 0;
    return Math.round(((currentIndex + 1) / chaptersCount) * 100);
  }, [chaptersCount, currentIndex]);

  function setTheme(theme: ReaderTheme) {
    setPrefs({ ...prefs, theme });
  }

  function setFont(font: ReaderFont) {
    setPrefs({ ...prefs, font });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      {/* barra inferior “flutuante” */}
      <div className="mx-auto max-w-4xl rounded-t-2xl border bg-white/90 backdrop-blur-lg dark:bg-neutral-900/90 shadow-lg p-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">

          {/* Navegação */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={onPrev} aria-label="Anterior">
              <ChevronLeft className="size-5" />
            </Button>
            <div className="text-sm tabular-nums min-w-[84px] text-center">
              {currentIndex + 1} / {chaptersCount}
            </div>
            <Button variant="secondary" size="icon" onClick={onNext} aria-label="Próximo">
              <ChevronRight className="size-5" />
            </Button>

            {/* Ir para capítulo */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-1 gap-2">
                  <List className="size-4" /> Capítulos
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[300px] overflow-auto">
                {Array.from({ length: chaptersCount }).map((_, i) => (
                  <DropdownMenuItem
                    key={i}
                    className={cn("justify-between", i === currentIndex && "font-semibold")}
                    onClick={() => onJump(i)}
                  >
                    Capítulo {i + 1}
                    {i === currentIndex && <span className="text-xs opacity-70">lendo</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator orientation="vertical" className="h-6 hidden md:block" />

          {/* Preferências de leitura */}
          <div className="flex flex-1 flex-wrap items-center gap-3 justify-end">

            {/* Fonte */}
            <div className="flex items-center gap-2">
              <Type className="size-4 opacity-70" />
              <Select value={prefs.font} onValueChange={(v) => setFont(v as any)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans</SelectItem>
                  <SelectItem value="mono">Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tamanho da fonte */}
            <div className="flex items-center gap-2 w-[180px]">
              <span className="text-xs opacity-70 w-14">Tamanho</span>
              <Slider
                min={14}
                max={26}
                step={1}
                value={[prefs.fontSize]}
                onValueChange={(v) => setPrefs({ ...prefs, fontSize: v[0] })}
              />
            </div>

            {/* Espaçamento de linha */}
            <div className="flex items-center gap-2 w-[220px]">
              <span className="text-xs opacity-70 w-14">Linha</span>
              <Slider
                min={1.2}
                max={2.2}
                step={0.1}
                value={[prefs.lineHeight]}
                onValueChange={(v) => setPrefs({ ...prefs, lineHeight: Number(v[0].toFixed(1)) })}
              />
            </div>

            {/* Largura da coluna (medida em ch) */}
            <div className="flex items-center gap-2 w-[240px]">
              <span className="text-xs opacity-70 w-14">Largura</span>
              <Slider
                min={55}
                max={85}
                step={1}
                value={[prefs.maxChars]}
                onValueChange={(v) => setPrefs({ ...prefs, maxChars: v[0] })}
              />
            </div>

            {/* Alinhamento */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Square className="size-4 mr-2" />
                  {prefs.align === "justify" ? "Justificado" : "Alinhar à esquerda"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setPrefs({ ...prefs, align: "justify" })}>
                  Justificado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPrefs({ ...prefs, align: "left" })}>
                  À esquerda
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tema */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {prefs.theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  Tema
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("sepia")}>Sépia</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Progresso */}
        <div className="mt-3">
          <Progress value={progress} aria-label="Progresso de leitura" />
        </div>
      </div>
    </div>
  );
}
