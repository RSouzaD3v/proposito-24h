import { LoadingState } from "@/components/ui/loading-state";

/** Resposta imediata ao navegar: a tela principal pode levar alguns segundos para carregar. */
export default function ReaderAreaLoading() {
  return <LoadingState variant="full" label="Carregando..." />;
}
