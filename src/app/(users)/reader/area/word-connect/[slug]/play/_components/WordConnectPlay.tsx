"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { completeLevel } from "../actions";
import Link from "next/link";

interface Word {
  word: string;
  bonus: boolean;
}

interface Point {
  x: number; // 0 - 1
  y: number; // 0 - 1
}

interface WordConnectPlayProps {
  gameId: string;
  levelId: string;
  playerGameId: string;
  letters: string[];
  layout: Point[];
  words: Word[];
  currentLevel: number;
  coins: number;
}

export default function WordConnectPlay(props: WordConnectPlayProps) {
  const letters = props.letters.map((l) => l.toUpperCase());
  const validWords = props.words.map((w) => w.word.toUpperCase());
  const points = props.layout;

  const [currentWord, setCurrentWord] = useState("");
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const boardRef = useRef<HTMLDivElement>(null);

  /* =======================
     Game logic
  ======================= */
  function selectLetter(index: number) {
    if (path.includes(index)) return;

    setPath((prev) => [...prev, index]);
    setCurrentWord((prev) => prev + letters[index]);
    setError(null);
  }

  function resetPath() {
    setPath([]);
    setCurrentWord("");
  }

  function submitWord() {
    if (!currentWord) return;

    if (!validWords.includes(currentWord)) {
      setError("Palavra inválida");
      resetPath();
      return;
    }

    if (foundWords.includes(currentWord)) {
      setError("Palavra já encontrada");
      resetPath();
      return;
    }

    setFoundWords((prev) => [...prev, currentWord]);
    resetPath();
  }

  function handleCompleteLevel() {
    startTransition(async () => {
      await completeLevel({
        playerGameId: props.playerGameId,
        levelId: props.levelId,
        foundWords,
        score: foundWords.length * 10,
      });

      window.location.reload();
    });
  }

  const completed =
    validWords.length > 0 && foundWords.length === validWords.length;

  /* =======================
     Layout helpers
  ======================= */
  function getPosition(p: Point) {
    // zona segura interna para centralizar melhor
    const SAFE_MARGIN = 18; // %
    const SAFE_AREA = 100 - SAFE_MARGIN * 2;

    return {
      left: `${SAFE_MARGIN + p.x * SAFE_AREA}%`,
      top: `${SAFE_MARGIN + p.y * SAFE_AREA}%`,
      transform: "translate(-50%, -50%)",
    };
  }

  /* =======================
     Render
  ======================= */
  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <Link href={"/reader/area/game"} className="bg-black hover:bg-gray-800 text-white p-2 rounded-sm">
            Voltar
        </Link>
      {/* HUD */}
      <div className="flex items-center justify-between mt-5">
        <Badge variant="outline">Nível {props.currentLevel}</Badge>
        <Badge variant="secondary">🪙 {props.coins}</Badge>
      </div>

      {/* Palavra atual */}
      <Card className="p-4 text-center">
        <p className="text-2xl font-bold tracking-widest">
          {currentWord || "—"}
        </p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </Card>

      {/* Board */}
      <div
        ref={boardRef}
        className="relative w-full aspect-square rounded-2xl bg-muted/60 border overflow-hidden"
      >
        {/* Linhas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {path.map((idx, i) => {
            if (i === 0) return null;

            const from = points[path[i - 1]];
            const to = points[idx];

            return (
              <line
                key={i}
                x1={`${18 + from.x * (100 - 36)}%`}
                y1={`${18 + from.y * (100 - 36)}%`}
                x2={`${18 + to.x * (100 - 36)}%`}
                y2={`${18 + to.y * (100 - 36)}%`}
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Letras */}
        {letters.map((letter, i) => (
          <button
            key={i}
            onClick={() => selectLetter(i)}
            disabled={completed || isPending}
            style={getPosition(points[i])}
            className={`
              absolute flex items-center justify-center
              rounded-xl font-bold
              bg-background border shadow-md
              transition-all select-none
              w-[clamp(52px,12vw,68px)]
              h-[clamp(52px,12vw,68px)]
              text-[clamp(20px,4vw,24px)]
              p-3
              ${
                path.includes(i)
                  ? "bg-primary text-primary-foreground scale-110"
                  : "hover:scale-105"
              }
            `}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={resetPath}
          disabled={isPending}
        >
          Limpar
        </Button>
        <Button
          className="flex-1"
          onClick={submitWord}
          disabled={isPending}
        >
          Confirmar
        </Button>
      </div>

      {/* Found words */}
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground">
          Palavras encontradas
        </h3>
        <div className="flex flex-wrap gap-2">
          {foundWords.map((word) => (
            <Badge key={word}>{word}</Badge>
          ))}
        </div>
      </Card>

      {/* Complete */}
      {completed && (
        <Card className="p-4 text-center space-y-3">
          <h2 className="text-xl font-bold">🎉 Nível concluído!</h2>
          <Button
            className="w-full"
            onClick={handleCompleteLevel}
            disabled={isPending}
          >
            {isPending ? "Carregando..." : "Próximo nível"}
          </Button>
        </Card>
      )}
    </div>
  );
}
