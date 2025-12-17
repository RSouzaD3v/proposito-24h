import MySubscriptions from "@/components/subscriptions/MySubscriptions";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Minhas assinaturas</h1>
      <MySubscriptions />
    </main>
  );
}
