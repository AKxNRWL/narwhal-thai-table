import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import ComingSoonTicker from '@/components/ComingSoonTicker';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import AdsConversions from '@/components/AdsConversions';
import { RESTAURANT, SITE_URL, socialUrls } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Narwhal Thai Table · Thai Restaurant in Huntington Beach, CA',
    template: '%s · Narwhal Thai Table',
  },
  description: "Family-run Thai restaurant in Huntington Beach — three siblings, thirty years of restaurant life, one table on Beach Boulevard. Royal-court Thai recipes cooked fresh for every plate. Open every day: Mon–Fri 11:30 AM–10 PM · Sat–Sun 12–10 PM.",
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Narwhal Thai Table',
    locale: 'en_US',
    title: 'Narwhal Thai Table · Huntington Beach',
    description: 'Three siblings, thirty years of restaurant life, one table on Beach Boulevard — royal-court Thai, cooked fresh for every plate.',
    url: SITE_URL,
    images: [{ url: '/images/og-cover.jpg', width: 1200, height: 630, alt: 'Narwhal Thai Table — a Thai family feast in Huntington Beach' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Narwhal Thai Table · Huntington Beach',
    description: 'Three siblings, thirty years of restaurant life, one table on Beach Boulevard — royal-court Thai, cooked fresh for every plate.',
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
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 33.685691,
                longitude: -117.988278,
              },
              // Official hours as of Aug 1, 2026 (matches GBP/Yelp/Apple Maps):
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  opens: '11:30',
                  closes: '22:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Saturday', 'Sunday'],
                  opens: '12:00',
                  closes: '22:00',
                },
              ],
              // Chef credit returns at the grand-opening reveal (see SHOW_CHEF in lib/site.ts):
              // founder: { '@type': 'Person', name: 'Chef Rainny' },
              hasMenu: `${SITE_URL}/menu`,
              acceptsReservations: true,
              potentialAction: {
                '@type': 'ReserveAction',
                target: `${SITE_URL}/contact/reservation`,
                result: { '@type': 'FoodEstablishmentReservation', name: 'Table reservation' },
              },
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
        <AdsConversions />
        {/* Google Analytics 4 — property "narwhalthaihb.com", stream "Narwhal Thai Table Website" (welcome@ account)
            + Google Ads conversion tag AW-18329609126 — one shared gtag loader, two configs. */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XJF37GZ4NB" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XJF37GZ4NB');
          gtag('config', 'AW-18329609126');
        `}</Script>
      </body>
    </html>
  );
}
