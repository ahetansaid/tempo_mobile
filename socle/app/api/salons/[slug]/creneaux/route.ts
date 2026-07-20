// GET /api/salons/[slug]/creneaux?date=YYYY-MM-DD&service=<id>
// Renvoie les créneaux du jour (libre/pris) pour une prestation donnée.
import { NextRequest, NextResponse } from 'next/server';
import { getSalonBySlug } from '@/lib/salons';
import { creneauxDuJour } from '@/lib/creneaux';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const dateISO = searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  const serviceId = searchParams.get('service');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return NextResponse.json({ error: 'date invalide (YYYY-MM-DD)' }, { status: 400 });
  }

  const salon = await getSalonBySlug(slug);
  if (!salon) return NextResponse.json({ error: 'salon introuvable' }, { status: 404 });

  const service = serviceId ? salon.prestations.find((p) => p.id === serviceId) : salon.prestations[0];
  const dureeMin = service?.dureeMin ?? 30;

  const creneaux = await creneauxDuJour({ proId: salon.id, dateISO, horaires: salon.horaires, dureeMin });

  return NextResponse.json({
    date: dateISO,
    service: service ? { id: service.id, libelle: service.libelle, dureeMin: service.dureeMin, prixFcfa: service.prixFcfa } : null,
    creneaux,
  });
}
