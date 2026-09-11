import type { ReactNode } from 'react';

/**
 * /vi — the Vietnamese edition. The root layout renders <html lang="en">;
 * this inline script flips it to "vi" while the HTML is still parsing, so the
 * first paint, screen readers and crawlers all see the right language.
 * Client-side navigation between the two editions is handled by
 * components/i18n/LangSync.tsx in the root layout.
 */
export default function ViLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.lang='vi'" }} />
      {children}
    </>
  );
}
