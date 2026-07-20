/** @type {import('next').NextConfig} */
const nextConfig = {
  // firebase-admin et postgres.js sont natifs Node : on les garde hors du bundle serveur.
  serverExternalPackages: ['postgres', 'firebase-admin'],
};

export default nextConfig;
