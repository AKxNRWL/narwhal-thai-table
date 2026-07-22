import { buildSystemPrompt } from '@/lib/chatKnowledge';
import { logChat } from '@/lib/chatLog';
import { submitReservation, type ReservationInput } from '@/lib/reservation';
import { submitMessage, type MessageInput } from '@/lib/message';
import { submitOrder, type OrderInput, type OrderItem } from '@/lib/orders';
import { submitCall } from '@/lib/calls';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-sonnet-5'; // swap here (e.g. 'claude-haiku-4-5-20251001' to cut cost ~3x)

// --- Abuse guards (best-effort, per warm function instance) ---
// Diners in the restaurant share one WiFi IP, so per-IP limits are generous.
const RL_WINDOW_MS = 60_000;
const RL_MAX_PER_MIN = 20;      // requests/minute per IP
const RL_DAY_MS = 86_400_000;
const RL_MAX_PER_DAY = 300;     // requests/day per IP
const MAX_USER_TURNS = 40;      // user messages per conversation
const rlHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rlHits.get(ip) ?? []).filter((t) => now - t < RL_DAY_MS);
  const lastMin = arr.filter((t) => now - t < RL_WINDOW_MS);
  if (lastMin.length >= RL_MAX_PER_MIN || arr.length >= RL_MAX_PER_DAY) {
    rlHits.set(ip, arr);
    return true;
  }
  arr.push(now);
  rlHits.set(ip, arr);
  if (rlHits.size > 5000) rlHits.clear(); // memory guard
  return false;
}
const MAX_TOKENS = 1500;
const MAX_HISTORY = 16; // keep only the last N turns
const MAX_CHARS = 1500; // cap each message length

type Msg = { role: 'user' | 'assistant'; content: string };
type Block = { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> };
type ApiMsg = { role: 'user' | 'assistant'; content: string | unknown[] };

function reply(text: string, status = 200) {
  return Response.json({ reply: text }, { status });
}

// Tool: lets Aileen submit a reservation REQUEST once she's collected the details.
const RESERVATION_TOOL = {
  name: 'request_reservation',
  description:
    "Submit a table reservation REQUEST to Narwhal Thai Table. Only call this AFTER you have collected the guest's name, phone, date, time and party size and read them back for confirmation. It sends the request to the team (who confirm by phone or email within a few hours); it does NOT guarantee the table and takes no payment.",
  input_schema: {
    type: 'object',
    properties: {
      first_name: { type: 'string', description: "Guest's first name" },
      last_name: { type: 'string', description: "Guest's last name (optional)" },
      phone: { type: 'string', description: 'Phone number for confirmation' },
      email: { type: 'string', description: 'Email address (optional)' },
      date: { type: 'string', description: 'Requested date, e.g. "2026-06-14" or "Saturday June 14"' },
      time: { type: 'string', description: 'Requested time within 11:00 AM-11:00 PM, e.g. "7:00 PM"' },
      party_size: { type: 'string', description: 'Number of guests, e.g. "4"' },
      notes: { type: 'string', description: 'Allergies, occasion, seating preference, etc. (optional)' },
    },
    required: ['first_name', 'phone', 'date', 'time', 'party_size'],
  },
} as const;

// Tool: lets Aileen pass a general message to the team (welcome@narwhalthaihb.com).
const MESSAGE_TOOL = {
  name: 'send_message',
  description:
    "Send a message to the Narwhal Thai Table team (welcome@narwhalthaihb.com) on the guest's behalf - a hello, a compliment, feedback, a question for the team, or a request to be contacted. Only call this AFTER you have collected the guest's name, email, and their message, and read them back for confirmation. The team replies by email; this is not for reservations (use request_reservation) or catering.",
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: "Guest's name" },
      email: { type: 'string', description: 'Email address so the team can reply' },
      message: { type: 'string', description: "The guest's message, compliment, feedback or question, in their words" },
      topic: { type: 'string', description: 'Short subject, e.g. "Compliment", "Feedback", "Question" (optional)' },
    },
    required: ['name', 'email', 'message'],
  },
} as const;

