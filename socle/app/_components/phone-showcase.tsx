'use client';
import { useEffect, useState } from 'react';

// Un seul téléphone centré dont l'écran défile automatiquement (crossfade).
const SCREENS = [
  { src: '/app/accueil.webp', label: 'Accueil' },
  { src: '/app/reserver.webp', label: 'Choix du créneau' },
  { src: '/app/mes-rdv.webp', label: 'Mes rendez-vous' },
];

export default function PhoneShowcase() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % SCREENS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ph-show">
      <div className="ph-glow" aria-hidden />
      <div className="ph-frame">
        <div className="ph-island" />
        <div className="ph-screen">
          {SCREENS.map((s, idx) => (
            <img key={s.src} src={s.src} alt={s.label} className={idx === i ? 'on' : ''} decoding="async" />
          ))}
        </div>
      </div>
      <div className="ph-dots">
        {SCREENS.map((s, idx) => (
          <button key={s.src} className={idx === i ? 'on' : ''} onClick={() => setI(idx)} aria-label={s.label} />
        ))}
      </div>
    </div>
  );
}
