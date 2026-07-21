import type { Metadata, Viewport } from 'next';
import './globals.css';
import ComingSoonTicker from '@/components/ComingSoonTicker';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { RESTAURANT, SITE_URL, socialUrls } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Narwhal Thai Table · A Thai Family Table in Huntington Beach',
    template: '%s · Narwhal Thai Table',
  },
  description: "A Thai family table on Beach Boulevard, Huntington Beach. Every dish hand-prepared by Chef Rainny, of MasterChef Thailand Season 1.",
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Narwhal Thai Table',
    locale: 'en_US',
    title: 'Narwhal Thai Table · Huntington Beach',
    description: 'A Thai family table on Beach Boulevard. Every dish by Chef Rainny, of MasterChef Thailand Season 1.',
    url: SITE_URL,
    images: [{ url: '/images/og-cover.jpg', width: 1200, height: 630, alt: 'Narwhal Thai Table — a Thai family feast in Huntington Beach' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narwhal Thai Table · Huntington Beach',
    description: 'A Thai family table on Beach Boulevard. Every dish by Chef Rainny, of MasterChef Thailand Season 1.',
    images: ['/images/og-cover.jpg'],
  },
  icons: {
    icon: [{ url: '/images/favicon.png', type: 'image/png' }],
    apple: [{ url: '/images/favicon.png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B1F33',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Noto Sans family — used by the Coming Soon ticker so every
            language (Thai/Vietnamese/Chinese/Korean/Japanese/Latin) shares
            the SAME design weight + x-height. Without this the browser
            falls back to whatever system font handles each script and the
            line ends up visually uneven across phrases. */}
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&family=Noto+Sans+Thai:wght@400;500&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+TC:wght@400;500&family=Noto+Sans+KR:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet" />
        {/* SEO: Restaurant structured data (Google rich results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              name: 'Narwhal Thai Table',
              url: SITE_URL,
              image: `${SITE_URL}/images/og-cover.jpg`,
              logo: `${SITE_URL}/images/logo-full-thai.png`,
              servesCuisine: ['Thai', 'Royal Thai'],
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '19072 Beach Blvd',
                addressLocality: 'Huntington Beach',
                addressRegion: 'CA',
                postalCode: '92648',
                addressCountry: 'US',
              },
              openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
                opens: '11:00',
                closes: '23:00',
              }],
              founder: { '@type': 'Person', name: 'Chef Rainny' },
              menu: `${SITE_URL}/menu`,
              acceptsReservations: `${SITE_URL}/contact/reservation`,
              // Filled from lib/site.ts the moment real values exist there.
              ...(RESTAURANT.phone ? { telephone: RESTAURANT.phone } : {}),
              ...(socialUrls().length ? { sameAs: socialUrls() } : {}),
            }),
          }}
        />
      </head>
      <body>
        <ComingSoonTicker />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
