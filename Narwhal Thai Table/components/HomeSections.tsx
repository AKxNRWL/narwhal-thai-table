import Link from 'next/link';
import FadeUp from './FadeUp';
import ReserveForm from './ReserveForm';
import ChefBioReadMore from './ChefBioReadMore';
import MediaFrame from './MediaFrame';
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
            <h2>A Thai kitchen, raised by the <em>California coast</em>.</h2>
            <p>We&apos;re a Thai family who fell in love with Huntington Beach — the salt air, the sunsets over PCH, the way neighbors wave at each other on the way to the pier. So we did what every Thai family does when they love a place: we cooked for it.</p>
            <p>Narwhal Thai Table is our home table, opened wide. The curries are pounded by hand the way our grandmothers taught us. The fish comes off California boats. The smiles are real, because the people serving you are the same people who own the place.</p>
            <p style={{ color: 'var(--brass-deep)', fontStyle: 'italic' }}>Come hungry. Stay a while. You&apos;re family here.</p>
            <div className="about-stats">
              <div className="stat"><div className="num">1800s</div><div className="lbl">Royal-Court Roots</div></div>
              <div className="stat"><div className="num">100%</div><div className="lbl">Made by Hand</div></div>
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
          <h2>Pull up a chair — <em>the kitchen&apos;s got something for you</em>.</h2>
          <p>Here&apos;s a taste of her signature plates. The full menu — thirteen categories from appetizers to dessert — lives on its own page.</p>
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
          <h2>More than a meal — <em>a table to come home to</em>.</h2>
          <p>Three things hold every plate together. They&apos;re the same three things our grandmothers taught us in the family kitchen.</p>
        </FadeUp>
        <div className="pillars">
          <FadeUp className="pillar">
            <span className="pillar-num">I.</span>
            <svg className="pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
              <path d="M24 4c-2 4-6 8-6 14a6 6 0 0012 0c0-6-4-10-6-14z" />
              <circle cx="24" cy="34" r="10" />
              <path d="M16 38c2-2 14-2 16 0" />
            </svg>
            <h3>Cooked by Hand</h3>
            <p>Curries pounded fresh in the stone mortar. Broths simmered slow. No shortcuts — the way home cooking is supposed to be.</p>
          </FadeUp>
          <FadeUp className="pillar">
            <span className="pillar-num">II.</span>
            <svg className="pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
              <path d="M6 26c0 8 8 16 18 16s18-8 18-16" />
              <path d="M14 18a10 10 0 0120 0" />
              <path d="M24 8v6" />
              <circle cx="24" cy="26" r="3" fill="currentColor" />
            </svg>
            <h3>California Sourced</h3>
            <p>Seafood off our coast. Produce from California farms. Thai aromatics flown in weekly so nothing tastes tired or far from home.</p>
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
            <p>Owner-operated by the Angsawothai family. The faces you see at the door are the faces who cook your food. That&apos;s the whole thing.</p>
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
            <p>It&apos;s a cozy room. Give us a call, send a note, or fill out the form — we&apos;ll have your table ready when you get here. Birthdays, anniversaries, big family nights — just tell us, we love a good occasion.</p>
            <div className="hours-block">
              <h4>Hours of Service</h4>
              <div className="hours-row"><span className="day">Monday – Sunday</span><span className="time">11:00 AM — 11:00 PM</span></div>
              <div className="hours-row"><span className="day">Open Every Day</span><span className="time">Lunch through Dinner</span></div>
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
          <h2 style={{ color: 'var(--off-white)' }}>How can we <em style={{ color: 'var(--brass-light)' }}>help?</em></h2>
        </FadeUp>

        <FadeUp className="contact-cards">
          <Link className="contact-card" href="/contact/reservation">
            <span className="contact-card-num">01</span>
            <h3>Reservations</h3>
            <p>Request a table &mdash; we&apos;ll confirm within a few hours.</p>
            <span className="contact-card-email">reservations@narwhalthaihb.com</span>
            <span className="contact-card-go">Book a table <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/catering">
            <span className="contact-card-num">02</span>
            <h3>Catering &amp; Events</h3>
            <p>Buyouts, family-style tastings, off-site catering.</p>
            <span className="contact-card-email">catering@narwhalthaihb.com</span>
            <span className="contact-card-go">Plan an event <span aria-hidden="true">&rarr;</span></span>
          </Link>
          <Link className="contact-card" href="/contact/message">
            <span className="contact-card-num">03</span>
            <h3>Say Hello</h3>
            <p>Questions, suppliers, press &mdash; we&apos;ll get back to you.</p>
            <span className="contact-card-email">welcome@narwhalthaihb.com</span>
            <span className="contact-card-go">Send a message <span aria-hidden="true">&rarr;</span></span>
          </Link>
        </FadeUp>

        <FadeUp className="contact-visit">
          <div className="contact-visit-info">
            <span className="label">Find us</span>
            <h3>Visit the table</h3>
            <p>19072 Beach Boulevard<br/>Huntington Beach, CA 92648<br/>Open daily &middot; 11:00&nbsp;AM &ndash; 11:00&nbsp;PM</p>
          </div>
          <a
            className="map-placeholder"
            href="https://www.google.com/maps/search/?api=1&query=19072+Beach+Blvd+Huntington+Beach+CA+92648"
            target="_blank"
            rel="noopener"
          >
            <div className="map-content">
              <svg className="map-pin" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" focusable="false">
                <path d="M28 6c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z" />
                <circle cx="28" cy="22" r="6" />
              </svg>
              <div className="addr">19072 Beach Boulevard</div>
              <div className="city">Huntington Beach, California &middot; open in Google Maps</div>
            </div>
          </a>
        </FadeUp>
      </div>
    </section>
  );
}
