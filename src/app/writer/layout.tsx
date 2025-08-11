import { AuthWriterProvider } from "./_contexts/AuthContext";

export default function WriterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWriterProvider>
        <section>
            {children}
        </section>
    </AuthWriterProvider>
  );
}
