import { redirect } from "next/navigation";

/** Cada tipo de conteúdo diário tem item próprio na barra lateral; a raiz abre o calendário. */
export default function DailyPage() {
  redirect("/writer/daily/management");
}
