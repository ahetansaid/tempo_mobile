// Landing page TEMPO — hero premium, photos africaines (Pexels), animations, salons réels.
import type { CSSProperties, SVGProps } from 'react';
import Link from 'next/link';
import { rechercherSalons } from '@/lib/salons';
import ScrollReveal from './_components/scroll-reveal';

export const dynamic = 'force-dynamic';

const px = (id: number, w = 800) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const HERO_IMG = px(7697433, 1000);
const CARD_IMGS = [5282408, 7697661, 2262802, 7697433];

const fmtPrix = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
const fmtDist = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`);
const fmtScore = (s: number) => s.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const initiales = (n: string) => n.replace(/[^A-Za-zÀ-ÿ ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const d = (ms: number) => ({ ['--d' as string]: `${ms}ms` } as CSSProperties);

export default async function Landing() {
  const salons = await rechercherSalons({ rayonM: 12000, limite: 4 });
  const vedette = salons[0] ?? null;

  return (
    <div className="lp">
      <ScrollReveal />

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-in">
          <Link href="/" className="lp-brand"><Mark /><span className="wm">TEMPO</span></Link>
          <span className="sp" />
          <a href="#comment" className="lp-nav-link" style={{ marginRight: 18 }}>Comment ça marche</a>
          <Link href="/recherche" className="lp-cta-sm">Trouver un salon</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-hero">
        <div className="lp-hero-in">
          <div>
            <span className="lp-eyebrow reveal"><Dot /> Cotonou · Abomey-Calavi</span>
            <h1 className="lp-h1 reveal" style={d(80)}>Le bon créneau,<br /><span className="accent">au bon moment.</span></h1>
            <p className="lp-lead reveal" style={d(160)}>Trouve un coiffeur ou un barbier près de toi et réserve en 30 secondes — sans créer de compte.</p>
            <div className="lp-cta-row reveal" style={d(240)}>
              <Link href="/recherche" className="lp-btn">Trouver un salon <Arrow /></Link>
              <a href="#comment" className="lp-btn-ghost">Comment ça marche</a>
            </div>
            <div className="lp-trust reveal" style={d(320)}>
              <span><Check /> Réservation immédiate</span>
              <span><Check /> Sans application</span>
              <span><Check /> Créneau garanti</span>
            </div>
          </div>

          <div className="lp-visual reveal" style={d(220)}>
            <div className="lp-hero-photo">
              <img src={HERO_IMG} alt="Barbier au travail dans un salon" />
            </div>
            {vedette && (
              <>
                <div className="lp-float">
                  <div className="k">Fiabilité</div>
                  <div className="v">{vedette.scoreFiabilite !== null ? fmtScore(vedette.scoreFiabilite) : '9,0'}</div>
                </div>
                <div className="lp-preview">
                  <div className="head">
                    <div className="th" style={{ background: '#141b34' }}>{initiales(vedette.nom)}</div>
                    <div>
                      <div className="nm">{vedette.nom}</div>
                      <div className="badge"><Shield /> {vedette.quartier}{vedette.ville ? `, ${vedette.ville}` : ''}</div>
                    </div>
                  </div>
                  <div className="row"><span>à {fmtDist(vedette.distanceM)} de toi</span><span className="p">{vedette.prixMin !== null ? `dès ${fmtPrix(vedette.prixMin)}` : ''}</span></div>
                  <div className="go">Réserver <Arrow /></div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* COMMENT ÇA MARCHE */}
      <section className="lp-sec" id="comment">
        <span className="lp-kicker reveal">En 3 étapes</span>
        <h2 className="lp-h2 reveal" style={d(60)}>Réserver n’a jamais été aussi simple</h2>
        <div className="lp-steps">
          {[
            ['1', 'Trouve un salon', 'Géolocalisation : les salons les plus proches, avec distance, prix et score de fiabilité.'],
            ['2', 'Choisis ton créneau', 'Les disponibilités en temps réel. Tu vois d’un coup d’œil ce qui est libre.'],
            ['3', 'C’est réservé', 'Ton nom, ton numéro, et c’est fait. Pas de compte, pas d’attente.'],
          ].map(([n, t, txt], i) => (
            <div key={n} className="lp-step reveal" style={d(i * 110)}>
              <div className="num">{n}</div>
              <h3>{t}</h3>
              <p>{txt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POURQUOI TEMPO */}
      <section className="lp-band">
        <div className="lp-sec">
          <span className="lp-kicker reveal">Pourquoi TEMPO</span>
          <h2 className="lp-h2 reveal" style={d(60)}>Pensé pour toi, jusqu’au moindre détail</h2>
          <div className="lp-feats">
            {[
              [<PinIco key="a" />, 'Près de toi, maintenant', 'La recherche géolocalisée te montre qui est disponible autour de toi.'],
              [<BoltIco key="b" />, 'Réservation en 30 secondes', 'Nom + numéro, c’est tout. Aucun compte, aucune application à installer.'],
              [<LockIco key="c" />, 'Créneau garanti', 'Deux personnes ne peuvent pas réserver le même créneau. Ta place est à toi.'],
              [<ShieldIco key="d" />, 'Score de fiabilité', 'Un score basé sur des faits — ponctualité, présence — pas des avis anonymes.'],
              [<WalletIco key="e" />, 'Prix affichés clairement', 'Les tarifs en FCFA sont visibles avant de réserver. Aucune surprise.'],
              [<HeartIco key="f" />, 'Gratuit pour toi', 'La réservation ne te coûte rien. Tu paies ta prestation au salon.'],
            ].map(([ico, t, txt], i) => (
              <div key={t as string} className="lp-feat reveal" style={d((i % 3) * 90)}>
                <div className="ico">{ico}</div>
                <div><h3>{t as string}</h3><p>{txt as string}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SALONS EN VEDETTE */}
      {salons.length > 0 && (
        <section className="lp-sec">
          <span className="lp-kicker reveal">Autour de toi</span>
          <h2 className="lp-h2 reveal" style={d(60)}>Des salons près de chez toi</h2>
          <div className="lp-cards">
            {salons.map((s, i) => (
              <Link key={s.id} href={`/salon/${s.slug}`} className="lp-card reveal" style={d((i % 4) * 80)}>
                <div className="ph"><img src={px(CARD_IMGS[i % CARD_IMGS.length], 200)} alt="" loading="lazy" /></div>
                <div>
                  <div className="nm">{s.nom}</div>
                  <div className="me">{s.quartier} · {fmtDist(s.distanceM)}{s.scoreFiabilite !== null ? ` · ${fmtScore(s.scoreFiabilite)}★` : ''}</div>
                  {s.prixMin !== null && <div className="pr">dès {fmtPrix(s.prixMin)}</div>}
                </div>
              </Link>
            ))}
          </div>
          <Link href="/recherche" className="lp-seeall">Voir tous les salons <Arrow /></Link>
        </section>
      )}

      {/* BANDE PRO */}
      <section className="lp-pro">
        <div className="lp-pro-in">
          <div className="txt reveal">
            <h2>Tu es coiffeur ou barbier ?</h2>
            <p>Reçois tes réservations, gère ton agenda et remplis tes heures creuses. Ton salon, à l’heure.</p>
          </div>
          <a href="#comment" className="lp-btn-ghost reveal" style={d(120)}>Bientôt disponible</a>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="lp-final">
        <h2 className="reveal">Ton prochain rendez-vous t’attend</h2>
        <p className="reveal" style={d(80)}>Trouve un salon ouvert près de toi et réserve en quelques secondes.</p>
        <div className="reveal" style={d(160)}><Link href="/recherche" className="lp-btn">Trouver un salon <Arrow /></Link></div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-in">
          <Mark /><span className="wm">TEMPO</span>
          <span className="sp" />
          <span>Coiffeurs &amp; barbiers · Cotonou, Bénin</span>
        </div>
      </footer>
    </div>
  );
}

/* ---- Icônes ---- */
function Mark() {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#141b34" stroke="rgba(224,164,88,.35)" />
      <g fill="none" stroke="#e0a458" strokeWidth="2.3" strokeLinecap="round">
        <circle cx="16" cy="16" r="9" strokeDasharray="45 12" strokeDashoffset="-5" />
        <path d="M16 16V9" /><path d="M16 16h6" />
      </g>
    </svg>
  );
}
const S = (p: SVGProps<SVGSVGElement>) => ({ width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...p });
const Arrow = () => <svg {...S({ width: 18, height: 18 })}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Check = () => <svg {...S({ width: 16, height: 16 })}><path d="M20 6L9 17l-5-5" /></svg>;
const Dot = () => <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden><circle cx="4" cy="4" r="4" fill="#e0a458" /></svg>;
const Shield = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" /></svg>;
const PinIco = () => <svg {...S({ width: 24, height: 24 })}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const BoltIco = () => <svg {...S({ width: 24, height: 24 })}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>;
const LockIco = () => <svg {...S({ width: 24, height: 24 })}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
const ShieldIco = () => <svg {...S({ width: 24, height: 24 })}><path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
const WalletIco = () => <svg {...S({ width: 24, height: 24 })}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14h2" /></svg>;
const HeartIco = () => <svg {...S({ width: 24, height: 24 })}><path d="M20.8 6.6a5 5 0 0 0-7.1 0L12 8.3l-1.7-1.7a5 5 0 1 0-7.1 7.1L12 21l8.8-7.3a5 5 0 0 0 0-7.1z" /></svg>;
