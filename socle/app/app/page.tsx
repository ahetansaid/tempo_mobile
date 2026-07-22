'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Phase = 'loading' | 'splash' | 'intro' | 'fork' | 'terms';

const SLIDES = [
  { ic: 'pin', titre: 'Le bon créneau,\nau bon moment', txt: 'Trouve un coiffeur ou un barbier près de toi, en un instant.' },
  { ic: 'bolt', titre: 'Réserve en 30 secondes', txt: 'Sans compte, sans attente. Ta place est garantie, jamais de double-booking.' },
  { ic: 'store', titre: 'Coiffeur ? Gère ton salon', txt: 'Reçois tes réservations et remplis tes heures creuses, sans effort.' },
];

export default function AppEntry() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [slide, setSlide] = useState(0);
  const [pending, setPending] = useState<{ role: string; dest: string } | null>(null);
  const [accepte, setAccepte] = useState(false);
  const touch = useRef<number | null>(null);

  // À l'ouverture : on montre l'intro la 1re fois, sinon on revient direct au choix de persona.
  useEffect(() => {
    let seen = false;
    try { seen = localStorage.getItem('tempo_seen_intro') === '1'; } catch {}
    if (seen) { setPhase('fork'); return; }
    setPhase('splash');
    const t = setTimeout(() => setPhase('intro'), 1700);
    return () => clearTimeout(t);
  }, []);

  function allerFork() {
    try { localStorage.setItem('tempo_seen_intro', '1'); } catch {}
    setPhase('fork');
  }

  function choisir(role: 'cliente' | 'pro') {
    try { localStorage.setItem('tempo_role', role); } catch {}
    const dest = role === 'cliente' ? '/recherche' : '/pro';
    let terms = false;
    try { terms = localStorage.getItem('tempo_terms') === '1'; } catch {}
    if (terms) { router.push(dest); return; }
    setPending({ role, dest });
    setPhase('terms');
  }

  function accepter() {
    try { localStorage.setItem('tempo_terms', '1'); } catch {}
    if (pending) router.push(pending.dest);
  }

  const onTouchStart = (e: React.TouchEvent) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current === null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (dx < -40 && slide < SLIDES.length - 1) setSlide(slide + 1);
    if (dx > 40 && slide > 0) setSlide(slide - 1);
    touch.current = null;
  };

  if (phase === 'loading') return <div className="ob" />;

  if (phase === 'splash') {
    return (
      <div className="ob ob-center">
        <div className="ob-splash"><Logo draw /><span className="ob-wm">TEMPO</span></div>
      </div>
    );
  }

  if (phase === 'fork') {
    return (
      <div className="ob">
        <div className="ob-fork">
          <div className="ob-fork-head">
            <Logo />
            <h1>Tu es… ?</h1>
            <p>Choisis ton espace, on s’occupe du reste.</p>
          </div>
          <button className="ob-card oc-cliente" onClick={() => choisir('cliente')} style={{ animationDelay: '.05s' }}>
            <span className="ic"><Ico d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3" /></span>
            <span className="tx"><b>Je cherche un coiffeur</b><small>Trouve un salon et réserve en 30 secondes.</small></span>
            <Arrow />
          </button>
          <button className="ob-card oc-pro" onClick={() => choisir('pro')} style={{ animationDelay: '.14s' }}>
            <span className="ic"><Ico d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" /></span>
            <span className="tx"><b>Je gère un salon</b><small>Reçois tes réservations, gère ton agenda.</small></span>
            <Arrow />
          </button>
          <p className="ob-note">Tu reviens ici à chaque ouverture pour choisir ton espace.</p>
        </div>
      </div>
    );
  }

  if (phase === 'terms') {
    return (
      <div className="ob">
        <div className="ob-terms">
          <Logo />
          <h1>Avant de commencer</h1>
          <p>Une dernière étape, puis tu accèdes à ton espace.</p>
          <label className="ob-check">
            <input type="checkbox" checked={accepte} onChange={(e) => setAccepte(e.target.checked)} />
            <span className="box" aria-hidden>{accepte && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}</span>
            <span className="lbl">J’ai lu et j’accepte les <Link href="/confidentialite" className="ob-a">règles d’utilisation</Link> et la <Link href="/confidentialite#confidentialite" className="ob-a">politique de confidentialité</Link> de TEMPO.</span>
          </label>
          <div className="ob-terms-cta">
            <button className="ob-btn" disabled={!accepte} onClick={accepter}>Accepter et continuer <Arrow /></button>
            <button className="ob-link" onClick={() => setPhase('fork')}>Retour</button>
          </div>
        </div>
      </div>
    );
  }

  // intro (carousel)
  const dernier = slide === SLIDES.length - 1;
  return (
    <div className="ob">
      <div className="ob-intro">
        <div className="ob-skip"><button className="ob-link" onClick={allerFork}>Passer</button></div>
        <div className="ob-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="ob-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
            {SLIDES.map((s, i) => (
              <div className="ob-slide" key={i} aria-hidden={i !== slide}>
                <div className={'ob-illus ic-' + s.ic}><SlideIcon name={s.ic} /></div>
                <h2>{s.titre.split('\n').map((l, k) => <span key={k}>{l}<br /></span>)}</h2>
                <p>{s.txt}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="ob-dots">
          {SLIDES.map((_, i) => <button key={i} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={`Slide ${i + 1}`} />)}
        </div>
        <div className="ob-nav">
          <button className="ob-btn" onClick={() => (dernier ? allerFork() : setSlide(slide + 1))}>
            {dernier ? 'Commencer' : 'Continuer'} <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Visuels ---- */
function Logo({ draw }: { draw?: boolean }) {
  return (
    <svg className={'ob-logo' + (draw ? ' draw' : '')} width="76" height="76" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#1a2340" stroke="rgba(224,164,88,.3)" />
      <g fill="none" stroke="#e0a458" strokeWidth="2.4" strokeLinecap="round">
        <circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" />
        <path d="M16 16V9" /><path d="M16 16h6" />
      </g>
    </svg>
  );
}
const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Ico = ({ d }: { d: string }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d.split('M').filter(Boolean).map((s, i) => <path key={i} d={'M' + s} />)}</svg>;
function SlideIcon({ name }: { name: string }) {
  const d = name === 'pin' ? 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
    : name === 'bolt' ? 'M13 2L4 14h7l-1 8 9-12h-7l1-8z'
    : 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6';
  return <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d.split('M').filter(Boolean).map((s, i) => <path key={i} d={'M' + s} />)}</svg>;
}
