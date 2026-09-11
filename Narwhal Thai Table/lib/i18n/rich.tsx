import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { localePath, type Locale } from './locales';

/**
 * Rich — renders dictionary strings that carry a little inline markup, so the
 * dictionaries stay plain text (translators never touch JSX):
 *
 *   *text*            → <em>text</em>   (the brass italic accent in headings)
 *   **text**          → <strong>text</strong>
 *   [label](/menu)    → <Link> (internal, localised for the page's locale)
 *                       or <a> for external / tel: / mailto:
 *   {name}            → vars.name (a ReactNode — price, count, <br/>, …)
 *
 * Anything else is emitted verbatim. Unknown {vars} stay visible so a typo is
 * caught on the page rather than silently swallowed.
 */
export type RichVars = Record<string, ReactNode>;

const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\)|\{[a-zA-Z0-9_]+\})/g;

function renderVars(text: string, vars: RichVars | undefined, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const parts = text.split(/(\{[a-zA-Z0-9_]+\})/g);
  parts.forEach((p, i) => {
    if (!p) return;
    const m = /^\{([a-zA-Z0-9_]+)\}$/.exec(p);
    if (m && vars && m[1] in vars) out.push(<Fragment key={`${keyBase}-${i}`}>{vars[m[1]]}</Fragment>);
    else out.push(p);
  });
  return out;
}

export function richNodes(text: string, opts?: { vars?: RichVars; locale?: Locale; linkClassName?: string }): ReactNode[] {
  const { vars, locale = 'en', linkClassName } = opts ?? {};
  const nodes: ReactNode[] = [];
  const parts = text.split(TOKEN);
  parts.forEach((p, i) => {
    if (!p) return;
    const key = `r${i}`;
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
      nodes.push(<strong key={key}>{renderVars(p.slice(2, -2), vars, key)}</strong>);
      return;
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
      nodes.push(<em key={key}>{renderVars(p.slice(1, -1), vars, key)}</em>);
      return;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
    if (link) {
      const [, label, hrefTpl] = link;
      // {var} inside an href is filled from vars (strings only); an empty
      // result — e.g. ORDER_ONLINE_URL not live yet — renders the label as text.
      const rawHref = hrefTpl.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, k) => {
        if (!vars || !(k in vars)) return m;
        const v = vars[k];
        return typeof v === 'string' || typeof v === 'number' ? String(v) : '';
      });
      const inner = renderVars(label, vars, key);
      if (!rawHref) {
        nodes.push(<Fragment key={key}>{inner}</Fragment>);
        return;
      }
      const internal = rawHref.startsWith('/') && !rawHref.startsWith('//');
      const href = internal ? localePath(locale, rawHref) : rawHref;
      if (internal) {
        nodes.push(<Link key={key} href={href} className={linkClassName}>{inner}</Link>);
      } else {
        const external = /^https?:/.test(href);
        nodes.push(
          <a key={key} href={href} className={linkClassName} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
            {inner}
          </a>,
        );
      }
      return;
    }
    const v = /^\{([a-zA-Z0-9_]+)\}$/.exec(p);
    if (v && vars && v[1] in vars) {
      nodes.push(<Fragment key={key}>{vars[v[1]]}</Fragment>);
      return;
    }
    nodes.push(p);
  });
  return nodes;
}

export default function Rich({
  text,
  vars,
  locale = 'en',
  linkClassName,
}: {
  text: string;
  vars?: RichVars;
  locale?: Locale;
  linkClassName?: string;
}) {
  return <>{richNodes(text, { vars, locale, linkClassName })}</>;
}

/** Plain-string interpolation for attributes (alt, aria-label, title). */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{([a-zA-Z0-9_]+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
