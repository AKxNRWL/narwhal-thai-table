#!/usr/bin/env node
/**
 * sync-orderline — push the LIVE website knowledge into the phone host.
 *
 *   npm run sync:orderline            # sync the ElevenLabs phone agent
 *   npm run sync:orderline -- --dry   # just save the prompt to a file, no push
 *
 * What it does:
 *   1. GET  /api/agent-prompt?agent=voice   (the same facts + menu Aileen uses)
 *   2. GET  ElevenLabs agent config          (so nothing else gets clobbered)
 *   3. PATCH only conversation_config.agent.prompt.prompt
 *   4. GET again and verify the text really landed
 *
 * Needs (in .env.local next to package.json, or as real env vars):
 *   STATS_TOKEN          owner password — unlocks /api/agent-prompt
 *   ELEVENLABS_API_KEY   ElevenLabs > Profile > API Keys (needs agents write)
 *   ELEVENLABS_AGENT_ID  optional, defaults to the Order Line agent below
 *
 * WARNING: the ElevenLabs dashboard is a draft/publish system. If you open the
 * agent in the UI and hit Publish from a stale draft, it overwrites what this
 * script pushed. Sync AFTER publishing, not before.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DEFAULT_AGENT = 'agent_6501kxtn41qqefkagr9d18jewsa4'; // "Aileen — Order Line"
const API = 'https://api.elevenlabs.io/v1/convai/agents';

// --- tiny .env.local reader (no dependencies) ---------------------------
function loadEnv() {
  const f = join(ROOT, '.env.local');
  if (!existsSync(f)) return;
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const v = m[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}
loadEnv();

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const arg = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
};

const DRY = has('--dry') || has('--dry-run');
const WHICH = arg('agent', 'voice'); // voice | chat
const SITE = arg('site', process.env.SITE_URL || 'https://narwhalthaihb.com').replace(/\/$/, '');
const AGENT_ID = arg('id', process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT);
const TOKEN = process.env.STATS_TOKEN;
const KEY = process.env.ELEVENLABS_API_KEY;

const die = (msg) => {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
};

// --- 1. pull the live prompt -------------------------------------------
if (!TOKEN) die('STATS_TOKEN missing — put it in .env.local (same value as the owner password).');

const promptUrl = `${SITE}/api/agent-prompt?agent=${encodeURIComponent(WHICH)}&token=${encodeURIComponent(TOKEN)}`;
const pRes = await fetch(promptUrl);
if (!pRes.ok) die(`Could not read ${SITE}/api/agent-prompt (${pRes.status}). Deployed yet? Token right?`);
const prompt = await pRes.text();
const hash = pRes.headers.get('x-prompt-hash') || '?';
console.log(`✓ prompt from website: ${prompt.length.toLocaleString()} chars (hash ${hash})`);

const outFile = join(HERE, `agent-prompt.${WHICH}.txt`);
writeFileSync(outFile, prompt, 'utf8');
console.log(`  saved a copy → ${outFile}`);

if (DRY) {
  console.log('\n--dry: nothing pushed to ElevenLabs.\n');
  process.exit(0);
}

// --- 2. read the agent (so the PATCH cannot clobber other settings) -----
if (!KEY) die('ELEVENLABS_API_KEY missing — ElevenLabs > Profile > API Keys, then put it in .env.local.');

const headers = { 'xi-api-key': KEY, 'content-type': 'application/json' };
const gRes = await fetch(`${API}/${AGENT_ID}`, { headers });
if (!gRes.ok) die(`ElevenLabs GET failed (${gRes.status}): ${await gRes.text()}`);
const agent = await gRes.json();

const current = agent?.conversation_config?.agent?.prompt ?? {};
const before = (current.prompt ?? '').length;
console.log(`✓ agent "${agent?.name ?? AGENT_ID}" — current prompt ${before.toLocaleString()} chars`);

if ((current.prompt ?? '') === prompt) {
  console.log('\n= already in sync. Nothing to do.\n');
  process.exit(0);
}

// Keep everything the agent already has (llm, temperature, tool_ids,
// knowledge_base…), swap only the text. `tools` is the deprecated inline
// form — sending it back alongside tool_ids makes the API unhappy.
const nextPrompt = { ...current, prompt };
delete nextPrompt.tools;

// --- 3. patch ------------------------------------------------------------
const pat = await fetch(`${API}/${AGENT_ID}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ conversation_config: { agent: { prompt: nextPrompt } } }),
});
if (!pat.ok) die(`ElevenLabs PATCH failed (${pat.status}): ${await pat.text()}`);

// --- 4. verify -----------------------------------------------------------
const vRes = await fetch(`${API}/${AGENT_ID}`, { headers });
const after = (await vRes.json())?.conversation_config?.agent?.prompt?.prompt ?? '';

if (after === prompt) {
  console.log(`\n✓ SYNCED — phone host now matches the website (${after.length.toLocaleString()} chars).`);
  console.log('  Call the Order Line and spot-check one price before trusting it.\n');
} else {
  die(`PATCH went through but the agent still has ${after.length} chars. Open the ElevenLabs UI: a stale draft may have been published over it.`);
}
