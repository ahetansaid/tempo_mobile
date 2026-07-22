// Entrée de l'espace professionnel (thème sombre « app pro »).
import Link from 'next/link';
import ProAccount from '../_components/pro-account';

export const metadata = { title: 'TEMPO Pro — Ton salon, à l’heure' };

export default function ProEntry() {
  return (
    <div className="pro">
      <div className="pro-entry">
        <div className="top">
          <Link href="/" className="pro-brand">
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="9" fill="#1a2340" stroke="rgba(224,164,88,.35)" />
              <g fill="none" stroke="#e0a458" strokeWidth="2.3" strokeLinecap="round">
                <circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" /><path d="M16 16V9" /><path d="M16 16h6" />
              </g>
            </svg>
            <span className="wm">TEMPO</span>
          </Link>
        </div>

        <span className="pro-eyebrow">Espace professionnel</span>
        <h1>Ton salon,<br /><span className="accent">à l’heure.</span></h1>
        <p className="lead">Reçois tes réservations, remplis tes heures creuses et garde ton agenda toujours à jour.</p>

        <div className="pro-points">
          <div className="pro-point"><span className="ic"><Ico d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></span> Tes réservations en direct</div>
          <div className="pro-point"><span className="ic"><Ico d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /></span> Un agenda clair, même en solo</div>
          <div className="pro-point"><span className="ic"><Ico d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3zM9 12l2 2 4-4" /></span> Zéro double-booking, garanti</div>
        </div>

        <div className="actions">
          <Link href="/pro/onboarding" className="pro-btn">Créer mon salon <Ico d="M5 12h14M13 6l6 6-6 6" w={18} /></Link>
          <Link href="/pro/connexion" className="pro-ghost">J’ai déjà un compte</Link>
        </div>

        <ProAccount />
      </div>
    </div>
  );
}

function Ico({ d, w = 20 }: { d: string; w?: number }) {
  return (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}
