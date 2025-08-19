import SubscriptionWriter from "./_contexts/Subscription";
export default function WriterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <SubscriptionWriter>
          <section>
              {children}
          </section>
      </SubscriptionWriter>
  );
}
