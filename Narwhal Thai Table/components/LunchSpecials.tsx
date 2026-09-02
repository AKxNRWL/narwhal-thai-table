import Link from 'next/link';
import FadeUp from './FadeUp';
import PhotoCarousel from './PhotoCarousel';
import { LUNCH, LUNCH_PHOTOS, LUNCH_PHOTO_DIR } from '@/lib/lunchPhotos';
import { RESTAURANT } from '@/lib/site';

/**
 * Homepage — Lunch Specials, directly under the hero.
 *
 * Owner's ask (2 Sep 2026): "เอาให้ขึ้นหน้าแรกเลย ตอนเปิดเว็บมาเจอเลย" — the
 * weekday lunch deal should be the first thing a visitor meets, not only the
 * dismissable pop-up. This is real, server-rendered content (indexable for
 * "thai lunch special huntington beach"), with the eight plate photos in the
 * same swipeable strip the pop-up uses. Facts live in lib/lunchPhotos.ts.
 */
export default function LunchSpecials() {
  const photos = LUNCH_PHOTOS.map(({ file, label }) => ({ src: `${LUNCH_PHOTO_DIR}/${file}`, alt: label }));
  const tel = 'tel:' + RESTAURANT.phone.replace(/[^\d+]/g, '');
  return (
    <section className="lunch" id="lunch-specials" aria-labelledby="lunch-title">
      <div className="container lunch-grid">
        <FadeUp className="lunch-photos">
          <PhotoCarousel images={photos} label="Lunch Special plates" eagerCount={1} />
        </FadeUp>
        <FadeUp className="lunch-copy">
          <span className="label">Weekday Lunch Specials</span>
          <h2 id="lunch-title">
            Thai lunch specials, <em>from {LUNCH.fromPrice}</em>
          </h2>
          <div className="lunch-when">{LUNCH.days} · {LUNCH.hours}</div>
          <p>
            Pick a plate — every lunch comes with {LUNCH.includes}.
          </p>
          <ul className="lunch-plates" aria-label="Lunch Special plates">
            {LUNCH.plates.map((p) => <li key={p}>{p}</li>)}
          </ul>
          <div className="lunch-cta">
            {RESTAURANT.phone && (
              <a className="btn-primary" href={tel}>
                Call to order lunch
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            )}
            <Link className="btn-secondary" href={LUNCH.menuPath}>
              See the lunch menu
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
