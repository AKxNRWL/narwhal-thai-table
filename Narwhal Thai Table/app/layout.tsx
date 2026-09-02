import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Space_Grotesk, Fraunces, Inter } from 'next/font/google';
import './globals.css';
import ComingSoonTicker from '@/components/ComingSoonTicker';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import PromoCard from '@/components/PromoCard';
import MobileActionBar from '@/components/MobileActionBar';
import AdsConversions from '@/components/AdsConversions';
import NotoTickerFonts from '@/components/NotoTickerFonts';
import { RESTAURANT, SITE_URL, sameAsUrls, GBP_MAP_URL, RESTAURANT_ID, ORDER_ONLINE_URL } from '@/lib/site';

/* Self-hosted webfonts (next/font).
   These used to load from fonts.googleapis.com via a <link> in <head>, which
   is a render-blocking request to a third-party origin on EVERY page. next/font
   downloads the files at build time and serves them from our own domain with a
   1-year immutable cache, injects @font-face directly, and sets size-adjust
   fallback metrics so the swap doesn't shift layout.
   Each exposes a CSS variable that globals.css maps onto --font-display /
   --font-serif / --font-sans. */
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--f-display' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['SOFT', 'WONK', 'opsz'], display: 'swap', variable: '--f-serif' });
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--f-sans' });
const fontVars = `${spaceGrotesk.variable} ${fraunces.variable} ${inter.variable}`;

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
    <html lang="en" className={fontVars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Noto Sans family — used by the Coming Soon ticker so every
            language (Thai/Vietnamese/Chinese/Korean/Japanese/Latin) shares
            the SAME design weight + x-height. Without this the browser
            falls back to whatever system font handles each script and the
            line ends up visually uneven across phrases. */}
        {/* Loaded async by <NotoTickerFonts/> (body) so this CSS never blocks
            first paint; the <noscript> keeps a no-JS fallback. Keep both URLs
            in sync with components/NotoTickerFonts.tsx. */}
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&family=Noto+Sans+Thai:wght@400;500&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+TC:wght@400;500&family=Noto+Sans+KR:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap" rel="stylesheet" />
        </noscript>
        {/* SEO: Restaurant structured data (Google rich results) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Restaurant',
              // Stable id — makes this ONE entity across all 74 pages instead of
              // 74 separate unlinked Restaurant nodes.
              '@id': RESTAURANT_ID,
              name: 'Narwhal Thai Table',
              url: SITE_URL,
              image: [
                `${SITE_URL}/images/og-cover.jpg`,
                `${SITE_URL}/images/room/storefront.jpg`,
                `${SITE_URL}/images/dishes/crab-fried-rice.jpg`,
                `${SITE_URL}/images/dishes/og-pad-thai.jpg`,
                `${SITE_URL}/images/dishes/panang-curry.jpg`,
              ],
              logo: `${SITE_URL}/images/logo-full-thai.png`,
              // Entity clarity for search engines + AI assistants: who we are, and how we
              // relate to the previous tenant at this address (owner-confirmed acquisition
              // + rename, July 2026). Plain facts only — no ratings/reviews (self-serving
              // review markup is against Google policy).
              description:
                'Family-run Thai restaurant on Beach Blvd in Huntington Beach. Three siblings cook Thai the way they grew up eating it: curry pastes pounded by hand, wok noodles and fried rice made to order, fresh seafood and vegetarian options, weekday lunch specials, and a dog-friendly patio.',
              disambiguatingDescription:
                'Formerly Thai Gulf Restaurant — same address (19072 Beach Blvd Ste A & B, Huntington Beach), new owners and new name since July 2026.',
              alternateName: ['Narwhal Thai', 'Narwhal Thai Table HB'],
              foundingDate: '2026-07',
              parentOrganization: { '@type': 'Organization', name: 'Narwhal Hospitality LLC' },
              knowsLanguage: ['en', 'th'],
              amenityFeature: [
                { '@type': 'LocationFeatureSpecification', name: 'Outdoor patio seating', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Dog-friendly patio', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Takeout', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Delivery', value: true },
                { '@type': 'LocationFeatureSpecification', name: 'Wheelchair accessible', value: true },
              ],
              servesCuisine: ['Thai', 'Royal Thai'],
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                streetAddress: RESTAURANT.address.street,
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
              // Full menu + the weekday Lunch Specials menu (app/lunch/page.tsx declares
              // the Menu node with this @id; the two documents merge on the id).
              hasMenu: [
                `${SITE_URL}/menu`,
                { '@type': 'Menu', '@id': `${SITE_URL}/lunch#menu`, name: 'Lunch Specials (Mon–Fri 11:30 AM–3 PM)', url: `${SITE_URL}/lunch` },
              ],
              // Points at OUR Google listing by CID — never the previous tenant's.
              hasMap: GBP_MAP_URL,
              areaServed: ['Huntington Beach', 'Fountain Valley', 'Westminster', 'Costa Mesa', 'Orange County'],
              paymentAccepted: 'Cash, Credit Card, Debit Card, Apple Pay, Google Pay',
              currenciesAccepted: 'USD',
              acceptsReservations: true,
              potentialAction: [
                {
                  '@type': 'ReserveAction',
                  target: `${SITE_URL}/contact/reservation`,
                  result: { '@type': 'FoodEstablishmentReservation', name: 'Table reservation' },
                },
                ...(ORDER_ONLINE_URL
                  ? [{
                      '@type': 'OrderAction',
                      target: {
                        '@type': 'EntryPoint',
                        urlTemplate: ORDER_ONLINE_URL,
                        inLanguage: 'en-US',
                        actionPlatform: [
                          'https://schema.org/DesktopWebPlatform',
                          'https://schema.org/IOSPlatform',
                          'https://schema.org/AndroidPlatform',
                        ],
                      },
                      deliveryMethod: [
                        'https://schema.org/OnSitePickup',
                        'https://schema.org/ParcelService',
                      ],
                    }]
                  : []),
              ],
              // Filled from lib/site.ts the moment real values exist there.
              ...(RESTAURANT.phone ? { telephone: RESTAURANT.phone } : {}),
              ...(sameAsUrls().length ? { sameAs: sameAsUrls() } : {}),
            }),
          }}
        />
      </head>
      <body>
        <ComingSoonTicker />
        <NotoTickerFonts />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <MobileActionBar />
        <ChatWidget />
        {/* Owner-managed promo pop-up (content from /api/promo; edited in /stats). */}
        <PromoCard />
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
