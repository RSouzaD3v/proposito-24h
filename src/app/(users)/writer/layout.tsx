import { AuthWriterProvider } from "./(check-subscription)/_contexts/AuthContext";

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
