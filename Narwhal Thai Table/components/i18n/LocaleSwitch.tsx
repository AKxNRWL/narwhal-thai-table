'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { chrome } from '@/lib/i18n/chrome';
import { switchLocalePath, type Locale } from '@/lib/i18n/locales';
import { useLocale } from '@/lib/i18n/useLocale';
import { cn } from '@/lib/cn';

/**
 * EN | VI — the language switcher in the nav. Links to the SAME page in the
 * other language (hreflang twin); pages that only exist in English send the
 * Vietnamese link to the /vi home instead of a 404.
 */
export default function LocaleSwitch({ className, size = 'sm' }: { className?: string; size?: 'sm' | 'lg' }) {
  const pathname = usePathname() ?? '/';
  const locale = useLocale();
  const t = chrome(locale).locale;
  const enHref = switchLocalePath(pathname, 'en');
  const viHref = switchLocalePath(pathname, 'vi');

  const item = (code: Locale, href: string, label: string) => {
    const current = code === locale;
    return (
      <Link
        key={code}
        href={href}
        hrefLang={code}
        lang={code}
        aria-current={current ? 'true' : undefined}
        aria-label={label}
        className={cn(
          'rounded-full px-2.5 py-1 font-sans font-medium uppercase tracking-[0.18em] transition-colors duration-300',
          size === 'lg' ? 'text-[12px]' : 'text-[10.5px]',
          current ? 'bg-brass/15 text-brass-light' : 'text-cream/60 hover:text-cream',
        )}
      >
        {code}
      </Link>
    );
  };

  return (
    <div
      role="group"
      aria-label={t.switch}
      className={cn('inline-flex items-center gap-0.5 rounded-full border border-cream/15 bg-white/[0.03] p-0.5', className)}
    >
      {item('en', enHref, t.en)}
      {item('vi', viHref, t.vi)}
    </div>
  );
}
