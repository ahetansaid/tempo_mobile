// F2 — Fiche publique du salon (SSR). Prestations, horaires, score, « Réserver ».
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSalonBySlug, type Jour } from '@/lib/salons';

export const dynamic = 'force-dynamic';

const THUMBS = ['#141b34', '#7c3f12', '#3f4661', '#653e00', '#2f3a5c', '#5b3a1e'];
const fmtPrix = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const fmtScore = (s: number) => s.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDuree = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}` : `${m} min`);
const initiales = (nom: string) =>
  nom.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

const JOURS: { key: Jour; label: string }[] = [
  { key: 'lun', label: 'Lundi' }, { key: 'mar', label: 'Mardi' }, { key: 'mer', label: 'Mercredi' },
  { key: 'jeu', label: 'Jeudi' }, { key: 'ven', label: 'Vendredi' }, { key: 'sam', label: 'Samedi' },
  { key: 'dim', label: 'Dimanche' },
];
// getDay(): 0=dimanche … 6=samedi → clé du jour courant
const JOUR_KEYS: Jour[] = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

export default async function FicheSalon({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  const idx = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % THUMBS.length;
  const aujourdhui = JOUR_KEYS[new Date().getDay()];
  const mapsQuery = encodeURIComponent(`${salon.nom} ${salon.quartier ?? ''} ${salon.ville ?? ''}`);

  return (
    <div className="fi">
      <div className="fi-hero" style={{ background: THUMBS[idx] }}>
        <Link href="/recherche" className="fi-back" aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        {initiales(salon.nom)}
      </div>

      <div className="fi-wrap">
        <div className="fi-card">
          <h1 className="fi-name">{salon.nom}</h1>
          {salon.scoreFiabilite !== null && (
            <div className="fi-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" /></svg>
              Fiabilité {fmtScore(salon.scoreFiabilite)} / 10
            </div>
          )}
          <p className="fi-loc">{salon.quartier}{salon.ville ? `, ${salon.ville}` : ''}</p>

          <div className="fi-actions">
            {salon.telephone && (
              <a className="fi-ghost" href={`tel:${salon.telephone}`}>
                <Icon path="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.5a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
                Appeler
              </a>
            )}
            <a className="fi-ghost" href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noreferrer">
              <Icon path="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11z M12 10.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              Itinéraire
            </a>
          </div>
        </div>

        <p className="fi-sec">Prestations</p>
        <div className="fi-serv">
          {salon.prestations.map((s) => (
            <div key={s.id} className="fi-serv-row">
              <div className="fi-serv-info">
                <div className="fi-serv-lib">{s.libelle}</div>
                <div className="fi-serv-dur">{fmtDuree(s.dureeMin)}</div>
              </div>
              <div className="fi-serv-prix">{fmtPrix(s.prixFcfa)}</div>
              <Link className="fi-choisir" href={`/salon/${salon.slug}/reserver?service=${s.id}`}>Choisir</Link>
            </div>
          ))}
        </div>

        <p className="fi-sec">Horaires</p>
        <div className="fi-hours">
          {JOURS.map(({ key, label }) => {
            const plages = salon.horaires[key] ?? [];
            const ouvert = plages.length > 0;
            return (
              <div key={key} className={'fi-hours-row' + (key === aujourdhui ? ' today' : '')}>
                <span>{label}</span>
                <span className={ouvert ? '' : 'ferme'}>
                  {ouvert ? plages.map(([a, b]) => `${a} – ${b}`).join(', ') : 'Fermé'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fi-cta">
        <div className="fi-cta-inner">
          <Link className="fi-reserver" href={`/salon/${salon.slug}/reserver`}>Réserver</Link>
        </div>
      </div>
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {path.split(' M').map((d, i) => <path key={i} d={(i ? 'M' : '') + d} />)}
    </svg>
  );
}
