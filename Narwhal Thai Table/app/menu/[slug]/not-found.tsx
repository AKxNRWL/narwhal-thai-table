import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="dish-detail">
      <div className="container" style={{ maxWidth: 720, textAlign: 'center' }}>
        <Link href="/menu" className="dish-detail-back">Back to menu</Link>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 5vw, 64px)',
          color: 'var(--navy)', margin: '24px 0 16px',
        }}>
          That plate isn&apos;t on <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--brass-deep)' }}>this table</em>.
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 20, fontStyle: 'italic',
          color: 'var(--muted-dark)', marginBottom: 32,
        }}>
          Maybe the link is old, or we&apos;ve renamed the dish. Take a look at the full menu — our kitchen probably has something even better for you.
        </p>
        <Link href="/menu" className="btn-primary" style={{ color: 'var(--navy)' }}>See the full menu</Link>
      </div>
    </section>
  );
}
