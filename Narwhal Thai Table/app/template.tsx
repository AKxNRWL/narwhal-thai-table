/**
 * Route transition — Next re-mounts template.tsx on every navigation, so the
 * incoming page rises, sharpens and fades in (see .page-in in globals.css).
 * Hash-only jumps within a page don't re-mount, so anchors stay instant.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
