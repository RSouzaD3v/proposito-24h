// app/api/push/test/send/route.ts
import { NextResponse } from 'next/server';
import { webpush } from '@/lib/webpush';

export const runtime = 'nodejs';

type SendBody = {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  tag?: string;
};

export async function POST(req: Request) {
  const data = (await req.json()) as SendBody;

  if (!data?.subscription?.endpoint || !data?.subscription?.keys?.p256dh || !data?.subscription?.keys?.auth) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  const payload = JSON.stringify({
    title: data.title ?? 'propósito24h',
    body: data.body ?? 'Notificação de teste',
    url: data.url ?? '/',
    icon: data.icon ?? '/icon-192x192.png',
    tag: data.tag,
  });

  try {
    const r = await webpush.sendNotification(data.subscription as any, payload);
    return NextResponse.json({ ok: true, statusCode: r.statusCode });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message, statusCode: err?.statusCode }, { status: 500 });
  }
}
