import type { Metadata, Viewport } from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';
import PwaRegister from './_components/pwa-register';

const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-sora', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  applicationName: 'TEMPO',
  title: 'TEMPO — Réserve ton coiffeur ou barbier à Cotonou',
  description:
    'Trouve un coiffeur ou un barbier près de toi à Cotonou et réserve en quelques secondes. Toute l’expérience TEMPO dans une app.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon-32.png', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'TEMPO', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  themeColor: '#141B34',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${inter.variable}`}>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
