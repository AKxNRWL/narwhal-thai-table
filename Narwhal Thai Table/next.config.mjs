/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // When real photos arrive, drop them in /public/images and they'll be
    // optimized automatically by next/image. Remote images would go in
    // remotePatterns below.
    remotePatterns: [],
  },
  // The welcome-card PDF (lib/guestCardPdf.ts) embeds the site's own TTFs, the
  // print logo and the card art. They are read from disk with a dynamic path,
  // which the function bundler cannot trace on its own — list them so they
  // ship with the route (there is a fetch-from-CDN fallback, but disk is
  // faster). letter/ = the Letter-card cut the route renders by default.
  outputFileTracingIncludes: {
    '/api/owner/card': ['./public/fonts/*.ttf', './public/images/logo-mark-print.png', './public/images/cards/*.jpg', './public/images/cards/letter/*.jpg', './public/images/cards/backdrops/**/*.jpg', './public/images/cards/cast/*.png'],
  },
  // Narwhal TV (the placemat's WHILE YOU WAIT page) lived at /watch for one
  // day (1 Oct 2026) before the owner named it /socialmedia — keep the old
  // address alive for anything that already points at it.
  async redirects() {
    return [{ source: '/watch', destination: '/socialmedia', permanent: true }];
  },
};

export default nextConfig;
