import Button from '@/components/ui/Button';

/**
 * Prominent embedded Google Map for the "Find us" blocks (home + /contact).
 *
 * Locked to the restaurant's actual Google Business listing via its CID —
 * the stable numeric id of the "Narwhal Thai Table" listing (decoded from
 * the official g.page review link). With the CID the embed renders the real
 * listing card (name, rating, reviews, its own directions button) instead
 * of an anonymous address pin, and can never snap to a lookalike search
 * result. Keyless endpoint — no API key, no quota; loads lazily.
 *
 * The caption link below opens Google Maps DIRECTIONS mode directly
 * (maps/dir + destination) — not a search page. On phones it hands straight
 * into the Google Maps app, ready to navigate to the restaurant.
 */
const PLACE = 'Narwhal Thai Table, 19072 Beach Blvd, Huntington Beach, CA 92648';
/** Stable id (CID) of the restaurant's own Google Business listing. */
const CID = '6790489916821266867';
/** Official embed endpoint, locked to the listing (pb: !4s<CID> !6i<zoom>). */
const EMBED_SRC = `https://www.google.com/maps/embed?pb=!1m4!3m2!1m1!4s${CID}!6i16`;
const DIRECTIONS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PLACE)}`;

export default function MapEmbed() {
  return (
    /* min-w-0: the aspect-ratio + min-height pair would otherwise transfer a
       512px min-content width into a 1fr grid column and overflow on phones. */
    <div className="w-full min-w-0">
      <div className="relative aspect-[16/10] min-h-[320px] w-full min-w-0 overflow-hidden rounded-[var(--radius-frame)] border border-brass/25 bg-navy shadow-card">
        <iframe
          src={EMBED_SRC}
          title="Narwhal Thai Table on Google Maps — 19072 Beach Blvd, Huntington Beach"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <div className="mt-4">
        <Button href={DIRECTIONS_LINK} target="_blank" rel="noopener" variant="ghost" arrow className="text-[11px]">
          Get directions
        </Button>
      </div>
    </div>
  );
}
