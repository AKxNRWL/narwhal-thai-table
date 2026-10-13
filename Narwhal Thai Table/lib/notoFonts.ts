/**
 * Google Fonts CSS for the Noto Sans families (Latin / Thai / SC / TC / KR /
 * JP, 400 + 500). Since 12 Oct 2026 only the Thai / Chinese / Korean /
 * Japanese editions hoist it into <head> (the English pages' ticker uses the
 * device's own fonts instead — components/NotoTickerFonts.tsx is retired)
 * (app/[locale]/layout.tsx) so their body text never paints in a fallback
 * font first. The families are sliced by unicode-range, so a page only
 * downloads the glyph blocks it actually uses.
 */
export const NOTO_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500&family=Noto+Sans+Thai:wght@400;500&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+TC:wght@400;500&family=Noto+Sans+KR:wght@400;500&family=Noto+Sans+JP:wght@400;500&display=swap';
