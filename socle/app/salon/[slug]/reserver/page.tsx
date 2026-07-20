// F3 (web) — Réservation invité : choix du créneau + saisie nom/téléphone.
// Wrapper serveur : charge le salon, délègue l'interactivité au composant client.
import { notFound } from 'next/navigation';
import { getSalonBySlug } from '@/lib/salons';
import Reserver from './reserver-client';

export const dynamic = 'force-dynamic';

export default async function ReserverPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { slug } = await params;
  const { service } = await searchParams;
  const salon = await getSalonBySlug(slug);
  if (!salon) notFound();

  return (
    <Reserver
      salon={{ id: salon.id, slug: salon.slug, nom: salon.nom }}
      prestations={salon.prestations}
      serviceInitial={service ?? salon.prestations[0]?.id ?? null}
    />
  );
}
