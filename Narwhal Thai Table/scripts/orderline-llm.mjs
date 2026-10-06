#!/usr/bin/env node
/**
 * Show (and optionally set) the LLM behind the Order Line phone host (ElevenLabs agent).
 *   node scripts/orderline-llm.mjs              → prints the current llm + temperature
 *   node scripts/orderline-llm.mjs --set <llm>  → PATCHes conversation_config.agent.prompt.llm
 * Needs ELEVENLABS_API_KEY (+ optional ELEVENLABS_AGENT_ID) in .env.local, like sync-orderline.mjs.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
try {
  for (const line of readFileSync(join(ROOT, '.env.local'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const API = 'https://api.elevenlabs.io/v1/convai/agents';
const DEFAULT_AGENT = readFileSync(join(ROOT, 'scripts', 'sync-orderline.mjs'), 'utf8').match(/DEFAULT_AGENT\s*=\s*['"]([^'"]+)['"]/)?.[1];
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT;
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY || !AGENT_ID) { console.error('missing ELEVENLABS_API_KEY / agent id'); process.exit(1); }
const headers = { 'xi-api-key': KEY, 'content-type': 'application/json' };

const res = await fetch(`${API}/${AGENT_ID}`, { headers });
if (!res.ok) { console.error(`GET failed ${res.status}: ${await res.text()}`); process.exit(1); }
const agent = await res.json();
const prompt = agent?.conversation_config?.agent?.prompt ?? {};
console.log(`agent "${agent?.name}" — llm: ${prompt.llm}  temperature: ${prompt.temperature}  custom_llm: ${prompt.custom_llm ? 'yes' : 'no'}`);

const i = process.argv.indexOf('--set');
if (i > 0 && process.argv[i + 1]) {
  const llm = process.argv[i + 1];
  const pat = await fetch(`${API}/${AGENT_ID}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ conversation_config: { agent: { prompt: { llm } } } }),
  });
  if (!pat.ok) { console.error(`PATCH failed ${pat.status}: ${await pat.text()}`); process.exit(1); }
  const v = await (await fetch(`${API}/${AGENT_ID}`, { headers })).json();
  console.log(`→ now llm: ${v?.conversation_config?.agent?.prompt?.llm}`);
}
