// Règles d'utilisation + Politique de confidentialité (version préliminaire).
import Link from 'next/link';

export const metadata = { title: 'TEMPO — Règles & confidentialité' };

export default function Confidentialite() {
  return (
    <main className="lg">
      <div className="lg-top">
        <Link href="/app" className="lg-back" aria-label="Retour">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <span className="lg-wm">TEMPO</span>
      </div>

      <h1>Règles d’utilisation</h1>
      <p className="lg-maj">Version préliminaire — dernière mise à jour : juillet 2026.</p>

      <p>TEMPO met en relation des clientes et clients avec des salons de coiffure et de barbier
        au Bénin. En utilisant TEMPO, tu acceptes les règles ci-dessous.</p>

      <h2>1. Réservations</h2>
      <p>La réservation d’un créneau t’engage à te présenter à l’heure convenue. Préviens le salon
        au moins 2 heures à l’avance en cas d’empêchement. Les absences répétées et non signalées
        peuvent affecter ton score de fiabilité.</p>

      <h2>2. Comptes professionnels</h2>
      <p>Le professionnel est responsable des informations publiées sur sa fiche (prestations,
        tarifs, horaires) et du respect des créneaux confirmés. Un compte par salon.</p>

      <h2>3. Bon usage</h2>
      <p>Tu t’engages à fournir des informations exactes et à ne pas utiliser TEMPO à des fins
        frauduleuses ou abusives. TEMPO peut suspendre un compte en cas de manquement.</p>

      <h2 id="confidentialite">Politique de confidentialité</h2>
      <p>TEMPO respecte ta vie privée. Cette section explique quelles données sont collectées et
        comment elles sont utilisées.</p>

      <h3>Données collectées</h3>
      <ul>
        <li><b>Cliente (réservation invité)</b> : nom et numéro de téléphone, uniquement pour
          permettre au salon de te contacter au sujet de ton rendez-vous. Aucun compte requis.</li>
        <li><b>Professionnel</b> : email, mot de passe (chiffré), et les informations de ton salon.</li>
        <li><b>Position</b> : utilisée seulement pour te proposer les salons proches. Elle n’est
          pas stockée ; seule la distance est affichée.</li>
      </ul>

      <h3>Utilisation</h3>
      <p>Tes données servent uniquement à faire fonctionner le service : réservation, contact,
        rappels. Elles ne sont ni vendues, ni cédées à des tiers à des fins publicitaires.</p>

      <h3>Tes droits</h3>
      <p>Tu peux demander l’accès, la correction ou la suppression de tes données en écrivant à
        <a href="mailto:contact@tempo.bj" className="lg-a"> contact@tempo.bj</a>.</p>

      <p className="lg-note">Ce texte est une version de travail destinée au prototype. Il sera
        remplacé par les conditions définitives avant le lancement.</p>

      <div className="lg-foot"><Link href="/app" className="lg-a">← Retour au choix de l’espace</Link></div>
    </main>
  );
}
