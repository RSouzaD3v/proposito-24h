export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen flex flex-col text-[var(--liquid-ink)]">
      {children}
    </section>
  );
}
