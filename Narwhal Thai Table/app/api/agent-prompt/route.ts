import { createHash } from 'crypto';
import { buildSystemPrompt } from '@/lib/chatKnowledge';
import { buildVoicePrompt } from '@/lib/voiceKnowledge';

/**
 * Serves the LIVE agent prompt as plain text, so any off-site agent (today:
 * the ElevenLabs phone host) can be kept in exact sync with the website's
 * Aileen — same facts, same menu, same prices.
 *
 *   GET /api/agent-prompt?agent=voice&token=STATS_TOKEN   -> phone prompt
 *   GET /api/agent-prompt?agent=chat&token=STATS_TOKEN    -> website prompt
 *
 * The x-prompt-hash header is a short digest: if it has not changed, nothing
 * needs re-syncing. Token = STATS_TOKEN (same owner password as /stats).
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const expected = process.env.STATS_TOKEN;
  const url = new URL(req.url);
  const given = url.searchParams.get('token') ?? req.headers.get('x-agent-token') ?? '';
  if (!expected || given !== expected) {
    return new Response('unauthorized', { status: 401 });
  }

  const text = url.searchParams.get('agent') === 'chat' ? buildSystemPrompt() : buildVoicePrompt();
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 12);

  return new Response(text, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'x-prompt-hash': hash,
      'x-prompt-chars': String(text.length),
      'cache-control': 'no-store',
    },
  });
}
