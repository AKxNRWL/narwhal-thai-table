import Link from 'next/link';
import FadeUp from './FadeUp';
import ReserveForm from './ReserveForm';
import ChefBioReadMore from './ChefBioReadMore';
import MediaFrame from './MediaFrame';
import MapEmbed from './MapEmbed';
import { DISHES } from '@/lib/dishes';
import { getDishImage } from '@/lib/media';

/* ============================================================
   STORY / ABOUT
   ============================================================ */
export function StorySection() {
  return (
    <section className="about" id="story">
      <div className="container">
        <div className="about-grid">
          {/* Future: <MediaFrame ratio="4/5" ornament="inset" src="/images/story.jpg" alt="..." /> */}
          <FadeUp className="about-visual" >
            <div className="about-visual-content">
              <div className="est">Established</div>
              <div className="year">MMXXVI</div>
              <div className="roman">N</div>
              <div className="ornament-divider" style={{ background: 'var(--brass)' }} />
              <div className="est" style={{ color: 'var(--brass-light)' }}>Huntington Beach · CA</div>
            </div>
          </FadeUp>
          <FadeUp className="about-text">
            <span className="label">Our Story</span>
            <h2>Some families build houses. <em>Ours builds tables</em>.</h2>
            <p>We are three siblings — Aileen, Annie, and AK — with thirty years of restaurant life between us: opening rooms, running kitchens, learning what makes a stranger relax into a chair. Somewhere along the way, Huntington Beach won us over — the salt air, the long gold light down PCH, the way this town waves at itself on the walk to the pier.</p>
            <p>So we did what our family has always done with the places we love: we cooked for it. Narwhal Thai Table is the promise we&apos;ve been keeping our whole working lives — Thai recipes rooted in the royal-court tradition, made fresh for every single plate, from ingredients we choose the slow, stubborn way. No shortcuts, no almost.</p>
            <p style={{ color: 'var(--brass-deep)', fontStyle: 'italic' }}>Because what we serve isn&apos;t just dinner. It&apos;s everything around it — the warmth, the welcome, the wanting you back.</p>
            <div className="about-stats">
              <div className="stat"><div className="num">3</div><div className="lbl">Siblings, One Table</div></div>
              <div className="stat"><div className="num">30</div><div className="lbl">Years of Restaurant Life</div></div>
              <div className="stat"><div className="num">HB</div><div className="lbl">Our Hometown</div></div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CHEF
   ============================================================ */
export function ChefSection() {
  return (
    <section className="chef" id="chef">
      <div className="container">
        <div className="chef-grid">
          {/* Future: <MediaFrame ratio="4/5" ornament="inset" src="/images/chef.jpg" alt="Chef Rainny" /> */}
          <FadeUp className="chef-visual">
            <div className="chef-content">
              <div className="role">— Chef &amp; Co-Founder</div>
              <div className="name-en">Chef <em>Rainny</em></div>
              <div className="ornament-divider"></div>
              <div className="badge" style={{ lineHeight: 1.8 }}>
                Le Cordon Bleu<br/>
                Royal Traditional Thai Crafts School for Women
              </div>
              <div style={{ marginTop: 10, fontSize: 10, letterSpacing: '0.22em', color: 'var(--brass-light)', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                Lineage of the Inner-Court Kitchen · King Rama V · Late 1800s
              </div>
            </div>
          </FadeUp>
          <FadeUp className="chef-text">
            <span className="label">Meet the Chef</span>
            <h2>The Living Legacy of <em>Royal Thai Culinary Heritage</em>.</h2>

            {/* Paragraph 1 — Origin + Inner Court + Dae Jang Geum (always visible) */}
            <p>Chef Rainny is one of a very small, elite group of Thai chefs who carry the true weight of authentic royal craft. She trained within the sacred walls of <strong>The Royal Traditional Thai Crafts School for Women</strong> (วิทยาลัยในวังหญิง), an institution descended directly from <em>hong-khreuang fai-nai</em> — the inner-court royal kitchen of <strong>King Chulalongkorn the Great</strong> (Rama V, late 1800s). Here, she mastered the time-honored recipes, intricate flavor balancing, and strict palace discipline that once fed the kings of Siam. Think of it as the Thai counterpart to the legendary world of <em>Dae Jang Geum</em>: the same archetype, the same impossible standard of perfection.</p>

            {/* The Golden Quote — The Chef's Promise (always visible, before the Read More toggle) */}
            <blockquote className="chef-quote golden">
              <span className="quote-label">The Chef&apos;s Promise</span>
              Authenticity means no shortcuts. At Narwhal, we pair timeless royal-court discipline with the finest local ingredients, delivering the true, uncompromised soul of Royal Thai cuisine. Welcome to my table.
            </blockquote>

            {/* Deeper credentials, competition record and credential chips collapse behind a Read More toggle */}
            <ChefBioReadMore>
              {/* Paragraph 2 — Le Cordon Bleu as complementary layer */}
              <p>To complement this deep royal foundation, she also completed her classical training at <strong>Le Cordon Bleu</strong>, bringing an extra layer of professional discipline and refined technique to her traditional roots.</p>

              {/* Paragraph 3 — National stages with bullet list (now with placements) */}
              <p>Her exceptional mastery has been proven under the highest pressure on Thailand&apos;s premier culinary television stages:</p>
              <ul className="chef-competitions">
                <li>
                  <span className="title">MasterChef Thailand</span>
                  <span className="sub">Season 1 · Top 10</span>
                </li>
                <li>
                  <span className="title">Star Chef Thailand</span>
                  <span className="sub">Season 1 · Top 3</span>
                </li>
                <li>
                  <span className="title">Chef Fest Thailand</span>
                </li>
              </ul>
              <p>In these intense, high-stakes arenas where there is no room for error, her skills stood out and commanded absolute respect.</p>

              {/* Paragraph 4 — Narwhal definition (final voice) */}
              <p><strong>Narwhal Thai Table</strong> is her table on HB — where sacred royal-court technique meets fresh California ingredients, driven by her unique artistic vision and an uncompromising dedication to the craft. Every single plate is crafted entirely by her own hands and her own instinct.</p>

              <div className="chef-credentials">
                <span>Le Cordon Bleu</span>
                <span>The Royal Traditional Thai Crafts School for Women · วิทยาลัยในวังหญิง</span>
                <span>MasterChef Thailand · S1 · Top 10</span>
                <span>Star Chef Thailand · S1 · Top 3</span>
                <span>Chef Fest Thailand</span>
                <span>Chef &amp; Co-Founder · Narwhal Thai Table</span>
              </div>
            </ChefBioReadMore>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MENU PREVIEW (on the home page) — shows signature dishes only
   with a CTA pointing to the full /menu page.
   ============================================================ */
export function MenuPreviewSection() {
  const signatures = DISHES.filter(d => d.signature).slice(0, 6);
  return (
    <section className="menu-section" id="menu">
      <div className="container">
        <FadeUp className="section-head">
          <span className="label">What&apos;s Cooking</span>
          <h2>Fresh isn&apos;t a claim here. <em>It&apos;s a schedule</em>.</h2>
          <p>Nothing at this table is made ahead and nothing waits under a lamp — every plate begins when you ask for it. These are the house signatures; the full menu, thirteen categories deep, has a page of its own.</p>
        </FadeUp>

        <FadeUp className="sig-grid">
          {signatures.map(d => {
            const photo = d.image?.src ?? getDishImage(d.slug) ?? undefined;
            return (
              <Link key={d.slug} href={`/menu/${d.slug}`} className="sig-card">
                <MediaFrame
                  ratio="4/3"
                  src={photo}
                  alt={d.image?.alt ?? d.name}
                  sizes="(max-width: 600px) 100vw, (max-width: 980px) 50vw, 33vw"
                  placeholder={
                    <>
                      <svg className="sig-media-mark" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                        <path d="M17 7v12a4 4 0 01-8 0V7M13 7v34" strokeLinecap="round" />
                        <path d="M34 7c-3 0-5 4-5 11s2 7 5 7 5 0 5-7-2-11-5-11zM34 25v16" strokeLinecap="round" />
                      </svg>
                      <span className="sig-media-th">{d.thai}</span>
                    </>
                  }
                />
                <div className="sig-body">
                  <div className="sig-head">
                    <div className="sig-name">{d.name}<span className="thai">{d.thai}</span></div>
                    {d.price && <div className="sig-price">{d.price}</div>}
                  </div>
                  <p className="sig-desc">{d.description}</p>
                  <div className="sig-foot">
                    <span className="sig-tag">Signature</span>
                    {d.spicy && <span className="sig-tag spicy">Spicy</span>}
                    <span className="sig-read">Read the story</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </FadeUp>

        <p className="menu-note" style={{ marginTop: 56 }}>
          <Link href="/menu" className="btn-primary" style={{ display: 'inline-flex', color: 'var(--navy)' }}>
            See the full menu
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   EXPERIENCE (3 PILLARS)
   ============================================================ */
export function ExperienceSection() {
  return (
    <section className="experience" id="experience">
      <div className="container">
        <FadeUp className="section-head">
          <span className="label">The Experience</span>
          <h2>You come for dinner. <em>You leave with more</em>.</h2>
          <p>Three things hold this house together. Thirty years of restaurant life taught them to us, and we&apos;d rather stay small forever than compromise a single one.</p>
        </FadeUp>
        <div className="pillars">
          <FadeUp className="pillar">
            <span className="pillar-num">I.</span>
            <svg className="pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
              <path d="M24 4c-2 4-6 8-6 14a6 6 0 0012 0c0-6-4-10-6-14z" />
              <circle cx="24" cy="34" r="10" />
              <path d="M16 38c2-2 14-2 16 0" />
            </svg>
            <h3>Fresh, Every Plate</h3>
            <p>Curry paste pounded in the stone mortar. The wok lit for your order, not before it. Herbs cut the same hour you taste them. If it isn&apos;t fresh, it doesn&apos;t leave our kitchen.</p>
          </FadeUp>
          <FadeUp className="pillar">
            <span className="pillar-num">II.</span>
            <svg className="pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
              <path d="M6 26c0 8 8 16 18 16s18-8 18-16" />
              <path d="M14 18a10 10 0 0120 0" />
              <path d="M24 8v6" />
              <circle cx="24" cy="26" r="3" fill="currentColor" />
            </svg>
            <h3>Chosen by Hand</h3>
            <p>We source the slow way — seafood off California boats, produce from farms we can name, Thai aromatics flown in weekly. We&apos;re fussy about every ingredient so you never have to be.</p>
          </FadeUp>
          <FadeUp className="pillar">
            <span className="pillar-num">III.</span>
            <svg className="pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
              <path d="M12 36c0-8 6-14 12-14s12 6 12 14" />
              <path d="M16 36h16" />
              <circle cx="18" cy="14" r="2" fill="currentColor" />
              <circle cx="30" cy="14" r="2" fill="currentColor" />
              <path d="M20 18c1 2 3 3 4 3s3-1 4-3" />
            </svg>
            <h3>From Our Family</h3>
            <p>Aileen, Annie, and AK — three siblings who grew up in dining rooms and never wanted to leave. We still believe the finest thing a restaurant can serve is the feeling of being expected.</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   RESERVE
   ============================================================ */
export function ReserveSection() {
  return (
    <section className="reserve" id="reserve">
      <div className="container">
        <div className="reserve-grid">
          <FadeUp className="reserve-info">
            <span className="label">Save a Seat</span>
            <h2>We saved a seat <em>for you</em>.</h2>
            <p>It&apos;s a cozy room, and we like it that way. Send a note or fill out the form — your table will be ready before you are. Birthdays, anniversaries, the big family night out: tell us what the evening means, and we&apos;ll treat it that way.</p>
            <div className="hours-block">
              <h4>Soft Opening — Sunday, August 9</h4>
              <div className="hours-row"><span className="day">Thank you for waiting, Huntington Beach — we&apos;re ready to serve you. Doors open Sunday at 12:00 PM. Come hungry, come as a neighbor.</span></div>
            </div>
          </FadeUp>
          <FadeUp className="reserve-form-wrap">
            <ReserveForm />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT
   ============================================================ */
export function ContactSection() {
  return (
    <section className="contact" id="contact">
      <div className="container">
        <FadeUp className="section-head">
          <span className="label" style={{ color: 'var(--brass-light)' }}>Come See Us</span>
          <h2 style={{ color: 'var(--off-white)' }}>Tell us you&apos;re coming — <em style={{ color: 'var(--brass-light)' }}>we&apos;ll do the rest</em>.</h2>
        </FadeUp>

        <FadeUp className="contact-cards">
          <Link className="contact-card" href="/contact/reservation">
            <span className="contact-card-num">01</span>
            <h3>Reservations</h3>
            <p>Ask for a table and consider it held &mdash; we confirm within a few hours.</p>
            <span className="contact-card-email">reservations@narwhalthaihb.com</span>
            <span className="contact-card-go">Book a table <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/catering">
            <span className="contact-card-num">02</span>
            <h3>Catering &amp; Events</h3>
            <p>Buyouts, family-style feasts, catering that travels well &mdash; your occasion, our table.</p>
            <span className="contact-card-email">catering@narwhalthaihb.com</span>
            <span className="contact-card-go">Plan an event <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/message">
            <span className="contact-card-num">03</span>
            <h3>Say Hello</h3>
            <p>Questions, ideas, a hello from down the street &mdash; every note reaches one of us three.</p>
            <span className="contact-card-email">welcome@narwhalthaihb.com</span>
            <span className="contact-card-go">Send a message <span aria-hidden="true">&rarr;</span></span>
          </Link>
        </FadeUp>

        <FadeUp className="contact-visit">
          <div className="contact-visit-info">
            <span className="label">Find us</span>
            <h3>Visit the table</h3>
            <p>19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/>Mon&ndash;Fri 11:30 AM &ndash; 10:00 PM &middot; Sat&ndash;Sun 12:00 PM &ndash; 10:00 PM<br/>Soft Opening Sunday, August 9 &middot; thank you for waiting</p>
          </div>
          <MapEmbed />
        </FadeUp>
      </div>
    </section>
  );
}
