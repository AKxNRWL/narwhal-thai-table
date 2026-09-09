import Link from 'next/link';
import type { ReactNode } from 'react';
import FadeUp from './FadeUp';
import ReserveForm from './ReserveForm';
import ChefBioReadMore from './ChefBioReadMore';
import MediaFrame from './MediaFrame';
import MapEmbed from './MapEmbed';
import Button, { Arrow } from '@/components/ui/Button';
import { Section, Container, SectionHead, Eyebrow, Heading, Tag, cardSurface } from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import NumberTicker from '@/components/fx/NumberTicker';
import DotPattern from '@/components/fx/DotPattern';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';

/* Shared type ramp for the long-form paragraphs on this page. */
const bodyText = 'text-[16.5px] leading-[1.75] text-cream/75';
/* Inline text link inside body copy (brass, hairline underline). */
const inlineLink =
  'text-brass-light underline decoration-brass/40 underline-offset-4 transition-colors duration-300 hover:text-cream hover:decoration-brass-light';
/* Glass "seal" card shared by the Story monogram and the Chef visual. */
const sealCard =
  'relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[var(--radius-card)] border border-brass/25 ' +
  'bg-[radial-gradient(80%_70%_at_50%_30%,#152F4A_0%,#0B1F33_58%,#06121F_100%)] px-8 py-14 text-center shadow-card';

/* ============================================================
   STORY / ABOUT
   ============================================================ */
const STORY_STATS = [
  { num: '3', label: 'Siblings, One Table' },
  { num: '30', label: 'Years of Restaurant Life' },
  { num: 'HB', label: 'Our Hometown' },
];

