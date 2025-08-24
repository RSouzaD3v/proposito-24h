'use client';

import { useEffect, useState } from 'react';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const result = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) result[i] = rawData.charCodeAt(i);
  return result;
}

export default function PushTestClient() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [sub, setSub] = useState<PushSubscription | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ok =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setSupported(ok);

    if (ok) {
      // registra SW
      navigator.serviceWorker.register('/sw.js').then(async () => {
        await navigator.serviceWorker.ready;
        setReady(true);
        setPermission(Notification.permission);
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        setSub(existing);
      }).catch(() => {});
    }
  }, []);

  async function requestPermissao() {
    if (!supported) return;
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      setPermission(p);
    }
  }

  async function notificarLocal() {
    if (!supported) return;
    if (Notification.permission !== 'granted') {
      await requestPermissao();
      if (Notification.permission !== 'denied') return;
    }
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('propósito24h', {
      body: 'Notificação local de teste',
      icon: '/icon-192x192.png',
      data: { url: '/' },
    });
  }

  async function assinarPush() {
    if (!supported) return;
    if (Notification.permission !== 'granted') {
      await requestPermissao();
      if (Notification.permission !== 'denied') return;
    }
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    if (existing) { setSub(existing); return existing; }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    setSub(subscription);
    return subscription;
  }

  async function enviarPushTeste() {
    const subscription = sub ?? (await assinarPush());
    if (!subscription) return;
    await fetch('/api/push/test/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        title: 'Novo devocional',
        body: 'Confira a mensagem de hoje',
        url: '/devocionais/hoje',
      }),
    });
  }

  async function desinscrever() {
    if (!sub) return;
    await sub.unsubscribe();
    setSub(null);
  }

  if (!supported) {
    return <div className="text-sm text-muted-foreground">Seu navegador não suporta Push/Notifications.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm">
        Permissão: <b>{permission}</b> {ready ? '• SW pronto' : '• carregando SW...'}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={requestPermissao} className="px-4 py-2 rounded-lg border">Permitir</button>
        <button onClick={notificarLocal} className="px-4 py-2 rounded-lg bg-black text-white">Notificação local</button>
        <button onClick={enviarPushTeste} className="px-4 py-2 rounded-lg bg-black text-white">Assinar & Enviar Push</button>
        <button onClick={desinscrever} className="px-4 py-2 rounded-lg border" disabled={!sub}>Desinscrever</button>
      </div>
    </div>
  );
}
