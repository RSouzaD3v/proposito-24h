export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <section className="bg-gray-950 text-white min-h-screen flex flex-col">
            {children}
        </section>
  );
}
