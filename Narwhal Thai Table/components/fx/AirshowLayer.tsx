'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { activeFx } from '@/lib/events';
import Airshow from '@/components/fx/Airshow';

/**
 * Mounts the site-wide flying display (components/fx/Airshow) on every guest
 * page while lib/events.ts has an event with `fx: 'airshow'` in its window.
 * Resolved after mount so SSR and the first paint never disagree about
 * "today". Staff screens are left alone.
 */
const STAFF = ['/stats', '/orders', '/calls', '/cal', '/os'];

export default function AirshowLayer() {
  const pathname = usePathname() || '/';
  const [fx, setFx] = useState<ReturnType<typeof activeFx>>(undefined);
  useEffect(() => { setFx(activeFx()); }, []);
  if (fx !== 'airshow') return null;
  if (STAFF.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;
  return <Airshow />;
}
