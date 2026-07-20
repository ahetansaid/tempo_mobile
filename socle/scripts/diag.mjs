import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  const ext = await sql`SELECT extname, extnamespace::regnamespace AS schema, extversion FROM pg_extension WHERE extname IN ('postgis','btree_gist')`;
  console.log('extensions:', ext);
  const sp = await sql`SHOW search_path`;
  console.log('search_path:', sp[0].search_path);
  const t1 = await sql`SELECT to_regtype('geography') AS t`;
  console.log("to_regtype('geography'):", t1[0].t);
  const t2 = await sql`SELECT to_regtype('public.geography') AS t`;
  console.log("to_regtype('public.geography'):", t2[0].t);
} catch (e) {
  console.error('err:', e.message);
} finally { await sql.end(); }
