import PushTestClient from '@/components/PushTestClient';

export default function Page() {
  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Notificações</h1>
      <p className="text-sm mb-4">Sem banco: local e push imediato.</p>
      <PushTestClient />
    </main>
  );
}
