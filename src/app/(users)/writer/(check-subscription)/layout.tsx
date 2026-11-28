import SubscriptionWriter from "./_contexts/Subscription";
import { StudioLayout } from "../_components/StudioLayout";

export default function WriterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SubscriptionWriter>
      <StudioLayout>{children}</StudioLayout>
    </SubscriptionWriter>
  );
}
