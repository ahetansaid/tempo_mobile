// F1 — Recherche géolocalisée (front-office cliente, SSR).
// Liste les salons proches via PostGIS. Design repris du prototype (recherche_liste).
import Link from 'next/link';
import { rechercherSalons } from '@/lib/salons';

export const dynamic = 'force-dynamic';

const THUMBS = ['#141b34', '#7c3f12', '#3f4661', '#653e00', '#2f3a5c', '#5b3a1e'];

const fmtPrix = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const fmtDist = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
const fmtScore = (s: number) => s.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const initiales = (nom: string) =>
  nom.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const CHIPS = ['Ouvert maintenant', 'Coupe homme', 'Barbe', 'Tresses', 'Coloration'];

export default async function RecherchePage() {
  const salons = await rechercherSalons({ rayonM: 5000 });

  return (
    <main className="fo">
      <div className="fo-top">
        <ClockMark />
        <span className="wm">TEMPO</span>
        <Link href="/app" className="fo-switch">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" /></svg>
          Changer d’espace
        </Link>
      </div>

      <h1 className="fo-h1">Trouve un salon près de toi</h1>
      <p className="fo-sub">Réserve en 30 secondes, sans créer de compte.</p>

      <div className="fo-search">
        <SearchIcon />
        <span>Coiffeur, barbier, tresses…</span>
        <span className="loc">Cotonou · 5 km</span>
      </div>

      <div className="fo-chips">
        {CHIPS.map((c, i) => (
          <span key={c} className={'fo-chip' + (i === 0 ? ' on' : '')}>{c}</span>
        ))}
      </div>

      <p className="fo-count">{salons.length} salon{salons.length > 1 ? 's' : ''} à proximité</p>

      {salons.length === 0 ? (
        <p className="fo-empty">Aucun salon dans ce rayon. Élargis la recherche.</p>
      ) : (
        <div className="fo-list">
          {salons.map((s, i) => (
            <Link key={s.id} href={`/salon/${s.slug}`} className="fo-card">
              <div className="fo-thumb" style={{ background: THUMBS[i % THUMBS.length] }}>
                {initiales(s.nom)}
              </div>
              <div className="fo-body">
                <div className="fo-name">
                  {s.nom}
                  {s.scoreFiabilite !== null && (
                    <span className="fo-badge"><Shield /> {fmtScore(s.scoreFiabilite)}</span>
                  )}
                </div>
                <div className="fo-meta">{s.quartier}{s.ville ? `, ${s.ville}` : ''} · {fmtDist(s.distanceM)}</div>
                <div className="fo-line">
                  <span className="fo-tag">Sur RDV</span>
                  {s.prixMin !== null && <span className="fo-price">dès {fmtPrix(s.prixMin)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function ClockMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#141b34" />
      <g fill="none" stroke="#e0a458" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" />
        <path d="M16 16V9" /><path d="M16 16h6" />
      </g>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function Shield() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" />
    </svg>
  );
}
