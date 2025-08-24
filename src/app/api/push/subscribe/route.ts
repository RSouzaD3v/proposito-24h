import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

type Body = {
  subscription: {
    endpoint: string;
    expirationTime: number | null;
    keys: { p256dh: string; auth: string };
  };
  userId?: string | null;
  writerId?: string | null;
  topics?: string[]; // default: ["new-book"]
};

export async function POST(req: Request) {
  const b = (await req.json()) as Body;
  const sub = b.subscription;
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }
  const expirationTime = sub.expirationTime ? new Date(sub.expirationTime) : null;
  const topics = (b.topics && b.topics.length) ? b.topics : ['new-book'];

  await db.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      expirationTime,
      userId: b.userId ?? undefined,
      writerId: b.writerId ?? undefined,
      topics
    },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      expirationTime,
      userId: b.userId ?? undefined,
      writerId: b.writerId ?? undefined,
      topics
    },
  });

  return NextResponse.json({ ok: true });
}
