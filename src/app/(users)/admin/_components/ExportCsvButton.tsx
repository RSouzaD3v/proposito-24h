"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Gera o CSV no navegador (separador ";" para abrir direto no Excel em pt-BR). */
export function ExportCsvButton({
  filename,
  headers,
  rows,
  label = "Exportar CSV",
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  label?: string;
}) {
  const download = () => {
    const escape = (value: string | number) => {
      const text = String(value);
      return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const csv = [headers, ...rows].map((row) => row.map(escape).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="glass" size="sm" className="rounded-full" onClick={download} disabled={rows.length === 0}>
      <Download className="size-4" /> {label}
    </Button>
  );
}
