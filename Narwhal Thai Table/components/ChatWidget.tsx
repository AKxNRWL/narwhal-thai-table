'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETINGS = [
  "Hi, I'm Aileen — your host at Narwhal Thai Table. 🌿 Ask me about the menu, what to order, our hours, or book a table. What are you in the mood for?",
  "Sawasdee ka! 🙏 I'm Aileen, the host here at Narwhal Thai Table. Curious about a dish, our hours, or want me to save you a seat?",
  "Hey there — I'm Aileen, your Narwhal Thai Table host. 🐳 I can help you pick a dish, plan a visit, or book a table. Where shall we start?",
  "Welcome in! I'm Aileen. Want a recommendation from our menu, our hours, or a table booked? Just say the word. 🌿",
  "So glad you stopped by — Aileen here, hosting at Narwhal Thai Table. Hungry for ideas, checking hours, or booking a table?",
  "Hi! Aileen, your host at Narwhal Thai Table. 🐳 Ask me anything about the menu or your visit — I can even pass a note to the team for you.",
];

function pickGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

// A guest who scanned a table QR is already seated. Turn the raw ?t= value into
// something we can say out loud: "7" -> table 7, "P3" -> patio table 3,
// anything else (spare cards) -> a neutral "your table".
function seatLabel(t: string): string {
  if (/^\d+$/.test(t)) return `table ${t}`;
  const patio = t.match(/^p-?(\d+)$/i);
  if (patio) return `patio table ${patio[1]}`;
  return 'your table';
}

// Best-effort mirror of the server-side stale-link gate (route.ts): a table QR
// opened outside service hours is a replay from an old visit, so don't greet
// them as seated. Beta hours 2PM–11PM PT (+1h grace); the server enforces the
// real rules — this only picks the right greeting.
function serviceOpenNow(): boolean {
  try {
    const h = Number(
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' })
        .format(new Date()),
    );
    return h >= 14;
  } catch {
    return true;
  }
}

const CLOSED_GREETING =
  "Sawasdee ka! 🌙 We're closed at the moment — open daily 2–11 PM. I'm Aileen, and I'm still happy to help: menu questions, booking a table, or leaving a note for the team. What can I do for you?";

const TOGO_GREETING =
  "Sawasdee ka! 🥡 I'm Aileen — ordering to-go today? Browse the menu right up there and tell me what you'd like. I'll just need a name for the order, and you pay at the counter when it's in!";

// Every page load of ?t=N counts as a fresh scan — guests rescan the card each
// visit and the clock simply restarts. The stamp tracks this seat's LAST
// ACTIVITY: a lingering tab that comes back after 2h idle, or on a different
// service day, quietly becomes plain web-visitor Aileen. No reconnect UI —
// scanning the card again is the way back to table mode.
const SEAT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h since last activity
const SEAT_KEY = 'nara-seat';
type SeatRec = { t: string; ts: number; d: string };
function todayPT(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
  } catch {
    return new Date().toDateString();
  }
}
function readSeat(): SeatRec | null {
  try {
    const r = JSON.parse(localStorage.getItem(SEAT_KEY) || 'null') as SeatRec | null;
    return r && typeof r.t === 'string' && typeof r.ts === 'number' ? r : null;
  } catch {
    return null;
  }
}
function stampSeat(t: string) {
  try {
    localStorage.setItem(SEAT_KEY, JSON.stringify({ t, ts: Date.now(), d: todayPT() }));
  } catch {
    /* private mode etc. — worst case the link just keeps working like before */
  }
}

// Dine-in flow (since Jul 21 2026): Aileen guides the menu but does NOT take
// dine-in orders in chat — servers take every order at the table on the Toast
// handheld, so the greeting steers to the call_server tool instead.
function tableGreeting(t: string): string {
  return `Sawasdee ka — welcome to ${seatLabel(t)}! 🐳 I'm Aileen, your host. Browse the menu just up there and I'll help you pick. When you're ready to order — or need anything at all — just tell me and I'll send a server right over. What are you in the mood for?`;
}

