export default function DocsLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <section>
            {children} 
        </section>
    );
}