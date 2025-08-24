'use client';

import { useEffect } from 'react';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr;
}

export default function PushBootstrap({ writerId, userId }: { writerId?: string; userId?: string }) {
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // suporte básico
      const supported =
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      if (!supported) return;

      // registra SW
      await navigator.serviceWorker.register('/sw.js');
      const registration = await navigator.serviceWorker.ready;

      // se já está permitido → assina
      if (Notification.permission === 'granted') {
        const sub = (await registration.pushManager.getSubscription()) ||
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          }));
        if (!cancelled) await save(sub);
        return;
      }

      // se nunca perguntamos, pergunta 1x
      const asked = localStorage.getItem('pushAsked');
      if (!asked) {
        const p = await Notification.requestPermission();
        localStorage.setItem('pushAsked', '1');
        if (p === 'granted') {
          const sub = (await registration.pushManager.getSubscription()) ||
            (await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            }));
          if (!cancelled) await save(sub);
        }
      }
    }

    async function save(sub: PushSubscription) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userId: userId ?? null,
          writerId: writerId ?? null,
          topics: ['new-book'],
        }),
      });
    }

    run();
    return () => { cancelled = true; };
  }, [writerId, userId]);

  return null;
}
