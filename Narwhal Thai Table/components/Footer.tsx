import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/images/logo-mark-cream.png" alt="" style={{ width: 54, height: 'auto', opacity: 0.95 }} />
          <span>Narwhal <em>Thai Table</em></span>
        </div>
        {/*
          Social URLs are placeholders — swap to real account URLs once live.
          rel="noopener" set per security best practice; aria-label clarifies
          the destination because the link text is just the platform name.

          The /play link is a discrete pointer to the Bubble Glide mini-game —
          we intentionally don't put it in the main nav (it would feel
          off-brand against the fine-dining tone), but it lives here for
          anyone who knows to look.
        */}
        <nav className="footer-social" aria-label="Social and extras">
          <a href="mailto:welcome@narwhalthaihb.com" aria-label="Email Narwhal Thai Table">welcome@narwhalthaihb.com</a>
          <a href="#" aria-label="Narwhal Thai Table on Instagram" rel="noopener">Instagram</a>
          <a href="#" aria-label="Narwhal Thai Table on Facebook" rel="noopener">Facebook</a>
          <a href="#" aria-label="Narwhal Thai Table on Yelp" rel="noopener">Yelp</a>
          <a href="#" aria-label="Narwhal Thai Table on Google" rel="noopener">Google</a>
          <Link href="/play" aria-label="Play Bubble Glide, our narwhal mini-game">Bubble Glide</Link>
        </nav>
        <div className="footer-copy">© 2026 Narwhal Hospitality LLC · Huntington Beach, CA</div>
      </div>
    </footer>
  );
}
