/**
 * Brand confetti for form success moments (canvas-confetti, MIT).
 * Loaded lazily so it never touches the initial bundle; no-op for
 * reduced-motion users.
 */
export async function fireConfetti(origin: { x: number; y: number } = { x: 0.5, y: 0.6 }) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const { default: confetti } = await import('canvas-confetti');
    const colors = ['#E3C581', '#C8A24E', '#F5F0E6', '#9C7A33'];
    confetti({ particleCount: 70, spread: 70, startVelocity: 38, gravity: 0.9, ticks: 220, scalar: 0.95, origin, colors, zIndex: 1300 });
    window.setTimeout(() => {
      confetti({ particleCount: 40, spread: 110, startVelocity: 28, gravity: 0.9, ticks: 200, scalar: 0.8, origin, colors, zIndex: 1300 });
    }, 180);
  } catch {
    /* decorative — ignore */
  }
}
