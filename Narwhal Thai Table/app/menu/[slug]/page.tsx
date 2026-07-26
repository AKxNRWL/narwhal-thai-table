import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MediaFrame from '@/components/MediaFrame';
import { DISHES, getDishBySlug, type Dish } from '@/lib/dishes';
import { getCategoryLabel } from '@/lib/categories';
import { ORDER_ONLINE_URL } from '@/lib/site';

type Params = { slug: string };

/* Statically generate every dish page at build time. */
export function generateStaticParams(): Params[] {
  return DISHES.map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const dish = getDishBySlug(slug);
  if (!dish) return { title: 'Dish not found' };
  return {
    title: dish.name,
    description: dish.story?.lede ?? dish.description,
    openGraph: {
      title: `${dish.name} · Narwhal Thai Table`,
      description: dish.story?.lede ?? dish.description,
    },
  };
}

export default async function DishPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const dish = getDishBySlug(slug);
  if (!dish) notFound();

  return <DishDetail dish={dish} />;
}

function DishDetail({ dish }: { dish: Dish }) {
  const placeholder = (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 64, color: 'var(--brass)', lineHeight: 1,
      }}>★</div>
      <div style={{
        marginTop: 16, fontSize: 10, letterSpacing: '0.32em',
        textTransform: 'uppercase', color: 'var(--brass-light)',
      }}>Photo coming soon</div>
      <div style={{
        marginTop: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic',
        fontSize: 20, color: 'var(--off-white)',
      }}>{dish.name}</div>
    </div>
  );

  return (
    <article className="dish-detail">
      <div className="container" style={{ maxWidth: 1280 }}>
        <Link href="/menu" className="dish-detail-back">Back to menu</Link>

        <div className="dish-detail-grid">
          {/*
            Image column.
            When a real photo is shot, pass `src` to MediaFrame and the
            placeholder will fade out automatically:
              <MediaFrame ratio="4/5" ornament="corners"
                src={`/images/dishes/${dish.slug}.jpg`} alt={dish.name} priority />
          */}
          <MediaFrame
            ratio="4/5"
            ornament="corners"
            src={dish.image?.src}
            alt={dish.image?.alt ?? dish.name}
            placeholder={placeholder}
            priority
          />

          <div className="dish-detail-header">
            <span className="label">{getCategoryLabel(dish.category)}</span>
            <h1>
              {dish.name}
              {dish.signature && <em> — Signature</em>}
            </h1>
            {dish.thai && <div className="thai">{dish.thai}</div>}

            {dish.story?.lede && <p className="lede">{dish.story.lede}</p>}

            <div className="dish-detail-meta">
              {dish.signature && <span className="tag">★ Signature</span>}
              {dish.spicy && <span className="tag spicy">Spicy</span>}
              {dish.variants?.map(v => <span key={v} className="tag">{v}</span>)}
            </div>

            {dish.price && (
              <div className="dish-detail-price">{dish.price}</div>
            )}

            {/* Long-form sections — each renders only if data exists */}
            {dish.story?.history && (
              <div className="dish-section">
                <h2>Where it comes <em>from</em></h2>
                <ParagraphsFrom text={dish.story.history} />
              </div>
            )}

            {dish.story?.howToEat && (
              <div className="dish-section">
                <h2>How to <em>eat it</em></h2>
                <ParagraphsFrom text={dish.story.howToEat} />
              </div>
            )}

            {dish.ingredients && dish.ingredients.length > 0 && (
              <div className="dish-section">
                <h2>What&apos;s in <em>the bowl</em></h2>
                <ul>
                  {dish.ingredients.map(i => <li key={i}>{i}</li>)}
                </ul>
              </div>
            )}

            {dish.pairing && (dish.pairing.drink || dish.pairing.sides) && (
              <div className="dish-section">
                <h2>What goes <em>with it</em></h2>
                <div className="dish-pairing">
                  {dish.pairing.drink && (
                    <div>
                      <h4>To drink</h4>
                      <p>{dish.pairing.drink}</p>
                    </div>
                  )}
                  {dish.pairing.sides && dish.pairing.sides.length > 0 && (
                    <div>
                      <h4>On the side</h4>
                      <p>{dish.pairing.sides.join(' · ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {dish.allergens && dish.allergens.length > 0 && (
              <div className="dish-section">
                <h2>Good to <em>know</em></h2>
                <p style={{ marginBottom: 12 }}>
                  Contains the following common allergens — please flag any sensitivities when you order and we&apos;ll adjust:
                </p>
                <div className="dish-allergens">
                  {dish.allergens.map(a => <span key={a} className="tag">{a.replace('-', ' ')}</span>)}
                </div>
              </div>
            )}

            {dish.story?.chefNote && (
              <div className="dish-chef-note">
                <div className="who">— From our kitchen</div>
                <p>&ldquo;{dish.story.chefNote}&rdquo;</p>
              </div>
            )}

            {!dish.story && (
              <div className="dish-section">
                <p style={{ color: 'var(--muted-dark)', fontStyle: 'italic' }}>
                  We&apos;re still writing the story for this plate — it&apos;ll show up here soon. In the meantime, ask your server about the dish when you visit.
                </p>
              </div>
            )}

            <div className="dish-section" style={{ marginTop: 64 }}>
              {ORDER_ONLINE_URL ? (
                <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener" className="btn-primary" style={{ color: 'var(--navy)' }}>
                  Order Online
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              ) : (
                <Link href="/contact/reservation" className="btn-primary" style={{ color: 'var(--navy)' }}>
                  Save a Seat
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ParagraphsFrom({ text }: { text: string }) {
  // Render newline-separated paragraphs cleanly
  return (
    <>{text.split(/\n\s*\n/).map((para, i) => <p key={i}>{para}</p>)}</>
  );
}
