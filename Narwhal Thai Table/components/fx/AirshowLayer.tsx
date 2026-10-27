'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { activeFx } from '@/lib/events';
import Airshow from '@/components/fx/Airshow';
import Halloween from '@/components/fx/Halloween';

/**
 * Mounts the site-wide sky decoration on every guest page while lib/events.ts
 * has an event with an `fx` in its window: `airshow` → components/fx/Airshow
 * (jets + smoke), `halloween` → components/fx/Halloween (little white
 * ghosts). Resolved after mount so SSR and the first paint
 * never disagree about "today". Staff screens are left alone.
 */
const STAFF = ['/stats', '/orders', '/calls', '/cal', '/os'];

export default function AirshowLayer() {
  const pathname = usePathname() || '/';
  const [fx, setFx] = useState<ReturnType<typeof activeFx>>(undefined);
  useEffect(() => { setFx(activeFx()); }, []);
  if (!fx) return null;
  if (STAFF.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;
  if (fx === 'airshow') return <Airshow />;
  if (fx === 'halloween') return <Halloween />;
  return null;
}
