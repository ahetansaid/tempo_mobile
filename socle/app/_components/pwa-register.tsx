'use client';
import { useEffect } from 'react';

// Enregistre le service worker et capte l'événement d'installation (Android/Chrome)
// pour que le bouton « Installer l'app » puisse le déclencher.
declare global { interface Window { __tempoBIP?: Event | null } }

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const onBIP = (e: Event) => {
      e.preventDefault();
      window.__tempoBIP = e;
      window.dispatchEvent(new Event('tempo-installable'));
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);
  return null;
}
