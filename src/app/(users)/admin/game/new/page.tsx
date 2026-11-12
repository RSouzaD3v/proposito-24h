import { redirect } from "next/navigation";

/** A criação agora acontece em um dialog na lista; o endereço antigo continua funcionando. */
export default function NewGamePage() {
  redirect("/admin/game?novo=1");
}
