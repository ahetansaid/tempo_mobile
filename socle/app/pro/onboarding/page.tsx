'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Presta = { libelle: string; dureeMin: number; prixFcfa: number };
type JourEtat = { open: boolean; a: string; b: string };
const JOURS: [string, string][] = [
  ['lun', 'Lun'], ['mar', 'Mar'], ['mer', 'Mer'], ['jeu', 'Jeu'], ['ven', 'Ven'], ['sam', 'Sam'], ['dim', 'Dim'],
];
const COTONOU = { lat: 6.3703, lng: 2.3912 };
const TOTAL = 5;

export default function Onboarding() {
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Compte
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [compteOk, setCompteOk] = useState(false);
  // Salon
  const [tel, setTel] = useState('');
  const [quartier, setQuartier] = useState('');
  const [ville, setVille] = useState('Cotonou');
  // Position
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  // Prestations
  const [prestas, setPrestas] = useState<Presta[]>([{ libelle: 'Coupe homme', dureeMin: 30, prixFcfa: 3000 }]);
  // Horaires
  const [horaires, setHoraires] = useState<Record<string, JourEtat>>(() =>
    Object.fromEntries(JOURS.map(([k]) => [k, { open: k !== 'dim', a: '09:00', b: '20:00' }])) as Record<string, JourEtat>);
  // Fin
  const [slug, setSlug] = useState<string | null>(null);

  // Si déjà connecté, on saute la création de compte.
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/get-session');
        const s = await r.json().catch(() => null);
        if (s?.user) { setNom(s.user.name ?? ''); setCompteOk(true); setStep(1); }
      } catch {}
      setReady(true);
    })();
  }, []);

  async function creerCompte() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/auth/sign-up/email', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: mdp, name: nom.trim() }),
      });
      if (r.ok) { setCompteOk(true); setStep(1); return; }
      const j = await r.json().catch(() => ({}));
      setErr(j?.message?.includes('exist') || r.status === 422
        ? 'Cet email a déjà un compte. Connecte-toi.'
        : 'Impossible de créer le compte. Vérifie tes infos.');
    } catch { setErr('Connexion impossible. Réessaie.'); }
    finally { setBusy(false); }
  }

  function geolocaliser() {
    setGeoBusy(true); setErr(null);
    if (!navigator.geolocation) { setPos(COTONOU); setGeoBusy(false); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoBusy(false); },
      () => { setPos(COTONOU); setGeoBusy(false); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function publier() {
    setBusy(true); setErr(null);
    try {
      const h = Object.fromEntries(JOURS.map(([k]) => [k, horaires[k].open ? [[horaires[k].a, horaires[k].b]] : []]));
      const r = await fetch('/api/pro/salon', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nom: nom.trim(), telephone: tel || undefined, adresse: quartier || undefined, ville: ville || undefined,
          lat: (pos ?? COTONOU).lat, lng: (pos ?? COTONOU).lng,
          prestations: prestas.filter((p) => p.libelle.trim()), horaires: h,
        }),
      });
      const j = await r.json();
      if (r.ok) { setSlug(j.slug); setStep(TOTAL); return; }
      setErr(j?.error ?? 'La publication a échoué. Réessaie.');
    } catch { setErr('Connexion impossible. Réessaie.'); }
    finally { setBusy(false); }
  }

  if (!ready) return <div className="pro" style={{ display: 'grid', placeItems: 'center' }}><p style={{ color: 'rgba(255,255,255,.5)' }}>Chargement…</p></div>;

  // ----- Écran de fin -----
  if (step === TOTAL && slug) {
    return (
      <div className="pro">
        <div className="pro-done">
          <div className="check"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></div>
          <h1>Ton salon est publié !</h1>
          <p>Les clientes peuvent déjà te trouver et réserver. Ton agenda arrive très bientôt.</p>
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Link href={`/salon/${slug}`} className="pro-btn">Voir ma fiche publique</Link>
            <Link href="/recherche" className="pro-ghost">Voir la recherche cliente</Link>
          </div>
        </div>
      </div>
    );
  }

  const canNext =
    step === 0 ? nom.trim().length >= 2 && /\S+@\S+/.test(email) && mdp.length >= 8 :
    step === 1 ? true :
    step === 2 ? pos !== null :
    step === 3 ? prestas.some((p) => p.libelle.trim() && p.prixFcfa >= 0) :
    true;

  const next = () => {
    if (step === 0 && !compteOk) return creerCompte();
    if (step === 4) return publier();
    setStep((s) => s + 1);
  };

  return (
    <div className="pro">
      <div className="pro-wiz">
        <div className="pro-wiz-top">
          <Link href="/pro" className="pro-brand">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden><rect width="32" height="32" rx="9" fill="#1a2340" stroke="rgba(224,164,88,.35)" /><g fill="none" stroke="#e0a458" strokeWidth="2.3" strokeLinecap="round"><circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" /><path d="M16 16V9" /><path d="M16 16h6" /></g></svg>
            <span className="wm">TEMPO</span>
          </Link>
          <span className="step-x">Étape {step + 1}/{TOTAL}</span>
        </div>
        <div className="pro-progress"><i style={{ width: `${((step + 1) / TOTAL) * 100}%` }} /></div>

        {/* étape rendue avec animation d'entrée (clé = step) */}
        <div className="pro-step" key={step}>
          {step === 0 && (
            <>
              <span className="pro-kicker">Bienvenue</span>
              <h2 className="pro-h">Crée ton salon</h2>
              <p className="pro-sub">Commençons par ton compte. Email et mot de passe — pas de SMS.</p>
              <div className="pro-field"><label className="pro-label">Nom du salon</label>
                <input className="pro-input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. L’Art du Rasoir" /></div>
              <div className="pro-field"><label className="pro-label">Email</label>
                <input className="pro-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.bj" autoComplete="email" /></div>
              <div className="pro-field"><label className="pro-label">Mot de passe</label>
                <input className="pro-input" type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="8 caractères minimum" autoComplete="new-password" /></div>
              <p className="pro-sub" style={{ fontSize: 13 }}>Déjà un compte ? <Link href="/pro/connexion" className="pro-link">Se connecter</Link></p>
            </>
          )}

          {step === 1 && (
            <>
              <span className="pro-kicker">Ton salon</span>
              <h2 className="pro-h">Où te trouve-t-on ?</h2>
              <p className="pro-sub">Ces infos apparaissent sur ta fiche publique.</p>
              <div className="pro-field"><label className="pro-label">Téléphone</label>
                <input className="pro-input" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+229 97 00 00 00" inputMode="tel" /></div>
              <div className="pro-row2">
                <div className="pro-field"><label className="pro-label">Quartier</label>
                  <input className="pro-input" value={quartier} onChange={(e) => setQuartier(e.target.value)} placeholder="Fidjrossè" /></div>
                <div className="pro-field"><label className="pro-label">Ville</label>
                  <input className="pro-input" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Cotonou" /></div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <span className="pro-kicker">Position</span>
              <h2 className="pro-h">Place-toi sur la carte</h2>
              <p className="pro-sub">Les clientes te trouveront par la distance. Autorise ta position.</p>
              <div className={'pro-geo' + (pos ? ' ok' : '')}>
                <div className="ic">
                  {pos
                    ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>}
                </div>
                {pos ? (
                  <>
                    <b>Position enregistrée</b>
                    <div className="coord">{pos.lat.toFixed(4)}, {pos.lng.toFixed(4)}</div>
                    <button className="pro-link" style={{ marginTop: 10 }} onClick={geolocaliser}>Recommencer</button>
                  </>
                ) : (
                  <>
                    <b>On ne sait pas encore où tu es</b>
                    <div className="coord">Ta position reste privée, on n’affiche que la distance.</div>
                    <button className="pro-btn" style={{ marginTop: 14 }} disabled={geoBusy} onClick={geolocaliser}>{geoBusy ? 'Localisation…' : 'Utiliser ma position'}</button>
                    <button className="pro-link" style={{ marginTop: 12 }} onClick={() => setPos(COTONOU)}>Je suis à Cotonou (centre)</button>
                  </>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <span className="pro-kicker">Tes prestations</span>
              <h2 className="pro-h">Que proposes-tu ?</h2>
              <p className="pro-sub">Ajoute tes services, leur durée et leur prix en FCFA.</p>
              <div className="pro-serv">
                {prestas.map((p, i) => (
                  <div className="pro-serv-row" key={i}>
                    <div className="l1">
                      <input className="pro-input" value={p.libelle} placeholder="Nom de la prestation"
                        onChange={(e) => setPrestas((a) => a.map((x, j) => j === i ? { ...x, libelle: e.target.value } : x))} />
                      {prestas.length > 1 && (
                        <button className="pro-del" onClick={() => setPrestas((a) => a.filter((_, j) => j !== i))} aria-label="Supprimer">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="l2">
                      <label className="mini"><span>Durée (min)</span>
                        <input className="pro-input" type="number" min={5} step={5} value={p.dureeMin}
                          onChange={(e) => setPrestas((a) => a.map((x, j) => j === i ? { ...x, dureeMin: +e.target.value } : x))} /></label>
                      <label className="mini"><span>Prix (FCFA)</span>
                        <input className="pro-input" type="number" min={0} step={500} value={p.prixFcfa}
                          onChange={(e) => setPrestas((a) => a.map((x, j) => j === i ? { ...x, prixFcfa: +e.target.value } : x))} /></label>
                    </div>
                  </div>
                ))}
                <button className="pro-add" onClick={() => setPrestas((a) => [...a, { libelle: '', dureeMin: 30, prixFcfa: 3000 }])}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  Ajouter une prestation
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <span className="pro-kicker">Tes horaires</span>
              <h2 className="pro-h">Quand ouvres-tu ?</h2>
              <p className="pro-sub">Active les jours d’ouverture et règle tes heures.</p>
              <div className="pro-days">
                {JOURS.map(([k, label]) => {
                  const j = horaires[k];
                  return (
                    <div className="pro-day" key={k}>
                      <span className="nm">{label}</span>
                      {j.open ? (
                        <div className="times">
                          <input className="pro-input" type="time" value={j.a} onChange={(e) => setHoraires((h) => ({ ...h, [k]: { ...h[k], a: e.target.value } }))} />
                          <span>–</span>
                          <input className="pro-input" type="time" value={j.b} onChange={(e) => setHoraires((h) => ({ ...h, [k]: { ...h[k], b: e.target.value } }))} />
                        </div>
                      ) : <span className="ferme">Fermé</span>}
                      <button className={'pro-toggle' + (j.open ? ' on' : '')} aria-label={label} onClick={() => setHoraires((h) => ({ ...h, [k]: { ...h[k], open: !h[k].open } }))} />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {err && <div className="pro-err">{err}</div>}
        </div>
      </div>

      {/* Barre d'action */}
      <div className="pro-cta"><div className="pro-cta-in">
        {step > (compteOk ? 1 : 0) && (
          <button className="pro-ghost" onClick={() => setStep((s) => s - 1)} aria-label="Retour">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <button className="pro-btn" disabled={busy || !canNext} onClick={next}>
          {busy ? 'Un instant…' : step === 4 ? 'Publier mon salon' : step === 0 && !compteOk ? 'Créer mon compte' : 'Continuer'}
        </button>
      </div></div>
    </div>
  );
}
