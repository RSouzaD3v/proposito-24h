"use client";

import Link from "next/link";
import { CalendarClock, Crown, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ManageSubscription from "./ManageSubscription";

type Props = {
  writerId: string;
  writerName: string;
  writerSlug?: string | null;
  writerLogoUrl?: string | null;
  status: string;
  isActive: boolean;
  isTrial?: boolean;
  lifetime?: boolean;
  statusLabel?: string;
  nextPaymentLabel?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  showManage?: boolean;
};

export default function SubscriptionStatusCard({
  writerId,
  writerName,
  writerSlug,
  writerLogoUrl,
  status,
  isActive,
  isTrial,
  lifetime,
  statusLabel,
  nextPaymentLabel,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  showManage = true,
}: Props) {
  const statusVariant = isActive ? (isTrial ? "secondary" : "default") : "outline";

  return (
    <Card className="border-border/60 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {writerLogoUrl ? (
            <img
              src={writerLogoUrl}
              alt=""
              className="size-12 rounded-full object-cover ring-2 ring-primary/15"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Crown className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-lg">{writerName}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant as "default" | "secondary" | "outline"}>
                {lifetime ? "Vitalício" : statusLabel ?? status}
              </Badge>
              {isTrial && isActive ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                  <Sparkles className="size-3.5" />
                  Teste grátis
                </span>
              ) : null}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isActive && nextPaymentLabel ? (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
            <CalendarClock className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{nextPaymentLabel}</p>
              {currentPeriodEnd ? (
                <p className="text-muted-foreground text-xs">
                  Até{" "}
                  {new Date(currentPeriodEnd).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {!isActive && writerSlug ? (
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/reader/area/w/${writerSlug}`}>Assinar agora</Link>
          </Button>
        ) : null}

        {showManage && isActive ? (
          <ManageSubscription
            writerId={writerId}
            status={status}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            currentPeriodEnd={currentPeriodEnd ?? null}
            isTrial={isTrial}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
