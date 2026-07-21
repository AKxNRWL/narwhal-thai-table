/**
 * Prominent embedded Google Map for the "Find us" blocks (home + /contact).
 *
 * Uses the keyless Google Maps embed endpoint (`output=embed`) with the
 * BUSINESS NAME in the query — not just the street address — so the pin
 * renders with the "Narwhal Thai Table" listing card (photo, rating,
 * directions button) instead of an anonymous address marker. No API key,
 * no quota, loads lazily so it never blocks the page.
 */
const PLACE = 'Narwhal Thai Table, 19072 Beach Blvd, Huntington Beach, CA 92648';
const EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(PLACE)}&z=15&output=embed`;
const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PLACE)}`;

export default function MapEmbed() {
  return (
    <div className="map-embed">
      <iframe
        src={EMBED_SRC}
        title="Narwhal Thai Table on Google Maps — 19072 Beach Blvd, Huntington Beach"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a className="map-embed-link" href={MAPS_LINK} target="_blank" rel="noopener">
        Get directions on Google Maps <span aria-hidden="true">&rarr;</span>
      </a>
    </div>
  );
}
