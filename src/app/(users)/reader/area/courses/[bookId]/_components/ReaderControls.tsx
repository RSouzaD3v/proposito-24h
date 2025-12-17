"use client";

import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  List, Moon, Sun, Square, Type, ChevronLeft, ChevronRight, Settings2, X
} from "lucide-react";
import { useReaderPrefs, ReaderTheme, ReaderFont } from "./ReaderPrefsContext";
import { cn } from "@/lib/utils";

type Props = {
  chaptersCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (idx: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function ReaderControls({
  chaptersCount,
  currentIndex,
  onPrev,
  onNext,
  onJump,
  open,
  setOpen,
}: Props) {
  const { prefs, setPrefs } = useReaderPrefs();

  // Paletas 100% baseadas no tema do leitor
  const pal = useMemo(() => {
    if (prefs.theme === "dark") {
      return {
        txt: "text-white",
        panel: "bg-[#0e1318]/95",
        border: "border-white/10",
        chip: "bg-[#1a222b] text-white border border-white/20",
        btnOutline: "border-white/25 text-white hover:bg-white/10",
        fab: "bg-[#0e1318]/95 text-white border border-white/15",
        menu: "bg-[#0e1318] text-white border border-white/10",
        menuItem: "hover:bg-white/10",
      };
    }
    if (prefs.theme === "sepia") {
      return {
        txt: "text-[#2b2b2b]",
        panel: "bg-[#efe6cf]/95",
        border: "border-[#e1d7b9]",
        chip: "bg-[#f6efd9] text-[#2b2b2b] border border-[#e1d7b9]",
        btnOutline: "border-[#d8caa7] text-[#2b2b2b] hover:bg-[#eadfbe]",
        fab: "bg-[#efe6cf]/95 text-[#2b2b2b] border border-[#e1d7b9]",
        menu: "bg-[#efe6cf] text-[#2b2b2b] border border-[#e1d7b9]",
        menuItem: "hover:bg-[#eadfbe]",
      };
    }
    return {
      txt: "text-slate-800",
      panel: "bg-white/95",
      border: "border-slate-200",
      chip: "bg-slate-50 text-slate-800 border border-slate-200",
      btnOutline: "border-slate-300 text-slate-800 hover:bg-slate-100",
      fab: "bg-white/95 text-slate-800 border border-slate-200",
      menu: "bg-white text-slate-800 border border-slate-200",
      menuItem: "hover:bg-slate-100",
    };
  }, [prefs.theme]);

  const progress = Math.round(((currentIndex + 1) / Math.max(1, chaptersCount)) * 100);

  const setTheme = (v: ReaderTheme) => setPrefs({ ...prefs, theme: v });
  const setFont = (v: ReaderFont) => setPrefs({ ...prefs, font: v });

  // ESC fecha painel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <>
      {/* FAB (engrenagem) — DESKTOP apenas */}
      {!open && (
        <div className="fixed bottom-4 right-4 z-40 hidden md:block">
          <Button
            size="icon"
            variant={"secondary"}
            onClick={() => setOpen(true)}
            aria-label="Abrir controles de leitura"
            className={cn("rounded-full shadow-lg hover:opacity-90", pal.fab)}
          >
            <Settings2 className="size-5" />
          </Button>
        </div>
      )}

      {/* Painel deslizante */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 transition-transform duration-300",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div
          className={cn(
            "mx-auto max-w-4xl rounded-t-2xl shadow-lg p-3 backdrop-blur border",
            pal.panel,
            pal.border,
            pal.txt
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm opacity-80">Ajustes de leitura</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fechar painel"
              className="hover:opacity-80 text-current"
            >
              <X className="size-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between">
            {/* Navegação */}
            <div className="flex items-center gap-2">
              <Button variant={"ghost"} size="icon" onClick={onPrev} aria-label="Anterior" className="text-current">
                <ChevronLeft className="size-5" />
              </Button>
              <div className="text-sm tabular-nums min-w-[84px] text-center">
                {currentIndex + 1} / {chaptersCount}
              </div>
              <Button variant={"ghost"} size="icon" onClick={onNext} aria-label="Próximo" className="text-current">
                <ChevronRight className="size-5" />
              </Button>

              {/* Ir para capítulo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className={cn("ml-1 gap-2", pal.btnOutline)}>
                    <List className="size-4" /> Capítulos
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={cn("max-h-[300px] overflow-auto", pal.menu)}>
                  {Array.from({ length: chaptersCount }).map((_, i) => (
                    <DropdownMenuItem
                      key={i}
                      className={cn("justify-between", pal.menuItem, i === currentIndex && "font-semibold")}
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

            {/* Preferências */}
            <div className="flex flex-1 flex-wrap items-center gap-3 justify-end">
              {/* Fonte */}
              <div className="flex items-center gap-2">
                <Type className="size-4 opacity-80" />
                <Select value={prefs.font} onValueChange={(v) => setFont(v as any)}>
                  <SelectTrigger className={cn("w-[150px] rounded-md", pal.chip)}>
                    <SelectValue placeholder="Fonte" />
                  </SelectTrigger>
                  <SelectContent className={pal.menu}>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="sans">Sans</SelectItem>
                    <SelectItem value="mono">Mono</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tamanho */}
              <div className="flex items-center gap-2 w-[190px]">
                <span className="text-xs opacity-90 w-16">Tamanho</span>
                <Slider
                  min={14}
                  max={26}
                  step={1}
                  value={[prefs.fontSize]}
                  onValueChange={(v) => setPrefs({ ...prefs, fontSize: v[0] })}
                />
              </div>

              {/* Linha */}
              <div className="flex items-center gap-2 w-[230px]">
                <span className="text-xs opacity-90 w-16">Linha</span>
                <Slider
                  min={1.2}
                  max={2.2}
                  step={0.1}
                  value={[prefs.lineHeight]}
                  onValueChange={(v) =>
                    setPrefs({ ...prefs, lineHeight: Number(v[0].toFixed(1)) })
                  }
                />
              </div>

              {/* Largura (ch) */}
              <div className="flex items-center gap-2 w-[250px]">
                <span className="text-xs opacity-90 w-16">Largura</span>
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
                  <Button size="sm" variant="ghost" className={cn("gap-2", pal.btnOutline)}>
                    <Square className="size-4" />
                    {prefs.align === "justify" ? "Justificado" : "À esquerda"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={pal.menu}>
                  <DropdownMenuItem className={pal.menuItem} onClick={() => setPrefs({ ...prefs, align: "justify" })}>
                    Justificado
                  </DropdownMenuItem>
                  <DropdownMenuItem className={pal.menuItem} onClick={() => setPrefs({ ...prefs, align: "left" })}>
                    À esquerda
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tema */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className={cn("gap-2", pal.btnOutline)}>
                    {prefs.theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    Tema
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={pal.menu}>
                  <DropdownMenuItem className={pal.menuItem} onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
                  <DropdownMenuItem className={pal.menuItem} onClick={() => setTheme("sepia")}>Sépia</DropdownMenuItem>
                  <DropdownMenuItem className={pal.menuItem} onClick={() => setTheme("dark")}>Escuro</DropdownMenuItem>
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
    </>
  );
}
