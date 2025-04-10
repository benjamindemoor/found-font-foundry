import type { Metadata } from 'next';
import './globals.css';
import { alteHaasGrotesk } from './fonts';
import SchemaMarkup from './components/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Found Fonts Foundry',
  description: 'A growing collection of typography discovered on the street, in the wild and everywhere in between.',
  keywords: 'fonts, typography, found fonts, street typography, font collection, design, typography collection',
  authors: [{ name: 'Benjamin Ikoma', url: 'http://benjaminikoma.be/' }],
  creator: 'Benjamin Ikoma',
  publisher: 'Found Fonts Foundry',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://foundfontfoundry.org/',
    title: 'Found Fonts Foundry',
    description: 'A growing collection of typography discovered on the street, in the wild and everywhere in between.',
    siteName: 'Found Fonts Foundry',
    images: [{
      url: 'https://foundfontfoundry.org/og-image.svg',
      width: 1200,
      height: 630,
      alt: 'Found Fonts Foundry - Typography discovered in the wild',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Found Fonts Foundry',
    description: 'A growing collection of typography discovered on the street, in the wild and everywhere in between.',
    images: ['https://foundfontfoundry.org/og-image.svg'],
    creator: '@benjaminikoma',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://foundfontfoundry.org/',
  },
  metadataBase: new URL('https://foundfontfoundry.org'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={alteHaasGrotesk.variable}>
      <body className={`antialiased ${alteHaasGrotesk.className}`}>
        {children}
        <SchemaMarkup />
      </body>
    </html>
  );
} 