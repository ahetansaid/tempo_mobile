// GET /api/salons?lat=&lng=&rayon=  — recherche géolocalisée (F1).
// Sert le web (page /recherche) et, plus tard, l'app Flutter.
import { NextRequest, NextResponse } from 'next/server';
import { rechercherSalons } from '@/lib/salons';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const num = (k: string) => {
    const v = searchParams.get(k);
    return v === null || v === '' ? undefined : Number(v);
  };

  const lat = num('lat');
  const lng = num('lng');
  const rayonM = num('rayon');
  if ([lat, lng, rayonM].some((v) => v !== undefined && Number.isNaN(v))) {
    return NextResponse.json({ error: 'paramètres lat/lng/rayon invalides' }, { status: 400 });
  }

  const salons = await rechercherSalons({ lat, lng, rayonM });
  return NextResponse.json({ salons, count: salons.length });
}
