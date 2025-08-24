import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: 'endpoint obrigatório' }, { status: 400 });
  await db.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
