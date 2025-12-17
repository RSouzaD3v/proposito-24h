"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  tab: string;
}

export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  tab,
}: Props) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center pt-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        asChild
      >
        <Link href={`?tab=${tab}&page=${currentPage - 1}`}>
          Anterior
        </Link>
      </Button>

      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        asChild
      >
        <Link href={`?tab=${tab}&page=${currentPage + 1}`}>
          Próxima
        </Link>
      </Button>
    </div>
  );
}
