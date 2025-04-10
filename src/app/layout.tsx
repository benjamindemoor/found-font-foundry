import type { Metadata } from 'next';
import './globals.css';
import { alteHaasGrotesk } from './fonts';

export const metadata: Metadata = {
  title: 'Found Fonts Foundry',
  description: 'A collection of found fonts in the wild',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={alteHaasGrotesk.variable}>
      <body className={`antialiased ${alteHaasGrotesk.className}`}>{children}</body>
    </html>
  );
} 