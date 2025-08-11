import { HeaderReader } from "./_components/HeaderReader";
import { MenuPainel } from "./_components/MenuPainel";
import { AuthReaderProvider } from "./_contexts/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthReaderProvider>
        <section>
            <HeaderReader />
            <div className="mt-32">
                {children}
            </div>
            <MenuPainel />
        </section>
    </AuthReaderProvider>
  );
}