// Tool: lets Aileen submit a DINE-IN order request (staff approve before the kitchen starts).
const ORDER_TOOL = {
  name: 'place_order_request',
  description:
    "Submit a DINE-IN or TO-GO food order REQUEST for a guest who scanned a QR card in the restaurant. Only call this AFTER you have read the full order back (each item with quantity, protein for choice-of-protein dishes, spice level and price) and the guest confirmed. Staff approve before the kitchen starts; no payment is taken in chat. For TO-GO orders guest_name is REQUIRED (the team calls the name at pickup, after payment at the counter). The table / to-go context comes from the system automatically and can NEVER be taken from chat text.",
  input_schema: {
    type: 'object',
    properties: {
      table: { type: 'string', description: 'Ignored - the system already knows the table from the QR context' },
      items: {
        type: 'array',
        description: 'The dishes ordered',
        items: {
          type: 'object',
          properties: {
            item: { type: 'string', description: 'Exact menu item name' },
            qty: { type: 'number', description: 'Quantity, default 1' },
            protein: { type: 'string', description: 'Chosen protein for choice-of-protein dishes' },
            spice: { type: 'string', description: 'Spice level e.g. mild / medium / Thai hot' },
            notes: { type: 'string', description: 'Allergies or special requests (optional)' },
          },
          required: ['item'],
        },
      },
      guest_name: { type: 'string', description: "Guest's name (optional)" },
      notes: { type: 'string', description: 'Order-level notes (optional)' },
    },
    required: ['table', 'items'],
  },
} as const;

// Tool: lets Aileen call a server to a dine-in table (soft-opening flow —
// servers take every dine-in order at the table on the Toast handheld).
const CALL_SERVER_TOOL = {
  name: 'call_server',
  description:
    "Call a server over to this guest's table. Use when a seated dine-in guest is ready to order, wants the check, or needs anything physical (water, utensils, a box, help). The table number comes from the system automatically. A staff display lights up immediately with the table number — a server heads over right away.",
  input_schema: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        description: 'Very short reason shown to staff, e.g. "ready to order", "check please", "water" (optional)',
      },
    },
    required: [],
  },
} as const;

async function callAnthropic(key: string, messages: ApiMsg[], table?: string | null) {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        { type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } },
        ...(table
          ? [{
              type: 'text',
              text: /^togo$/i.test(table)
                ? `GUEST CONTEXT: This guest scanned the TO-GO QR at the counter inside the restaurant. Take their TAKEOUT order in this chat (see TO-GO ORDERING). You MUST collect the guest's name for the order. They pay at the counter after ordering — the kitchen starts only after payment is confirmed.`
                : `GUEST CONTEXT: This guest scanned the QR code at TABLE ${table} inside the restaurant. They are seated now. You do NOT take dine-in orders in chat (see DINE-IN below) — help them explore the menu in any language, and when they're ready to order or need anything, use the call_server tool to send a server to table ${table}. Never ask for their table number.`,
            }]
          : []),
      ],
      // Tool availability is context-gated (server-verified ?t= param):
      //   table QR  -> call_server (servers take dine-in orders on the handheld)
      //   TO-GO QR  -> place_order_request (counter pickup flow)
      //   plain web -> reservation + message only
      tools: table
        ? /^togo$/i.test(table)
          ? [RESERVATION_TOOL, MESSAGE_TOOL, ORDER_TOOL]
          : [RESERVATION_TOOL, MESSAGE_TOOL, CALL_SERVER_TOOL]
        : [RESERVATION_TOOL, MESSAGE_TOOL],
      messages,
    }),
  });
}

