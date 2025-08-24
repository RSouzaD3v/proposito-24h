// lib/webpush.ts
import webpush from 'web-push';

const PUBLIC = process.env.VAPID_PUBLIC_KEY!;
const PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const SUBJECT = process.env.WEB_PUSH_SUBJECT || 'mailto:contato@proposito24h.com';

if (!PUBLIC || !PRIVATE) {
  throw new Error('Configure VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no .env.local');
}

webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);
export { webpush };