// Little narwhal mark (monochrome, inherits currentColor).
function NarwhalIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d="M6.7 10.1 2.0 6.4a.7.7 0 0 1 .85-1.1l4.6 3.45z" />
      <path d="M20.6 12.1c-1.95-2-4.7-3.2-7.7-3.2-3.45 0-6.3 1.85-6.7 4.35-.8.1-1.55.32-2.25.72-.42.24-.32.72.12.84.93.27 1.9.36 2.85.27.52 2.03 3.15 3.45 6.05 3.45 1.02 0 1.98-.3 2.8-.82 1.53.6 3.25.3 3.65-.42-1-.32-1.85-.92-2.5-1.72 1.3-.3 2.5-.82 3.6-1.62z" />
      <path d="M12.5 7.6c0-.85.45-1.6 1.2-2.0" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  // Mobile only: minimized = half-height bottom sheet so the menu shows behind.
  // Opens full height; the — button in the header shrinks it, focusing the
  // input (typing) expands it back.
  const [mini, setMini] = useState(false);
  const [table, setTable] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: GREETINGS[0] }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open, loading]);

  // Table QR (/menu?t=5): remember the table and open the chat after a beat.
  // Every load restarts the seat clock — rescanning the card always works.
  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get('t');
      if (t && /^[a-zA-Z0-9-]{1,12}$/.test(t)) {
        stampSeat(t);
        setTable(t);
        const id = window.setTimeout(() => setOpen(true), 900);
        return () => window.clearTimeout(id);
      }
    } catch {
      /* no-op */
    }
  }, []);

  // Phones bring this page back from memory hours or days later without a
  // reload (bfcache restore / tab switch). Whenever the page becomes visible
  // again, drop the seat context if it idled past the window OR the service
  // day changed — the lingering tab quietly continues as web-visitor Aileen.
  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState !== 'visible' || !table) return;
      const rec = readSeat();
      if (!rec || rec.t !== table || Date.now() - rec.ts > SEAT_WINDOW_MS || rec.d !== todayPT()) {
        setTable(null);
      }
    };
    window.addEventListener('pageshow', recheck);
    document.addEventListener('visibilitychange', recheck);
    return () => {
      window.removeEventListener('pageshow', recheck);
      document.removeEventListener('visibilitychange', recheck);
    };
  }, [table]);

  useEffect(() => {
    if (!open) return;
    setMini(false); // always reopen at full height
    inputRef.current?.focus();
    // Fresh greeting each time the panel opens (only before any conversation).
    setMsgs((m) =>
      m.length === 1 && m[0].role === 'assistant'
        ? [{
            role: 'assistant',
            content:
              table && !serviceOpenNow()
                ? CLOSED_GREETING
                : table && /^togo$/i.test(table)
                ? TOGO_GREETING
                : table
                ? tableGreeting(table)
                : pickGreeting(),
          }]
        : m,
    );
  }, [open, table]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Mobile keyboard fix: size the panel to the visual viewport (the area
  // ABOVE the on-screen keyboard) so the input + latest messages stay visible.
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const root = document.documentElement;
    const apply = () => {
      root.style.setProperty('--nara-vh', vv.height + 'px');
      root.style.setProperty('--nara-top', vv.offsetTop + 'px');
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    };
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
    };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (table) stampSeat(table); // sliding window — an active chat never expires
    const next: Msg[] = [...msgs, { role: 'user', content: text }];
    setMsgs(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // drop the canned greeting (index 0) before sending
        body: JSON.stringify({ messages: next.slice(1), table }),
      });
      const data = (await res.json()) as { reply?: string };
      setMsgs((m) => [
        ...m,
        { role: 'assistant', content: data.reply || "Sorry, I didn't catch that." },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: 'assistant', content: "Sorry — I couldn't connect. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <button
        className={`nara-fab${open ? ' is-open' : ''}`}
        type="button"
        aria-label={open ? 'Close chat' : 'Chat with Aileen, our host'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <span aria-hidden="true" className="nara-fab-x">&times;</span>
        ) : (
          <NarwhalIcon />
        )}
      </button>

      <div
        className={`nara-panel${open ? ' is-open' : ''}${mini ? ' is-mini' : ''}`}
        role="dialog"
        aria-label="Chat with Narwhal Thai Table"
        aria-hidden={!open}
      >
        <div className="nara-head">
          <div className="nara-head-mark" aria-hidden="true"><NarwhalIcon style={{ width: 24, height: 24 }} /></div>
          <div className="nara-head-id">
            <div className="nara-head-name">Aileen</div>
            <div className="nara-head-sub">Narwhal Thai Table &middot; host</div>
          </div>
          <button
            className="nara-mini"
            type="button"
            aria-label={mini ? 'Expand chat to full screen' : 'Minimize chat to browse the menu'}
            onClick={() => {
              if (!mini) inputRef.current?.blur(); // drop the keyboard so the sheet really shrinks
              setMini(!mini);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {mini ? <path d="M6 14l6-6 6 6" /> : <path d="M5 17h14" />}
            </svg>
          </button>
          <button className="nara-close" type="button" aria-label="Close chat" onClick={() => setOpen(false)}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="nara-msgs" ref={scrollRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`nara-msg nara-${m.role}`}>{m.content}</div>
          ))}
          {loading && (
            <div className="nara-msg nara-assistant nara-typing" aria-label="Aileen is typing">
              <span /><span /><span />
            </div>
          )}
        </div>

        <div className="nara-input-row">
          <input
            ref={inputRef}
            className="nara-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setMini(false)}
            placeholder="Ask about the menu, hours, booking&hellip;"
            maxLength={1500}
            aria-label="Type your message"
          />
          <button
            className="nara-send"
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
        <div className="nara-foot">Aileen is an AI host &mdash; details may vary; the team confirms by email.</div>
      </div>
    </>
  );
}
