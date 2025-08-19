export default function OnboardingReturnPage() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600">🎉 Conexão realizada!</h1>
      <p className="mt-4 text-gray-700 max-w-md">
        Sua conta no Stripe foi conectada com sucesso.  
        Agora você já pode cadastrar publicações pagas e receber seus ganhos.
      </p>
      <a
        href="/writer/dashboard"
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Ir para o Dashboard
      </a>
    </main>
  );
}
