'use client';
import { useEffect, useState } from 'react';

// Bouton « Installer l'app » (PWA). Déclenche l'invite native sur Android/Chrome,
// affiche les instructions sur iOS, et un état « installée » si déjà présente.
type BIP = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

export default function InstallButton() {
  const [prompt, setPrompt] = useState<BIP | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    const grab = () => setPrompt((window.__tempoBIP as BIP) ?? null);
    grab();
    window.addEventListener('tempo-installable', grab);
    const onInstalled = () => setInstalled(true);
    window.addEventListener('appinstalled', onInstalled);

    const ua = navigator.userAgent || '';
    setIos(/iphone|ipad|ipod/i.test(ua));
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) setInstalled(true);

    return () => {
      window.removeEventListener('tempo-installable', grab);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function onClick() {
    if (prompt) {
      prompt.prompt();
      try { const r = await prompt.userChoice; if (r.outcome === 'accepted') setInstalled(true); } catch {}
      window.__tempoBIP = null; setPrompt(null);
      return;
    }
    if (ios) { setShowIos((v) => !v); return; }
    setShowIos((v) => !v); // hint pour desktop / navigateur non compatible
  }

  if (installed) {
    return (
      <div className="dl-installed">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        App installée
      </div>
    );
  }

  return (
    <div>
      <button className="dl-install" onClick={onClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4M4 21h16" /></svg>
        Installer l’app
      </button>
      {showIos && (
        <p className="dl-ioshint">
          {ios
            ? <>Sur iPhone : appuie sur <b>Partager</b> puis <b>« Sur l’écran d’accueil »</b>.</>
            : <>Ouvre TEMPO sur ton téléphone <b>Android (Chrome)</b> pour installer l’app en un tap.</>}
        </p>
      )}
    </div>
  );
}