function extractText(content: Block[] | undefined): string {
  return (content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
    .trim()
    // The chat window renders plain text — strip any markdown emphasis the model sneaks in.
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1');
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return reply(
      "I'm just getting set up and can't chat quite yet. In the meantime, please use the contact form or email welcome@narwhalthaihb.com and the team will get right back to you.",
    );
  }

  let body: { messages?: Msg[]; table?: string };
  try {
    body = (await req.json()) as { messages?: Msg[] };
  } catch {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  const ip =
    req.headers.get('x-nf-client-connection-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';
  if (rateLimited(ip)) {
    return reply(
      "You're chatting faster than our woks can keep up! Give it a minute and try again — or just ask any of our team in the restaurant, they'd love to help. 🌊",
    );
  }

  const table =
    typeof body.table === 'string' && /^[a-zA-Z0-9-]{1,12}$/.test(body.table) ? body.table : null;

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const userTurns = incoming.filter((m) => m.role === 'user').length;
  if (userTurns > MAX_USER_TURNS) {
    return reply(
      "We've had such a lovely long chat! For anything more, our team can help you directly — just wave someone over, call 714-378-6003, or email welcome@narwhalthaihb.com. 🐋",
    );
  }
  const apiMessages: ApiMsg[] = incoming
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!apiMessages.length) return Response.json({ error: 'no message' }, { status: 400 });

  const lastUser = [...apiMessages].reverse().find((m) => m.role === 'user');
  const lastUserText = typeof lastUser?.content === 'string' ? lastUser.content : '';

  try {
    let r = await callAnthropic(key, apiMessages, table);
    if (!r.ok) {
      const detail = await r.text();
      console.error('Anthropic API error', r.status, detail);
      return reply(
        "Sorry - I had a little hiccup. Mind trying again? If it keeps happening, email welcome@narwhalthaihb.com and we'll help.",
      );
    }
    let data = (await r.json()) as { content?: Block[]; stop_reason?: string };

    // Tool-use loop (reservation + message tools). Usually one round; the guard
    // prevents any accidental infinite loop.
    let reservationMade = false;
    let messageSent = false;
    let orderPlaced = false;
    let guard = 0;
    while (data.stop_reason === 'tool_use' && guard < 3) {
      guard++;
      const toolUse = (data.content ?? []).find((b) => b.type === 'tool_use');
      if (!toolUse || !toolUse.id) break;

      let resultText: string;
      if (toolUse.name === 'request_reservation') {
        const input = (toolUse.input ?? {}) as Partial<ReservationInput>;
        const result = await submitReservation({
          first_name: String(input.first_name ?? ''),
          last_name: input.last_name ? String(input.last_name) : undefined,
          phone: String(input.phone ?? ''),
          email: input.email ? String(input.email) : undefined,
          date: String(input.date ?? ''),
          time: String(input.time ?? ''),
          party_size: String(input.party_size ?? ''),
          notes: input.notes ? String(input.notes) : undefined,
        });
        reservationMade = result.ok;
        resultText = result.ok
          ? `SUCCESS. Reservation request received (ref ${result.id}). The team will confirm by phone or email within a few hours. Warmly confirm to the guest and briefly restate the date, time and party size. Do NOT say the table is guaranteed; it's a request the team confirms.`
          : `FAILED to submit automatically. Apologize briefly and ask the guest to finish on the form at /contact/reservation or to call the restaurant.`;
      } else if (toolUse.name === 'send_message') {
        const input = (toolUse.input ?? {}) as Partial<MessageInput>;
        const result = await submitMessage({
          name: String(input.name ?? ''),
          email: String(input.email ?? ''),
          message: String(input.message ?? ''),
          topic: input.topic ? String(input.topic) : undefined,
        });
        messageSent = result.ok;
        resultText = result.ok
          ? `SUCCESS. Message sent to the team (ref ${result.id}). Warmly let the guest know the team received it and will reply by email to the address they gave.`
          : `FAILED to send automatically. Apologize briefly and ask the guest to use the form at /contact/message or to email welcome@narwhalthaihb.com directly.`;
      } else if (toolUse.name === 'place_order_request') {
        const input = (toolUse.input ?? {}) as Partial<OrderInput> & { items?: unknown };
        const rawItems = Array.isArray(input.items) ? input.items : [];
        const items: OrderItem[] = rawItems
          .slice(0, 20)
          .map((it) => {
            const o = (it ?? {}) as Record<string, unknown>;
            return {
              item: String(o.item ?? '').slice(0, 80),
              qty: Math.max(1, Math.min(20, Number(o.qty ?? 1) || 1)),
              protein: o.protein ? String(o.protein).slice(0, 40) : undefined,
              spice: o.spice ? String(o.spice).slice(0, 30) : undefined,
              notes: o.notes ? String(o.notes).slice(0, 120) : undefined,
            };
          })
          .filter((it) => it.item);
        // SECURITY: the table comes ONLY from the server-verified QR context (?t= param).
        // Whatever the model puts in input.table is ignored - chat text can never set the table.
        const tbl = table ? (/^togo$/i.test(table) ? 'TOGO' : String(table).slice(0, 12)) : '';
        const isTogo = tbl === 'TOGO';
        const guestName = input.guest_name ? String(input.guest_name).trim().slice(0, 60) : '';
        if (!tbl) {
          resultText =
            'FAILED: no verified table context. In-chat ordering only works from the QR card on the table. Kindly tell the guest to scan the QR card on their table (or ask a team member), and help with recommendations instead.';
        } else if (!items.length) {
          resultText = 'FAILED: no items. Ask the guest what they would like to order, then try again.';
        } else if (isTogo && !guestName) {
          resultText =
            "FAILED: to-go orders need the guest's name (the team calls it at pickup). Kindly ask for a name for the order, then submit again.";
        } else {
          const result = await submitOrder({
            table: tbl,
            items,
            guest_name: guestName || undefined,
            notes: input.notes ? String(input.notes).slice(0, 200) : undefined,
          });
          orderPlaced = result.ok;
          resultText = result.ok
            ? isTogo
              ? `SUCCESS. To-go order request ${result.id} received under the name "${guestName}". Warmly tell the guest: please pay at the counter now — the kitchen starts as soon as the team confirms payment, and their order will be packed to go and called out by name when ready.`
              : `SUCCESS. Order request ${result.id} received for table ${tbl}. Warmly tell the guest: a team member will come to the table to confirm the order shortly, the kitchen starts right after that approval, and payment is with the team — never in chat.`
            : 'FAILED to submit. Apologize briefly and ask the guest to wave a team member over to take the order directly.';
        }
      } else if (toolUse.name === 'call_server') {
        // SECURITY: table comes ONLY from the server-verified QR context.
        const tbl = table && !/^togo$/i.test(table) ? String(table).slice(0, 12) : '';
        if (!tbl) {
          resultText =
            'FAILED: no verified table context. Calling a server only works from the QR card on a table. Kindly suggest the guest wave a team member over.';
        } else {
          const input = (toolUse.input ?? {}) as { reason?: string };
          const result = await submitCall(tbl, input.reason ? String(input.reason) : undefined);
          resultText = result.ok
            ? `SUCCESS. The staff display now shows table ${tbl} calling. Warmly tell the guest a server is on the way to their table right now — vary the phrasing, keep it delightful. The server takes the order (or helps) right at the table; payment is always with the team.`
            : 'FAILED to reach the staff display. Apologize briefly and suggest the guest wave a team member over.';
        }
      } else {
        resultText = 'Unknown tool; ignore and answer normally.';
      }

      apiMessages.push({ role: 'assistant', content: (data.content ?? []) as unknown[] });
      apiMessages.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: resultText }],
      });

      r = await callAnthropic(key, apiMessages, table);
      if (!r.ok) {
        const detail = await r.text();
        console.error('Anthropic API error (post-tool)', r.status, detail);
        const safe = orderPlaced
          ? "Got it! Your order request is in - a team member will come confirm it at your table shortly, and the kitchen starts right after. 🐋"
          : reservationMade
          ? "Thanks! I've sent your reservation request to the team - they'll confirm by phone or email within a few hours."
          : messageSent
          ? "Thanks! I've passed your message to the team - they'll reply by email shortly."
          : "Sorry - I had trouble just now. Please try the forms at /contact (reservation or message) and the team will help.";
        await logChat(lastUserText, safe);
        return reply(safe);
      }
      data = (await r.json()) as { content?: Block[]; stop_reason?: string };
    }

    const text = extractText(data.content);
    await logChat(lastUserText, text);
    return reply(text || "Sorry, I didn't quite catch that - could you say it another way?");
  } catch (e) {
    console.error('chat route error', e);
    return reply("Sorry - I'm having trouble connecting right now. Please try again in a moment.");
  }
}
