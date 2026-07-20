// Client Drizzle unique, partagé par l'API et le cron.
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as metier from './schema';
import * as authSchema from './auth-schema';

const schema = { ...metier, ...authSchema };

const client = postgres(process.env.DATABASE_URL!, { max: 10 });
export const db = drizzle(client, { schema });
export { schema };
