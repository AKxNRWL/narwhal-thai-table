import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL, ORDER_ONLINE_URL, DIRECTIONS_URL, RESTAURANT_ID } from '@/lib/site';

/**
 * /thai-food-orange-county — the field guide.
 *
 * WHY THIS PAGE EXISTS: "best thai food in orange county" gets ~720 searches
 * a month with weak competition, and "thai food huntington beach" another
 * ~480. Nobody ranking for them actually explains Thai food — they're all
 * auto-generated review lists. This page is the thing only we can write: a
 * Thai family that cooks it, telling people how to judge it. Every dish name
 * links to its own story page, which also feeds internal links to the 67
 * dish pages Google hasn't crawled yet.
 *
 * Copy rules honored here: no invented sourcing claims, no trash-talking
 * other kitchens, no fake "top 10" — we answer the question honestly and put
 * our own table on the record.
 */

const TITLE = "Best Thai Food in Orange County (2026) — A Thai Family's Field Guide";
const DESCRIPTION =
  "A Thai family's guide to the best Thai food in Orange County: five signs of a real Thai kitchen, what to order, how to judge every dish. Updated Sept 2026.";
// Dates feed the Article markup + Open Graph below. Bump DATE_MODIFIED whenever
// the guide's content changes (the sitemap has its own LAST_CONTENT_UPDATE).
const DATE_PUBLISHED = '2026-08-28';
const DATE_MODIFIED = '2026-09-03';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/thai-food-orange-county' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/thai-food-orange-county`,
    type: 'article',
    publishedTime: `${DATE_PUBLISHED}T00:00:00-07:00`,
    modifiedTime: `${DATE_MODIFIED}T00:00:00-07:00`,
    authors: [`${SITE_URL}/about`],
  },
};

/**
 * Article markup so Google/AI readers see this as an authored, dated guide
 * (not a menu page): who wrote it, when, and which Restaurant entity stands
 * behind it. No aggregateRating / Review / FAQPage here — house rule.
 */
const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/thai-food-orange-county#article`,
  headline: TITLE,
  description: DESCRIPTION,
  url: `${SITE_URL}/thai-food-orange-county`,
  mainEntityOfPage: `${SITE_URL}/thai-food-orange-county`,
  inLanguage: 'en-US',
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  image: [`${SITE_URL}/images/og-cover.jpg`],
  author: {
    '@type': 'Organization',
    name: 'Narwhal Thai Table',
    url: `${SITE_URL}/about`,
    description: 'Three siblings — Aileen, Annie and AK — who run a Thai kitchen in Huntington Beach, California.',
  },
  publisher: { '@id': RESTAURANT_ID },
  about: [
    { '@type': 'Thing', name: 'Thai cuisine' },
    { '@type': 'Place', name: 'Orange County, California' },
  ],
  keywords: 'best Thai food in Orange County, Thai food Orange County, Thai restaurant Huntington Beach, authentic Thai food',
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Thai Food in Orange County', item: `${SITE_URL}/thai-food-orange-county` },
  ],
};

function Dish({ slug, children }: { slug: string; children: React.ReactNode }) {
  return <Link href={`/menu/${slug}`}>{children}</Link>;
}

