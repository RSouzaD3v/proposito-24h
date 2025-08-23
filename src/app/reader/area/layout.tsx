// import { HeaderReader } from "./_components/HeaderReader";
// import { MenuPainel } from "./_components/MenuPainel";
import { AuthReaderProvider } from "./_contexts/AuthContext";
import { ThemeWriterProvider } from "./_contexts/ThemeWriterContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthReaderProvider>
      <ThemeWriterProvider>
          <section>
              {/* <HeaderReader /> */}
              <div>
                  {children}
              </div>
              {/* <MenuPainel /> */}
          </section>
      </ThemeWriterProvider>
    </AuthReaderProvider>
  );
}