export function StorySection() {
  return (
    <Section id="story" tone="navy">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        {/* Future: <MediaFrame ratio="4/5" ornament="inset" src="/images/story.jpg" alt="..." /> */}
        <FadeUp className="flex flex-col items-start gap-6">
          <Eyebrow>Our Story</Eyebrow>
          <Heading as="h2" size="lg">
            Some families build houses. <em>Ours builds tables</em>.
          </Heading>
          <div className={cn('flex flex-col gap-5', bodyText)}>
            <p>We are three siblings — Aileen, Annie, and AK — with thirty years of restaurant life between us: opening rooms, running kitchens, learning what makes a stranger relax into a chair. Somewhere along the way, Huntington Beach won us over — the salt air, the long gold light down PCH, the way this town waves at itself on the walk to the pier.</p>
            <p>So we did what our family has always done with the places we love: we cooked for it. Narwhal Thai Table is the promise we&apos;ve been keeping our whole working lives — Thai recipes rooted in the royal-court tradition, made fresh for every single plate, from ingredients we choose the slow, stubborn way. No shortcuts, no almost.</p>
            {/* Succession, stated plainly. The owner bought the Thai Gulf business
                and renamed it — saying so out loud serves the people still searching
                the old name (27 clicks / 216 impressions last quarter) and tells
                Google the two entities at this address are one continuous story. */}
            <p>If this address feels familiar, it should. For years it was Thai Gulf — a neighborhood standby. Our family bought the business, hung a new name on the door, and made it our own: our recipes, our mortar, our welcome. If you got here looking for Thai Gulf — welcome back. The table is still here. <Link href="/about" className={cn('whitespace-nowrap', inlineLink)}>Read the whole story &rarr;</Link></p>
            <p className="font-serif text-[18px] italic leading-relaxed text-brass">Because what we serve isn&apos;t just dinner. It&apos;s everything around it — the warmth, the welcome, the wanting you back.</p>
          </div>
          <div className="mt-4 grid w-full grid-cols-3 gap-4 sm:gap-6">
            {STORY_STATS.map((s) => (
              <div key={s.label} className="border-t border-cream/10 pt-5">
                <div className="font-display text-[clamp(32px,4vw,48px)] font-medium leading-none text-brass-light">
                  {/^\d+$/.test(s.num) ? <NumberTicker value={Number(s.num)} duration={1600} /> : s.num}
                </div>
                <div className="mt-2.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.2em] text-cream/55">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeUp>

        {/* Monogram "seal" — sits left on wide screens, after the story on phones */}
        <FadeUp className="lg:order-first">
          <div className={cn(sealCard, 'min-h-[380px] lg:min-h-[560px]')}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[calc(var(--radius-card)-8px)] border border-brass/15" />
            <Eyebrow>Established</Eyebrow>
            <div className="mt-6 font-display text-[clamp(40px,5vw,64px)] font-medium leading-none tracking-[0.08em] text-brass-light">MMXXVI</div>
            <div className="mt-4 font-serif text-[120px] italic leading-none text-cream">N</div>
            <div aria-hidden="true" className="my-7 h-px w-12 bg-brass" />
            <div className="font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">Huntington Beach · CA</div>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

/* ============================================================
   CHEF
   ============================================================ */
const CHEF_COMPETITIONS = [
  { title: 'MasterChef Thailand', sub: 'Season 1 · Top 10' },
  { title: 'Star Chef Thailand', sub: 'Season 1 · Top 3' },
  { title: 'Chef Fest Thailand' },
];

const CHEF_CREDENTIALS = [
  'Le Cordon Bleu',
  'The Royal Traditional Thai Crafts School for Women · วิทยาลัยในวังหญิง',
  'MasterChef Thailand · S1 · Top 10',
  'Star Chef Thailand · S1 · Top 3',
  'Chef Fest Thailand',
  'Chef & Co-Founder · Narwhal Thai Table',
];

export function ChefSection() {
  const chefProse = cn(bodyText, '[&_strong]:font-semibold [&_strong]:text-cream [&_em]:font-serif [&_em]:italic [&_em]:text-brass-light');
  return (
    <Section id="chef" className="border-t border-cream/[0.06]">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* Future: <MediaFrame ratio="4/5" ornament="inset" src="/images/chef.jpg" alt="Chef Rainny" /> */}
        <FadeUp className="lg:self-start">
          <div className={cn(sealCard, 'min-h-[380px] lg:min-h-[520px]')}>
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[calc(var(--radius-card)-8px)] border border-brass/15" />
            <div className="font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">— Chef &amp; Co-Founder</div>
            <div className="mt-6 font-display text-[clamp(36px,4.2vw,56px)] font-medium leading-none text-cream">
              Chef <em className="font-serif font-normal italic text-brass-light">Rainny</em>
            </div>
            <div aria-hidden="true" className="my-7 h-px w-12 bg-brass" />
            <div className="font-sans text-[12px] font-medium uppercase leading-[1.8] tracking-[0.18em] text-cream/70">
              Le Cordon Bleu<br/>
              Royal Traditional Thai Crafts School for Women
            </div>
            <div className="mt-3 font-serif text-[10px] italic tracking-[0.22em] text-brass-light">
              Lineage of the Inner-Court Kitchen · King Rama V · Late 1800s
            </div>
          </div>
        </FadeUp>

        <FadeUp className="flex flex-col items-start gap-6">
          <Eyebrow>Meet the Chef</Eyebrow>
          <Heading as="h2" size="lg">
            The Living Legacy of <em>Royal Thai Culinary Heritage</em>.
          </Heading>

          {/* Paragraph 1 — Origin + Inner Court + Dae Jang Geum (always visible) */}
          <p className={chefProse}>Chef Rainny is one of a very small, elite group of Thai chefs who carry the true weight of authentic royal craft. She trained within the sacred walls of <strong>The Royal Traditional Thai Crafts School for Women</strong> (วิทยาลัยในวังหญิง), an institution descended directly from <em>hong-khreuang fai-nai</em> — the inner-court royal kitchen of <strong>King Chulalongkorn the Great</strong> (Rama V, late 1800s). Here, she mastered the time-honored recipes, intricate flavor balancing, and strict palace discipline that once fed the kings of Siam. Think of it as the Thai counterpart to the legendary world of <em>Dae Jang Geum</em>: the same archetype, the same impossible standard of perfection.</p>

          {/* The Golden Quote — The Chef's Promise (always visible, before the Read More toggle) */}
          <blockquote className="relative w-full overflow-hidden rounded-[var(--radius-card)] border border-brass/30 bg-brass/[0.06] px-7 py-7 shadow-card sm:px-9 sm:py-8">
            <span aria-hidden="true" className="pointer-events-none absolute -right-3 -top-6 select-none font-serif text-[140px] italic leading-none text-brass/10">&ldquo;</span>
            <span className="relative block font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">The Chef&apos;s Promise</span>
            <p className="relative mt-4 font-serif text-[clamp(19px,2vw,24px)] italic leading-[1.5] text-cream">
              Authenticity means no shortcuts. At Narwhal, we pair timeless royal-court discipline with the finest local ingredients, delivering the true, uncompromised soul of Royal Thai cuisine. Welcome to my table.
            </p>
          </blockquote>

          {/* Deeper credentials, competition record and credential chips collapse behind a Read More toggle */}
          <div className="w-full">
            <ChefBioReadMore>
              <div className="flex flex-col gap-5">
                {/* Paragraph 2 — Le Cordon Bleu as complementary layer */}
                <p className={chefProse}>To complement this deep royal foundation, she also completed her classical training at <strong>Le Cordon Bleu</strong>, bringing an extra layer of professional discipline and refined technique to her traditional roots.</p>

                {/* Paragraph 3 — National stages with bullet list (now with placements) */}
                <p className={chefProse}>Her exceptional mastery has been proven under the highest pressure on Thailand&apos;s premier culinary television stages:</p>
                <ol className="border-b border-cream/10">
                  {CHEF_COMPETITIONS.map((c) => (
                    <li key={c.title} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-cream/10 py-3.5">
                      <span className="font-display text-[17px] font-medium text-cream">{c.title}</span>
                      {c.sub && <span className="font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">{c.sub}</span>}
                    </li>
                  ))}
                </ol>
                <p className={chefProse}>In these intense, high-stakes arenas where there is no room for error, her skills stood out and commanded absolute respect.</p>

                {/* Paragraph 4 — Narwhal definition (final voice) */}
                <p className={chefProse}><strong>Narwhal Thai Table</strong> is her table on HB — where sacred royal-court technique meets fresh California ingredients, driven by her unique artistic vision and an uncompromising dedication to the craft. Every single plate is crafted entirely by her own hands and her own instinct.</p>

                <div className="flex flex-wrap gap-2">
                  {CHEF_CREDENTIALS.map((c) => (
                    <Tag key={c} tone="muted" className="max-w-full whitespace-normal text-left">
                      {c}
                    </Tag>
                  ))}
                </div>
              </div>
            </ChefBioReadMore>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

/* ============================================================
   MENU PREVIEW (on the home page) — shows signature dishes only
   with a CTA pointing to the full /menu page.
   ============================================================ */
export function MenuPreviewSection() {
  // Prefer signature dishes we actually have photography for, so the preview
  // grid is all real plates (never a wall of placeholders). Falls back to the
  // plain signature list if fewer than six have photos yet.
  const allSignatures = DISHES.filter(d => d.signature);
  const photographed = allSignatures.filter(d => d.image?.src ?? getDishImage(d.slug));
  const signatures = (photographed.length >= 6 ? photographed : allSignatures).slice(0, 6);
  return (
    <Section id="menu">
      <Container>
        <FadeUp>
          <SectionHead
            eyebrow="What's Cooking"
            title={<>Fresh isn&apos;t a claim here. <em>It&apos;s a schedule</em>.</>}
            lede="Nothing at this table is made ahead and nothing waits under a lamp — every plate begins when you ask for it. These are the house signatures; the full menu, thirteen categories deep, has a page of its own."
          />
        </FadeUp>

        {/* Bento: the first signature is the feature tile (2×2 on desktop), the
            rest fill a 3-column grid. Each card sits in a plain wrapper so the
            stagger reveal (which owns opacity/transform on direct children)
            never fights the card's own hover transitions. */}
        <FadeUp stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {signatures.map((d, i) => {
            const photo = d.image?.src ?? getDishImage(d.slug) ?? undefined;
            const feature = i === 0;
            return (
              <div key={d.slug} className={cn(feature && 'lg:col-span-2 lg:row-span-2')}>
                <Link href={`/menu/${d.slug}`} className={cardSurface('h-full')}>
                  <MediaFrame
                    ratio="4/3"
                    flush
                    hoverZoom
                    src={photo}
                    alt={d.image?.alt ?? d.name}
                    sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                    className={cn(feature && 'lg:min-h-0 lg:flex-1 lg:aspect-auto')}
                    placeholder={
                      <>
                        <svg className="size-10 text-brass/70" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                          <path d="M17 7v12a4 4 0 01-8 0V7M13 7v34" strokeLinecap="round" />
                          <path d="M34 7c-3 0-5 4-5 11s2 7 5 7 5 0 5-7-2-11-5-11zM34 25v16" strokeLinecap="round" />
                        </svg>
                        <span lang="th" className="font-serif text-[15px] italic text-cream/60">{d.thai}</span>
                      </>
                    }
                  />
                  <div className={cn('flex flex-1 flex-col gap-3 p-5 sm:p-6', feature && 'lg:flex-none lg:p-8')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className={cn('font-display text-[19px] font-medium leading-tight text-cream', feature && 'lg:text-[28px]')}>{d.name}</h3>
                        <span lang="th" className="mt-1 block font-serif text-[13px] italic text-cream/55">{d.thai}</span>
                      </div>
                      {d.price && (
                        <span className={cn('shrink-0 font-display text-[17px] font-medium leading-tight text-brass-light', feature && 'lg:text-[22px]')}>{d.price}</span>
                      )}
                    </div>
                    <p className={cn('line-clamp-2 text-[14.5px] leading-relaxed text-cream/70', feature && 'lg:line-clamp-3 lg:text-[16px]')}>{d.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-cream/10 pt-4">
                      <Tag>Signature</Tag>
                      {d.spicy && <Tag tone="spicy">Spicy</Tag>}
                      <span className="ml-auto inline-flex items-center gap-1.5 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
                        Read the story <Arrow />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </FadeUp>

        <div className="mt-12 flex justify-center lg:mt-16">
          <Button href="/menu" variant="primary" size="lg" arrow>
            See the full menu
          </Button>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================
   EXPERIENCE (3 PILLARS)
   ============================================================ */
function Pillar({ numeral, icon, title, children }: { numeral: string; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={cardSurface('h-full p-7 hover:translate-y-0 sm:p-8')}>
      <div className="flex items-start justify-between gap-4">
        <span className="font-serif text-[26px] italic leading-none text-brass">{numeral}</span>
        <span className="grid size-16 shrink-0 place-items-center rounded-full border border-brass/25 bg-brass/10 text-brass-light transition-colors duration-500 group-hover:bg-brass/15">
          {icon}
        </span>
      </div>
      <h3 className="mt-8 font-display text-[22px] font-medium leading-tight text-cream">{title}</h3>
      <p className="mt-3 text-[15.5px] leading-relaxed text-cream/70">{children}</p>
    </div>
  );
}

const pillarIcon = 'size-9';

export function ExperienceSection() {
  return (
    <Section id="experience" className="border-t border-cream/[0.06]">
      <DotPattern className="[mask-image:radial-gradient(70%_70%_at_50%_30%,#000,transparent)]" />
      <Container>
        <FadeUp>
          <SectionHead
            eyebrow="The Experience"
            title={<>You come for dinner. <em>You leave with more</em>.</>}
            lede="Three things hold this house together. Thirty years of restaurant life taught them to us, and we'd rather stay small forever than compromise a single one."
          />
        </FadeUp>
        <FadeUp stagger className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          <div>
            <Pillar
              numeral="I."
              title="Fresh, Every Plate"
              icon={
                <svg className={pillarIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                  <path d="M24 4c-2 4-6 8-6 14a6 6 0 0012 0c0-6-4-10-6-14z" />
                  <circle cx="24" cy="34" r="10" />
                  <path d="M16 38c2-2 14-2 16 0" />
                </svg>
              }
            >
              The wok isn&apos;t lit until your order reaches the kitchen. Vegetables go in raw and come out with a bite; herbs are cut the same hour you taste them. Nothing waits under a heat lamp — if it isn&apos;t fresh, it doesn&apos;t leave our kitchen.
            </Pillar>
          </div>
          <div>
            <Pillar
              numeral="II."
              title="Chosen by Hand"
              icon={
                <svg className={pillarIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                  <path d="M6 26c0 8 8 16 18 16s18-8 18-16" />
                  <path d="M14 18a10 10 0 0120 0" />
                  <path d="M24 8v6" />
                  <circle cx="24" cy="26" r="3" fill="currentColor" />
                </svg>
              }
            >
              Lemongrass, galangal, makrut lime, coriander root, bird&apos;s-eye chilies — cut fresh, never from a jar. The dry spices are toasted and ground here, in small amounts, because ground spice loses its smell in weeks. Every curry paste in this kitchen starts as whole ingredients and a mortar. <Link href="/thai-food-orange-county" className={cn('xl:whitespace-nowrap', inlineLink)}>How to spot a real Thai kitchen &rarr;</Link>
            </Pillar>
          </div>
          <div>
            <Pillar
              numeral="III."
              title="From Our Family"
              icon={
                <svg className={pillarIcon} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                  <path d="M12 36c0-8 6-14 12-14s12 6 12 14" />
                  <path d="M16 36h16" />
                  <circle cx="18" cy="14" r="2" fill="currentColor" />
                  <circle cx="30" cy="14" r="2" fill="currentColor" />
                  <path d="M20 18c1 2 3 3 4 3s3-1 4-3" />
                </svg>
              }
            >
              Aileen, Annie, and AK — three siblings who grew up in dining rooms and never wanted to leave. We still believe the finest thing a restaurant can serve is the feeling of being expected.
            </Pillar>
          </div>
        </FadeUp>
      </Container>
    </Section>
  );
}

/* ============================================================
   RESERVE (exported, not mounted on the home page)
   ============================================================ */
export function ReserveSection() {
  return (
    <Section id="reserve" tone="navy">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <FadeUp className="flex flex-col items-start gap-6">
          <Eyebrow>Save a Seat</Eyebrow>
          <Heading as="h2" size="lg">
            We saved a seat <em>for you</em>.
          </Heading>
          <p className={bodyText}>It&apos;s a cozy room, and we like it that way. Send a note or fill out the form — your table will be ready before you are. Birthdays, anniversaries, the big family night out: tell us what the evening means, and we&apos;ll treat it that way.</p>
          <div className="mt-2 w-full max-w-sm rounded-[var(--radius-card)] border border-cream/10 bg-white/[0.035] p-6 shadow-card">
            <h4 className="font-sans text-[10.5px] font-medium uppercase tracking-[0.3em] text-brass-light">Open Every Day</h4>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[15px] text-cream/75">
              <dt className="text-cream/50">Monday &ndash; Friday</dt>
              <dd className="tabular-nums">11:30 AM &ndash; 10:00 PM</dd>
              <dt className="text-cream/50">Saturday &ndash; Sunday</dt>
              <dd className="tabular-nums">12:00 PM &ndash; 10:00 PM</dd>
            </dl>
          </div>
        </FadeUp>
        <FadeUp>
          <ReserveForm />
        </FadeUp>
      </Container>
    </Section>
  );
}

/* ============================================================
   THE ROOM — real photography from the dining room & patio
   ============================================================ */
export function RoomSection() {
  return (
    <Section id="room" tone="navy">
      <Container>
        <FadeUp>
          <SectionHead
            eyebrow="The Room"
            title={<>A little room with <em>a lot of heart</em>.</>}
            lede="String lights over the patio, orchids at the counter, a good glass of wine while the kitchen hums. Bring everyone — save room for the mango sticky rice, and we'll happily squeeze in one more chair."
          />
        </FadeUp>
        <FadeUp className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-16 lg:grid-cols-[1.6fr_1fr]">
          {/* Live loop of the dining room on opening night — muted, inline.
              Poster = the clip's own first frame, so the swap-in is seamless.
              Spans both rows on desktop and stretches to the two photos' height. */}
          <figure
            aria-label="Inside Narwhal Thai Table — the dining room on opening night"
            className="relative isolate m-0 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-frame)] border border-brass/20 bg-navy shadow-card sm:col-span-2 lg:col-span-1 lg:row-span-2 lg:h-full lg:aspect-auto"
          >
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/room/room-poster.jpg"
              aria-hidden="true"
            >
              <source src="/media/room.mp4" type="video/mp4" />
            </video>
          </figure>
          <MediaFrame
            ratio="16/10"
            src="/images/room/storefront.jpg"
            alt="The Narwhal Thai Table storefront at dusk, string lights glowing over the patio"
            sizes="(max-width: 900px) 100vw, 40vw"
            className="border border-brass/20 shadow-card"
          />
          <MediaFrame
            ratio="16/10"
            src="/images/room/family-spread.jpg"
            alt="A family-style spread — tom yum seafood hot pot, crying tiger, orange chicken, morning glory and Thai iced tea"
            sizes="(max-width: 900px) 100vw, 40vw"
            className="border border-brass/20 shadow-card"
          />
        </FadeUp>
      </Container>
    </Section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
function ContactCard({ href, num, title, email, go, children }: { href: string; num: string; title: ReactNode; email: string; go: string; children: ReactNode }) {
  return (
    <Link href={href} className={cardSurface('h-full p-7 sm:p-8')}>
      <span className="font-sans text-[11px] font-medium tracking-[0.3em] text-brass/80">{num}</span>
      <h3 className="mt-5 font-display text-[22px] font-medium leading-tight text-cream">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-cream/70">{children}</p>
      <span className="mt-5 block break-all font-sans text-[12.5px] text-cream/50">{email}</span>
      <span className="mt-auto inline-flex items-center gap-2 pt-6 font-sans text-[10.5px] font-medium uppercase tracking-[0.18em] text-brass-light">
        {go} <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
      </span>
    </Link>
  );
}

export function ContactSection() {
  return (
    <Section id="contact" tone="glow">
      <DotPattern className="[mask-image:radial-gradient(60%_50%_at_50%_100%,#000,transparent)]" />
      <Container>
        <FadeUp>
          <SectionHead
            eyebrow="Come See Us"
            title={<>Tell us you&apos;re coming — <em>we&apos;ll do the rest</em>.</>}
          />
        </FadeUp>

        <FadeUp stagger className="mt-12 grid gap-6 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          <div>
            <ContactCard href="/contact/reservation" num="01" title="Reservations" email="reservations@narwhalthaihb.com" go="Book a table">
              Ask for a table and consider it held &mdash; we confirm within a few hours.
            </ContactCard>
          </div>
          <div>
            <ContactCard href="/contact/catering" num="02" title={<>Catering &amp; Events</>} email="catering@narwhalthaihb.com" go="Plan an event">
              Buyouts, family-style feasts, catering that travels well &mdash; your occasion, our table.
            </ContactCard>
          </div>
          <div>
            <ContactCard href="/contact/message" num="03" title="Say Hello" email="welcome@narwhalthaihb.com" go="Send a message">
              Questions, ideas, a hello from down the street &mdash; every note reaches one of us three.
            </ContactCard>
          </div>
        </FadeUp>

        <FadeUp className="mt-16 grid gap-10 border-t border-cream/10 pt-14 lg:mt-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:pt-16">
          <div className="flex flex-col items-start gap-5">
            <Eyebrow>Find us</Eyebrow>
            <Heading as="h3" size="md">Visit the table</Heading>
            <p className="text-[16.5px] leading-[1.8] text-cream/75">19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/><a href="tel:+17143786003" className="text-cream transition-colors duration-300 hover:text-brass-light">(714) 378-6003</a><br/>Open every day &middot; Mon&ndash;Fri 11:30 AM &ndash; 10:00 PM &middot; Sat&ndash;Sun 12:00 PM &ndash; 10:00 PM</p>
          </div>
          <MapEmbed />
        </FadeUp>
      </Container>
    </Section>
  );
}
