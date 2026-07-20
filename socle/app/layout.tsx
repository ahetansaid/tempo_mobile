import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TEMPO — Socle',
  description: 'API + web TEMPO : réservation et gestion de clientèle pour coiffeurs et barbiers du Bénin.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
