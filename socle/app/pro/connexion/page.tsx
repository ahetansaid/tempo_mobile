'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConnexionPro() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function connecter() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/auth/sign-in/email', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: mdp }),
      });
      if (r.ok) { router.push('/pro/onboarding'); return; }
      setErr('Email ou mot de passe incorrect.');
    } catch { setErr('Connexion impossible. Réessaie.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="pro">
      <div className="pro-entry">
        <div className="top">
          <Link href="/pro" className="pro-brand">
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="9" fill="#1a2340" stroke="rgba(224,164,88,.35)" />
              <g fill="none" stroke="#e0a458" strokeWidth="2.3" strokeLinecap="round"><circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" /><path d="M16 16V9" /><path d="M16 16h6" /></g>
            </svg>
            <span className="wm">TEMPO</span>
          </Link>
        </div>

        <span className="pro-eyebrow">Espace professionnel</span>
        <h1 style={{ fontSize: 34 }}>Bon retour.</h1>
        <p className="lead">Connecte-toi pour retrouver ton salon.</p>

        <div className="pro-field">
          <label className="pro-label" htmlFor="email">Email</label>
          <input id="email" className="pro-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.bj" autoComplete="email" />
        </div>
        <div className="pro-field">
          <label className="pro-label" htmlFor="mdp">Mot de passe</label>
          <div style={{ position: 'relative' }}>
            <input id="mdp" className="pro-input" type={show ? 'text' : 'password'} value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="••••••••" autoComplete="current-password" style={{ paddingRight: 64 }} />
            <button onClick={() => setShow(!show)} className="pro-link" style={{ position: 'absolute', right: 12, top: 15 }}>{show ? 'Cacher' : 'Voir'}</button>
          </div>
        </div>

        {err && <div className="pro-err">{err}</div>}

        <div className="actions">
          <button className="pro-btn" disabled={busy || !email || mdp.length < 8} onClick={connecter}>{busy ? 'Connexion…' : 'Se connecter'}</button>
          <Link href="/pro/onboarding" className="pro-ghost">Créer un salon</Link>
        </div>
      </div>
    </div>
  );
}
