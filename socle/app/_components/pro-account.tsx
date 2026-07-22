'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Sur l'entrée pro : lien de retour au choix d'espace + déconnexion (revient au choix).
export default function ProAccount() {
  const router = useRouter();
  const [nom, setNom] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/auth/get-session').then((r) => r.json()).then((s) => {
      if (s?.user) setNom(s.user.name ?? s.user.email ?? 'ton compte');
    }).catch(() => {});
  }, []);

  async function deconnexion() {
    setBusy(true);
    try { await fetch('/api/auth/sign-out', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }); } catch {}
    try { localStorage.removeItem('tempo_role'); } catch {}
    router.push('/app');
  }

  return (
    <div className="pa">
      {nom && (
        <div className="pa-session">
          <span>Connecté — <b>{nom}</b></span>
          <button className="pa-out" onClick={deconnexion} disabled={busy}>{busy ? '…' : 'Se déconnecter'}</button>
        </div>
      )}
      <a href="/app" className="pa-switch">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4" /></svg>
        Changer d’espace
      </a>
    </div>
  );
}
