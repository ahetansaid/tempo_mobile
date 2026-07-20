'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type Presta = { id: string; libelle: string; dureeMin: number; prixFcfa: number };
type Creneau = { heure: string; debut: string; fin: string; etat: 'libre' | 'pris' };
type Service = { id: string; libelle: string; dureeMin: number; prixFcfa: number } | null;

const fmtPrix = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const fmtDuree = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60}` : ''}` : `${m} min`);
const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function joursAvenir(n: number) {
  const out: { iso: string; dl: string; dn: string }[] = [];
  const base = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    out.push({
      iso: isoLocal(d),
      dl: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      dn: String(d.getDate()),
    });
  }
  return out;
}
const dateLongue = (iso: string) =>
  new Date(`${iso}T12:00:00+01:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

export default function Reserver({
  salon, prestations, serviceInitial,
}: {
  salon: { id: string; slug: string; nom: string };
  prestations: Presta[];
  serviceInitial: string | null;
}) {
  const jours = joursAvenir(14);
  const [serviceId] = useState<string | null>(serviceInitial);
  const [date, setDate] = useState(jours[0].iso);
  const [creneaux, setCreneaux] = useState<Creneau[]>([]);
  const [service, setService] = useState<Service>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Creneau | null>(null);
  const [step, setStep] = useState<'choix' | 'infos' | 'ok'>('choix');
  const [nom, setNom] = useState('');
  const [tel, setTel] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [ref, setRef] = useState<string>('');

  const charger = useCallback(async () => {
    setLoading(true); setSel(null);
    const qs = new URLSearchParams({ date });
    if (serviceId) qs.set('service', serviceId);
    const r = await fetch(`/api/salons/${salon.slug}/creneaux?${qs}`);
    const j = await r.json();
    setService(j.service); setCreneaux(j.creneaux ?? []); setLoading(false);
  }, [date, serviceId, salon.slug]);

  useEffect(() => { charger(); }, [charger]);

  const groupes: [string, Creneau[]][] = [
    ['Matin', creneaux.filter((c) => parseInt(c.heure) < 12)],
    ['Après-midi', creneaux.filter((c) => parseInt(c.heure) >= 12 && parseInt(c.heure) < 17)],
    ['Soir', creneaux.filter((c) => parseInt(c.heure) >= 17)],
  ];

  async function confirmer() {
    if (!sel) return;
    setEnvoi(true); setErr(null);
    try {
      const r = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          proId: salon.id,
          serviceId: serviceId ?? undefined,
          clientNom: nom.trim(),
          clientTel: '+229' + tel.replace(/\D/g, ''),
          debut: new Date(sel.debut).toISOString(),
          fin: new Date(sel.fin).toISOString(),
        }),
      });
      if (r.status === 201) {
        const j = await r.json();
        setRef('TMP-' + String(j.reservation.id).slice(0, 4).toUpperCase());
        setStep('ok');
      } else if (r.status === 409) {
        setErr('Ce créneau vient d’être pris. Choisis-en un autre.');
        setStep('choix'); charger();
      } else {
        const j = await r.json().catch(() => ({}));
        setErr(j.error ?? 'Une erreur est survenue. Réessaie.');
      }
    } catch {
      setErr('Connexion impossible. Réessaie.');
    } finally { setEnvoi(false); }
  }

  // ----- Confirmation -----
  if (step === 'ok') {
    return (
      <div className="rv">
        <div className="rv-ok">
          <div className="check">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h2>C’est réservé !</h2>
          <div className="rv-pill">En attente de confirmation</div>
          <div className="rv-ticket">
            <div className="big">{salon.nom}</div>
            <div className="l" style={{ marginTop: 8 }}><span className="k">Prestation</span><span className="v">{service?.libelle}</span></div>
            <div className="l"><span className="k">Quand</span><span className="v">{dateLongue(date)} à {sel?.heure}</span></div>
            {service && <div className="l"><span className="k">Prix</span><span className="v">{fmtPrix(service.prixFcfa)}</span></div>}
            <div className="ref">Référence {ref}</div>
          </div>
          <p className="rv-note" style={{ textAlign: 'center' }}>Le salon confirme sous peu. Garde cette référence.</p>
          <div style={{ marginTop: 18 }}><Link className="rv-btn" href="/recherche" style={{ maxWidth: 380, margin: '0 auto' }}>Retour aux salons</Link></div>
        </div>
      </div>
    );
  }

  // ----- Saisie invité -----
  if (step === 'infos') {
    return (
      <div className="rv">
        <div className="rv-top">
          <button className="rv-back" onClick={() => setStep('choix')} aria-label="Retour">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="rv-title">Presque terminé</h1>
        </div>

        <div className="rv-card">
          <div className="l"><span className="k">Salon</span><span className="v">{salon.nom}</span></div>
          <div className="l"><span className="k">Prestation</span><span className="v">{service?.libelle}</span></div>
          <div className="l"><span className="k">Quand</span><span className="v">{dateLongue(date)} à {sel?.heure}</span></div>
          {service && <div className="l"><span className="k">Prix</span><span className="v">{fmtPrix(service.prixFcfa)}</span></div>}
        </div>

        <label className="rv-label" htmlFor="nom">Ton nom</label>
        <input id="nom" className="rv-input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. Awa Kpodo" autoComplete="name" />

        <label className="rv-label" htmlFor="tel">Ton numéro</label>
        <div className="rv-tel">
          <span className="pfx">+229</span>
          <input id="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="97 00 00 00" inputMode="tel" autoComplete="tel" />
        </div>

        <p className="rv-note">Pas de compte à créer. Le salon te contacte au besoin.</p>
        {err && <div className="rv-err">{err}</div>}

        <div className="rv-cta"><div className="rv-cta-in">
          <button className="rv-btn" disabled={envoi || nom.trim().length < 2 || tel.replace(/\D/g, '').length < 8} onClick={confirmer}>
            {envoi ? 'Envoi…' : 'Confirmer la réservation'}
          </button>
        </div></div>
      </div>
    );
  }

  // ----- Choix du créneau -----
  return (
    <div className="rv">
      <div className="rv-top">
        <Link className="rv-back" href={`/salon/${salon.slug}`} aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <h1 className="rv-title">Choisis un créneau</h1>
      </div>

      {service && (
        <div className="rv-recap">
          <b>{service.libelle}</b><span className="sep">·</span>{fmtDuree(service.dureeMin)}
          <span className="prix">{fmtPrix(service.prixFcfa)}</span>
        </div>
      )}

      <div className="rv-dates">
        {jours.map((j) => (
          <button key={j.iso} className={'rv-date' + (j.iso === date ? ' on' : '')} onClick={() => setDate(j.iso)}>
            <span className="d">{j.dl}</span><span className="n">{j.dn}</span>
          </button>
        ))}
      </div>

      {err && <div className="rv-err">{err}</div>}

      {loading ? (
        <p className="rv-empty">Chargement des créneaux…</p>
      ) : creneaux.length === 0 ? (
        <p className="rv-empty">Fermé ce jour-là. Choisis une autre date.</p>
      ) : (
        groupes.map(([titre, cs]) => cs.length > 0 && (
          <div key={titre} className="rv-group">
            <h4>{titre}</h4>
            <div className="rv-slots">
              {cs.map((c) => (
                <button
                  key={c.debut}
                  className={'rv-slot' + (c.etat === 'pris' ? ' pris' : sel?.debut === c.debut ? ' sel' : '')}
                  disabled={c.etat === 'pris'}
                  onClick={() => setSel(c)}
                >{c.heure}</button>
              ))}
            </div>
          </div>
        ))
      )}

      <p className="rv-note">Fuseau Cotonou (GMT+1)</p>

      <div className="rv-cta"><div className="rv-cta-in">
        <button className="rv-btn" disabled={!sel} onClick={() => setStep('infos')}>
          {sel ? `Continuer · ${sel.heure}` : 'Choisis un créneau'}
        </button>
      </div></div>
    </div>
  );
}
