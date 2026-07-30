#!/usr/bin/env node
/**
 * setup-orderline-tools — one-time (idempotent) beta wiring for the phone agent.
 *
 *   node scripts/setup-orderline-tools.mjs
 *
 * 1. Reads the existing place_phone_order tool to reuse its x-phone-secret.
 * 2. Creates webhook tools take_reservation + take_message (skips if they exist).
 * 3. PATCHes the agent's tool_ids: adds the two new tools and REMOVES
 *    place_phone_order (beta rule: no phone orders — endpoint stays live,
 *    re-add the id later to turn phone ordering back on).
 *
 * Needs ELEVENLABS_API_KEY in .env.local (same as sync-orderline).
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const AGENT_ID = process.env.ELEVENLABS_AGENT_ID || 'agent_6501kxtn41qqefkagr9d18jewsa4';
const ORDER_TOOL_ID = 'tool_0901kxtpkygde9vb7g8jcxsyeh75'; // place_phone_order (Jul 18)
const API = 'https://api.elevenlabs.io/v1/convai';
const SITE = 'https://narwhalthaihb.com';

for (const line of existsSync(join(ROOT, '.env.local')) ? readFileSync(join(ROOT, '.env.local'), 'utf8').split(/\r?\n/) : []) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('✖ ELEVENLABS_API_KEY missing in .env.local'); process.exit(1); }
const H = { 'xi-api-key': KEY, 'content-type': 'application/json' };

const j = async (r) => { if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`); return r.json(); };

// 1. secret from the existing order tool
const orderTool = await j(await fetch(`${API}/tools/${ORDER_TOOL_ID}`, { headers: H }));
const secret = orderTool?.tool_config?.api_schema?.request_headers?.['x-phone-secret'];
if (!secret) { console.error('✖ could not read x-phone-secret from the old order tool'); process.exit(1); }
console.log('✓ reusing x-phone-secret from place_phone_order');

const defs = [
  ['take_reservation', `${SITE}/api/voice/reservation`,
   "Submit a table reservation REQUEST for a phone caller. Only call this after you have the caller's name, phone number, date, time and party size, AND you read them back and the caller confirmed. It is a request, not a guaranteed table: the team confirms by phone. No payment is taken.",
   { first_name:['string',"Caller's first name",true], last_name:['string',"Caller's last name (optional)",false],
     phone:['string','Callback phone number, digits as spoken',true], email:['string','Email address, only if the caller volunteers it',false],
     date:['string',"Requested date, e.g. 'Saturday August 8'",true], time:['string',"Requested time between 11:00 AM and 11:00 PM, e.g. '7:00 PM'",true],
     party_size:['string',"Number of guests, e.g. '4'",true], notes:['string','Allergies, occasion, seating preference (optional)',false] }],
  ['take_message', `${SITE}/api/voice/message`,
   "Pass a message to the restaurant team and request a callback. Use for anything you cannot finish on the call: catering, private events, a complaint, press, suppliers, a caller who wants to order but will not order online. Only call after you have the caller's name, phone number and a one-line reason, and you read the phone number back digit by digit.",
   { name:['string',"Caller's name",true], phone:['string','Callback phone number, digits as spoken',true],
     email:['string','Email, only if the caller volunteers it',false], message:['string',"What the call is about, in the caller's own words",true],
     topic:['string',"Short subject, e.g. 'Catering', 'Complaint', 'Callback' (optional)",false] }],
];

// 2. create (or find) the two tools
const listing = await j(await fetch(`${API}/tools`, { headers: H }));
const existing = new Map((listing?.tools ?? []).map((t) => [t?.tool_config?.name, t?.id]));

const newIds = [];
for (const [name, url, description, props] of defs) {
  if (existing.get(name)) { console.log(`= ${name} already exists (${existing.get(name)})`); newIds.push(existing.get(name)); continue; }
  const properties = {}, required = [];
  for (const [k, [type, desc, req]] of Object.entries(props)) { properties[k] = { type, description: desc }; if (req) required.push(k); }
  const body = { tool_config: { type: 'webhook', name, description, response_timeout_secs: 20,
    api_schema: { url, method: 'POST', request_headers: { 'x-phone-secret': secret },
      request_body_schema: { type: 'object', description, properties, required } } } };
  const made = await j(await fetch(`${API}/tools`, { method: 'POST', headers: H, body: JSON.stringify(body) }));
  console.log(`✓ created ${name} → ${made.id}`);
  newIds.push(made.id);
}

// 3. swap the agent's tool list: + reservation/message, − phone orders (beta)
const agent = await j(await fetch(`${API}/agents/${AGENT_ID}`, { headers: H }));
const prompt = { ...(agent?.conversation_config?.agent?.prompt ?? {}) };
const oldIds = prompt.tool_ids ?? [];
const nextIds = [...new Set([...oldIds.filter((id) => id !== ORDER_TOOL_ID), ...newIds])];
delete prompt.tools;
prompt.tool_ids = nextIds;

await j(await fetch(`${API}/agents/${AGENT_ID}`, { method: 'PATCH', headers: H,
  body: JSON.stringify({ conversation_config: { agent: { prompt } } }) }));

// 4. verify
const check = await j(await fetch(`${API}/agents/${AGENT_ID}`, { headers: H }));
const got = check?.conversation_config?.agent?.prompt?.tool_ids ?? [];
console.log(`✓ agent tool_ids now: [${got.join(', ')}]`);
console.log(got.includes(ORDER_TOOL_ID) ? '⚠ order tool STILL attached!' : '✓ place_phone_order detached (beta) — endpoint kept for later');
