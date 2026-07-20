// =====================================================================
// Stockage — Cloudflare R2 (S3-compatible). Remplace Supabase Storage.
// Le client uploade directement vers R2 via une URL présignée -> le serveur
// ne transite pas les octets des photos. Pas de frais d'egress chez R2.
// =====================================================================
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,               // https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET!;

/** URL d'upload présignée (valide 5 min) que le client utilise en PUT direct. */
export async function urlUploadPhoto(cle: string, contentType: string) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: cle, ContentType: contentType });
  const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 300 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${cle}`;  // domaine public R2/CDN
  return { uploadUrl, publicUrl };
}

export async function supprimerPhoto(cle: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: cle }));
}
