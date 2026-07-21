// Helpers côté professionnel : slug, récupération du salon du pro connecté.
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { professionnels } from '../db/schema';

const DIACRITIQUES = /[̀-ͯ]/g;

export function slugify(s: string): string {
  return (s.normalize('NFD').replace(DIACRITIQUES, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)) || 'salon';
}

/** slug unique : ajoute un suffixe court si déjà pris. */
export async function slugUnique(base: string): Promise<string> {
  let slug = slugify(base);
  for (let i = 0; i < 6; i++) {
    const [exist] = await db.select({ id: professionnels.id }).from(professionnels).where(eq(professionnels.slug, slug)).limit(1);
    if (!exist) return slug;
    slug = `${slugify(base)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

/** Le salon du pro connecté (ou null). */
export async function salonDuPro(userId: string) {
  const [pro] = await db.select().from(professionnels).where(eq(professionnels.userId, userId)).limit(1);
  return pro ?? null;
}
