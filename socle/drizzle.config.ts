import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./db/schema.ts', './db/auth-schema.ts'],
  out: './db/drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
  // Ne touche pas aux tables générées par Better Auth ni aux objets PostGIS.
  verbose: true,
  strict: true,
});
