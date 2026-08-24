/* Shared framework for every Narwhal AI agent.
   Each agent = gather context -> ask Claude (JSON) -> cache (Netlify Blobs).
   Uses the SAME ANTHROPIC_API_KEY as Aileen, so all agents give real advice
   NOW (on demo data) and switch to real numbers the moment Toast is connected.
   No code change is needed to "go live" — only env vars. See lib/toast.ts. */

import { getStore } from '@netlify/blobs';
import { requireSession } from '@/lib/session';
import { bizDate } from '@/lib/toast';

export const MODEL = 'claude-sonnet-4-6';

/* A richer draft item (a review reply, a social post) the owner reviews
   before it ever goes out. Agents only ever DRAFT — never auto-publish. */
export type AgentItem = { title?: string; body?: string; meta?: string };

/* Every agent returns this uniform shape so the AI Office + any UI can render
   any agent the same way: a one-line summary + a flat list of action lines.
   Agents that produce drafts (Reviewer, Social) also fill `items` +
   `needsApproval:true` so the UI can show an Approve step. */
export type AgentResult = {
  ok: true;
  id: string;
  title: string;
  date: string;
  dataLive: boolean; // true when fed by real Toast data
  aiDemo: boolean; // true when advice is the canned demo (no ANTHROPIC_API_KEY / error)
  summary: string;
  lines: string[];
  items?: AgentItem[]; // drafts to review (review replies, social posts)
  needsApproval?: boolean; // true => output is a draft; owner must approve before it goes out
  actionNote?: string; // what still has to happen for the action to actually fire
  trigger?: string; // human-readable cadence ("ทุกเช้า", "รายสัปดาห์")
  cached?: boolean;
};

export async function ownerOk(req: Request): Promise<boolean> {
  return !!(await requireSession(req));
}

export function hasAI(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function callClaude(prompt: string, system: string, maxTokens = 800): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('no ANTHROPIC_API_KEY');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: [{ type: 'text', text: system }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}`);
  const j = await r.json();
  return ((j?.content ?? []) as { type: string; text?: string }[])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('\n')
    .trim();
}

export function parseJSON<T>(text: string, fallback: T): T {
  const t = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(t) as T;
  } catch {
    return fallback;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const s = getStore({ name: 'narwhal-os', consistency: 'strong' });
    const v = await s.get(key, { type: 'json' });
    return (v as T) ?? null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, val: unknown): Promise<void> {
  try {
    const s = getStore({ name: 'narwhal-os', consistency: 'strong' });
    await s.set(key, JSON.stringify(val));
  } catch {
    /* ignore — cache is best-effort */
  }
}

/* The agent loop. Route gathers data + builds the prompt, then calls this. */
export async function runAgent(o: {
  id: string;
  title: string;
  system: string;
  prompt: string;
  demo: { summary: string; lines: string[] };
  dataLive?: boolean;
  cacheKey?: string;
  force?: boolean;
  maxTokens?: number;
}): Promise<AgentResult> {
  const date = bizDate();

  if (o.cacheKey && !o.force) {
    const c = await cacheGet<AgentResult>(o.cacheKey);
    if (c) return { ...c, cached: true };
  }

  let summary = o.demo.summary;
  let lines = o.demo.lines;
  let aiDemo = true;

  if (hasAI()) {
    try {
      const out = await callClaude(o.prompt, o.system, o.maxTokens ?? 800);
      const p = parseJSON<{ summary?: unknown; lines?: unknown[] }>(out, {});
      const ls = Array.isArray(p.lines) ? p.lines.map((x) => String(x)).filter(Boolean) : [];
      if (p.summary || ls.length) {
        summary = String(p.summary ?? o.demo.summary);
        lines = ls.length ? ls : o.demo.lines;
        aiDemo = false;
      }
    } catch {
      /* keep demo */
    }
  }

  const result: AgentResult = {
    ok: true,
    id: o.id,
    title: o.title,
    date,
    dataLive: !!o.dataLive,
    aiDemo,
    summary,
    lines,
  };
  if (o.cacheKey) await cacheSet(o.cacheKey, result);
  return result;
}

/* Standard JSON-schema reminder appended to every agent's system prompt. */
export const JSON_RULE =
  'ตอบกลับเป็น JSON เท่านั้น ห้ามมีข้อความอื่นนอก JSON รูปแบบ: {"summary":"สรุปสั้นๆ 1 ประโยค","lines":["ข้อแนะนำลงมือได้","..."]} ใส่ lines 3-6 ข้อ กระชับ เป็นภาษาไทย มีตัวเลข/ของจริงพอประมาณ.';
