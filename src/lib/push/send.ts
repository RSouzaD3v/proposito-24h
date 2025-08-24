import { db } from '@/lib/db';
import { webpush } from '@/lib/webpush';

type Payload = { title?: string; body?: string; url?: string; icon?: string; tag?: string };

export async function sendPushToWriterTopic(writerId: string, topic: string, payload: Payload) {
  const subs = await db.pushSubscription.findMany({
    where: { writerId, topics: { has: topic } }
  });

  const msg = JSON.stringify({
    title: payload.title ?? 'propósito24h',
    body:  payload.body  ?? 'Nova atualização',
    url:   payload.url   ?? '/',
    icon:  payload.icon  ?? '/icon-192x192.png',
    tag:   payload.tag,
  });

  const results = await Promise.allSettled(
    subs.map(s => webpush.sendNotification(
      { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, msg
    ))
  );

  const toRemove: string[] = [];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const code = (r.reason?.statusCode ?? r.reason?.status) || 0;
      if (code === 404 || code === 410) toRemove.push(subs[i].endpoint);
    }
  });
  if (toRemove.length) {
    await db.pushSubscription.deleteMany({ where: { endpoint: { in: toRemove } } });
  }

  return { sent: subs.length, removed: toRemove.length };
}

// helper específico: "novo livro"
export async function notifyNewBook(writerId: string, book: { id: string; title: string; slug: string }) {
  return sendPushToWriterTopic(writerId, 'new-book', {
    title: 'Novo livro publicado',
    body: `“${book.title}” acabou de sair. Toque para ler.`,
    url: `/books/${book.slug}`,
    tag: `book-${book.id}`
  });
}
