import { AuthWriterProvider } from "./(check-subscription)/_contexts/AuthContext";
import { WriterShell } from "@/components/ui/writer-shell";

export default function WriterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthWriterProvider>
      <WriterShell contained={false} className="min-h-screen">
        {children}
      </WriterShell>
    </AuthWriterProvider>
  );
}