export default function ThaiFoodOrangeCountyPage() {
  return (
    <section className="menu-section" style={{ paddingTop: 140, paddingBottom: 100 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <div className="container">
        <div className="section-head">
          <span className="label">The Field Guide · Updated September 2026</span>
          <h1>The best Thai food in Orange County — <em>a Thai family&apos;s field guide</em></h1>
          <p>
            Written by three siblings who grew up in Thai restaurant kitchens and now run one on
            Beach Boulevard in Huntington Beach. Not a top-ten list — a guide to what makes Thai
            food good, wherever in Orange County you end up eating it.
          </p>
        </div>

        <div className="guide-prose">
          <p>
            Search &ldquo;best Thai food in Orange County&rdquo; and you&apos;ll get pages of
            review scores. Scores tell you a restaurant is liked; they don&apos;t tell you it&apos;s
            <em> Thai</em>. The difference lives in the kitchen — in whether the curry paste was
            pounded that week or poured from a tub, whether your plate was cooked for you or
            scooped from a hotel pan. We&apos;ve spent thirty years combined inside those kitchens.
            Here is what we&apos;d tell a friend to look for.
          </p>

          <h2>Five signs you&apos;re in a <em>real Thai kitchen</em></h2>
          <ul>
            <li>
              <strong>The curry paste is pounded, not poured.</strong> Real curry starts as whole
              dried chilies, garlic, lemongrass, galangal, and roasted spices worked in a granite
              mortar. You can taste the difference in the first spoonful — pounded paste is
              fragrant and layered; factory paste is flat heat and salt.
            </li>
            <li>
              <strong>Nothing is cooked until you order it.</strong> Thai food is wok food — built
              for fire and immediacy. If your pad see ew arrives in four minutes on a Friday night,
              it wasn&apos;t cooked for you.
            </li>
            <li>
              <strong>The herbs are fresh, and they&apos;re the right ones.</strong> Krapow means
              holy basil — peppery, sharp, closer to clove than to sweet basil. A kitchen that
              swaps in whatever basil is cheap will swap other corners too.
            </li>
            <li>
              <strong>The menu goes past pad thai.</strong> Look for the dishes Thai families
              actually order: boat noodles, larb, som tum, whole fish. A menu with an Isaan corner
              is a menu written by someone who misses home.
            </li>
            <li>
              <strong>The rice is treated like it matters.</strong> Jasmine rice, properly steamed,
              still fragrant. In Thailand rice is the meal; everything else is what you eat it
              with. A kitchen careless with rice is careless.
            </li>
          </ul>

          <h2>What to order — <em>and how to judge it</em></h2>
          <p>
            <strong>Curries.</strong> Order a <Dish slug="green-curry">green curry</Dish> and judge
            the paste: it should smell like herbs, not just taste hot, with heat that builds
            instead of slapping. A <Dish slug="panang-curry">panang</Dish> should be thicker and
            richer than the others — salty-sweet, clinging to the meat. A{' '}
            <Dish slug="yellow-curry">yellow curry</Dish> is the gentlest test: turmeric-warm,
            never mud-flat.
          </p>
          <p>
            <strong>Soups.</strong> <Dish slug="tom-yum">Tom yum</Dish> is the classic exam —
            hot and sour have to arrive together, riding lemongrass, galangal, and makrut lime
            leaf. In a <Dish slug="tom-kha">tom kha</Dish>, coconut milk should carry the galangal,
            not bury it.
          </p>
          <p>
            <strong>The Isaan corner.</strong> This is where a menu shows its passport.{' '}
            <Dish slug="som-tum-thai">Som tum</Dish> should crunch and sting — lime, fish sauce,
            chilies and green papaya in actual balance. <Dish slug="larb">Larb</Dish> needs toasted
            rice powder you can feel between your teeth. And{' '}
            <Dish slug="crying-tiger">crying tiger</Dish> — char-edged beef with jaew for dipping —
            tells you the grill station takes itself seriously.
          </p>
          <p>
            <strong>Noodles.</strong> The realest test in Orange County is a bowl of{' '}
            <Dish slug="thai-boat-noodles">boat noodles</Dish>: the broth should be dark, glossy,
            a little mysterious — hours deep, not bouillon quick. A true{' '}
            <Dish slug="og-pad-thai">pad thai</Dish> is tamarind-sour and fish-sauce-savory, never
            ketchup-sweet. <Dish slug="pad-see-ew">Pad see ew</Dish> should carry wok breath — that
            faint char you can smell before the plate lands — and{' '}
            <Dish slug="pad-kee-mao">pad kee mao</Dish> should bring the heat pad thai politely
            declines.
          </p>
          <p>
            <strong>One plate, one egg.</strong> <Dish slug="krapow-over-rice">Krapow over
            rice</Dish> is Thailand&apos;s weeknight dinner: holy basil, chilies, a fried egg with
            crisp lace edges. If a kitchen nails this humble plate, trust it with everything else.
          </p>
          <p>
            <strong>Finish.</strong> <Dish slug="mango-sticky-rice">Mango sticky rice</Dish> lives
            and dies on the rice — warm, coconut-rich, a whisper of salt against the fruit. Then{' '}
            <Dish slug="thai-tea">Thai tea</Dish>, strong enough to stand up to ice.
          </p>

          <h2>So — where <em>is</em> the best Thai food in Orange County?</h2>
          <p>
            Honest answer: &ldquo;best&rdquo; depends on the dish, the day, and how far you&apos;ll
            drive. Orange County has real Thai cooking scattered from Anaheim to the coast, and we
            won&apos;t pretend otherwise — we&apos;re cooks, not critics.
          </p>
          <p>
            What we can put on the record is our own kitchen. At Narwhal Thai Table in Huntington
            Beach, the curry pastes start whole in a granite mortar, the spices are roasted and
            ground here, and nothing is cooked until you&apos;ve ordered it. Sixty-seven dishes,
            thirteen categories, three siblings — and a mango sticky rice we&apos;d put up against
            anyone&apos;s.
          </p>

          <h2>Thai food in <em>Huntington Beach</em></h2>
          <p>
            If you&apos;re searching for Thai food in Huntington Beach specifically: we&apos;re at{' '}
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener">19072 Beach Blvd, Suite A &amp; B</a> —
            the plaza on Beach Boulevard, minutes from Fountain Valley, Westminster, and Costa
            Mesa. This address has served Thai food for years as Thai Gulf; in 2026 we bought it,
            renamed it, and made it ours. Open every day, Mon–Fri 11:30 AM–10 PM and Sat–Sun
            12–10 PM.
          </p>
          <p>
            Come hungry, order the boat noodles, and judge us by everything above.
          </p>

          <h2>Thai food near you, <em>around the county</em></h2>
          <p>
            We cook in Huntington Beach and feed a lot of neighbors from next door. If you&apos;re
            coming from <Link href="/thai-food-fountain-valley">Fountain Valley</Link> it&apos;s
            about eight minutes down Brookhurst or Slater; from{' '}
            <Link href="/thai-food-westminster">Westminster</Link> it&apos;s a straight run down
            Beach Boulevard, about twelve minutes. Costa Mesa, Seal Beach and the rest of the
            coast are a short drive — and{' '}
            <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener">pickup</a> is ready by the time
            you get here.
          </p>

          <h2>Questions people <em>ask us</em></h2>
          {/* Plain-text FAQ on purpose — no FAQPage markup (Google dropped the
              rich result; the words themselves are what search and AI read). */}
          <h3>Where is the best Thai food in Orange County?</h3>
          <p>
            Wherever the curry paste is pounded and the wok isn&apos;t lit until you order — use the
            five signs above and you&apos;ll find it in more than one city. Our own answer is
            Narwhal Thai Table, 19072 Beach Blvd in Huntington Beach: a family kitchen with sixty-seven
            dishes, an Isaan corner, and a mango sticky rice we&apos;re proud of. Come judge for
            yourself.
          </p>
          <h3>What should I order at a Thai restaurant in Orange County?</h3>
          <p>
            Order the plates that show a kitchen&apos;s passport: <Dish slug="thai-boat-noodles">boat
            noodles</Dish>, <Dish slug="krapow-over-rice">krapow over rice</Dish>, a{' '}
            <Dish slug="som-tum-thai">som tum</Dish>, and one curry — <Dish slug="green-curry">green</Dish>{' '}
            if you like heat, <Dish slug="panang-curry">panang</Dish> if you like it rich. Finish
            with <Dish slug="mango-sticky-rice">mango sticky rice</Dish>.
          </p>
          <h3>How can I tell if a Thai restaurant is authentic?</h3>
          <p>
            Ask whether the curry paste is made in-house, watch whether plates are cooked to order,
            taste the basil in the krapow (holy basil is peppery, not sweet), look for an Isaan
            section on the menu, and pay attention to the rice. A kitchen that gets those five right
            rarely gets the rest wrong.
          </p>
          <h3>Is Huntington Beach a good place for Thai food?</h3>
          <p>
            Yes — Beach Boulevard has had Thai kitchens for years, ours included. Narwhal Thai
            Table is open every day for dine-in, pickup and delivery, with a dog-friendly patio
            and <Link href="/lunch">weekday lunch specials</Link> from $11.99, Monday to Friday
            until 3 PM. Here is <Link href="/menu">the full menu</Link>.
          </p>

          <div className="guide-cta">
            <Link href="/menu" className="btn-primary">Browse all 67 dishes</Link>
            {ORDER_ONLINE_URL && (
              <a href={ORDER_ONLINE_URL} target="_blank" rel="noopener" className="btn-secondary">Order pickup</a>
            )}
            <Link href="/contact/reservation" className="btn-secondary">Save a seat</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
