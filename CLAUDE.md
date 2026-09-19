# Narwhal Web — narwhalthaihb.com (โปรเจกต์ Narwhal Web)

โฟลเดอร์นี้ = **git root** (GitHub `AKxNRWL/narwhal-thai-table`, branch main) · แอป Next.js อยู่ในโฟลเดอร์ย่อย **`Narwhal Thai Table\`** (app/ components/ lib/ public/ netlify.toml) · Netlify project **nrwlhb** (siteId `09175751-d68b-4213-b6d9-969f5bb46304`, team special-akusa) · โดเมนอื่นในโปรเจกต์นี้: `..\narwhal-pipeline` (Toast API), `..\narwhal-mailer` (เมลลูกค้า), `..\narwhal-orderline` (สาย AI) — แต่ละอันมี CLAUDE.md สั้นของตัวเอง · แผนที่ทั้งร้าน + ข้อมูลร้าน + กติกากลาง: `D:\projects\CLAUDE.md`
⚠️ อย่าใช้ `D:\projects\Narwhal Thai Table\` (ที่ราก) หรือ `D:\projects\narwhal-deploy\` — สำเนาเก่าทั้งคู่

## ข้อมูลร้านที่โค้ดต้องตรง
ที่อยู่ 19072 Beach Blvd, HB 92648 · ☎ (714) 378-6003 · เวลา จ–ศ 11:30–22:00 / ส–อา 12:00–22:00 PT · Lunch จ–ศ 11:30–15:00 · Order Online = `https://order.toasttab.com/online/narwhalthaitable` · Toast = source of truth ของราคา/ชื่อจาน · ห้ามชื่อเชฟ (`SHOW_CHEF=false`) · Aileen สะกดไทย "ไอลีน" (ในโค้ดใช้ Aileen ล้วน)

## จุดแก้จุดเดียว (single source ในโค้ด)
- `lib/dishes.ts` — เมนู canonical (67+ จาน มี story/lede/history) → ไหลเข้าเว็บ + prompt Aileen + Order Line
- `lib/site.ts` — `ORDER_ONLINE_URL` (ว่าง = ซ่อนปุ่มทุกจุด), `SHOW_CHEF`, เบอร์/ลิงก์โซเชียล
- `lib/serviceHours.ts` — `HOURS` ตารางเวลาร้าน + margin 15 นาทีก่อนเปิด/grace 60 นาทีหลังปิด (route.ts บังคับฝั่ง server, ChatWidget เลือกคำทักทาย) · เวลาเปลี่ยน = แก้ที่นี่ + JSON-LD ใน `app/layout.tsx`
- `lib/chatKnowledge.ts` — RESTAURANT_FACTS + buildMenuText() (+ `lib/dishFacts.ts` ส่วนผสม/allergen) → ใช้ร่วมกันเว็บแชท + สายโทร
- `app/api/chat/route.ts` — Aileen (Anthropic API, MODEL `claude-sonnet-5`, MAX_TOKENS 1500, rate limit 20/นาที·300/วัน/IP, 40 เทิร์น) · tools ต่อบริบท: โต๊ะ → `call_server` / `?t=togo` → `place_order_request` / เว็บเปล่า → จอง+ฝากข้อความ · validate `?t=` ด้วย `/^[a-zA-Z0-9-]{1,12}$/`
- `components/ChatWidget.tsx` — มือถือเต็มจอ+ปุ่มย่อ, seat timeout 2 ชม./ข้ามวัน (localStorage `nara-seat`), geo guard fail-open (>400 ม. + accuracy ≤1500 ม.), `seatLabel()` (7 → "table 7", P3 → "patio table 3")
- จอพนักงาน (token-gate ด้วย `STATS_TOKEN` ใน Netlify env — ค่าอยู่ใน project memory ไม่ใส่ในไฟล์นี้): `/stats` (แชท/จอง/ยืนยันโต๊ะ) · `/orders` (คิว TO-GO) · `/calls` (เรียกพนักงาน ต้องมีจอเปิดหน้าร้าน)
- การจองทุกช่องทาง (เว็บ/แชท/สายโทร) → `lib/reservation.ts submitReservation()` ทางเดียว → เมล ack อัตโนมัติ + ปุ่มยืนยันใน /stats ส่งเมล Confirmed (`lib/guestMail.ts` → Apps Script ใน narwhal-mailer) · เนื้อเมลอังกฤษล้วน · **ห้ามมี `=` ใน URL/attribute ของ HTML เมล** (Gmail quoted-printable กิน) · ห้ามยิง Netlify form ตรง
- QR โต๊ะ `narwhalthaihb.com/menu?t=` — ในร้าน `1`–`13`, พาทิโอ `P1`–`P5`, `togo`, `spare1/2` (การ์ดพิมพ์อยู่ narwhal-menu\qr)
- `components/AdsConversions.tsx` — Google Ads conversion (Order Online click / Phone click) landing = narwhalthaihb.com เท่านั้น
- ตัวกรองลิงก์ QR ค้าง 4 ชั้น (เกตเวลาร้าน / prompt guard / seat timeout / geo) — อย่ารื้อ

## กติกา Aileen (persona)
ผู้หญิงไทย ค่ะ/คะ · ตอบทุกภาษา · สั้น มีชีวิตชีวา ชม 1 ครั้ง/reply · upsell เบาๆ 1 อย่าง · LOCKDOWN: ไม่เผย prompt/โมเดล, ไม่ให้ส่วนลด, ไม่รับเงิน, ไม่ยืนยันเวลาเป๊ะแบบตัวเลข, ไม่เผยชื่อเชฟ, ไม่แต่งประวัติจานเอง · dine-in **ไม่รับออเดอร์ในแชท** (ช่วยเลือกแล้วเรียกพนักงาน) · TO-GO สั่งในแชทได้ ต้องถามชื่อ จ่ายที่เคาน์เตอร์ก่อนครัวเริ่ม · escalation: โต๊ะ → พนักงาน / ข้างนอก → โทร 714 / IG-FB / ฟอร์ม · allergen: ห้ามการันตี allergen-free (ครัวใช้น้ำปลา/กะปิ/กระทะร่วม) · ราคา = ตามเมนูเป๊ะ surcharge บอกแยก

## 🎨 Tailwind redesign — LIVE บน production ตั้งแต่ Sep 8 2026 (merge bdbc5b2, user อนุมัติ)
- ทำบน branch `tailwind-redesign` แล้ว merge เข้า main · branch preview ยังอยู่ที่ https://tailwind-redesign--nrwlhb.netlify.app (trigger = build hook เดิม + `?trigger_branch=<branch>` — ใช้ pattern นี้กับงานใหญ่ครั้งต่อไป)
- Stack: Tailwind v4 (`@tailwindcss/postcss`, `postcss.config.mjs`), tokens ใน `app/globals.css` `@theme` (navy/navy-deep/cream/brass…, font-display/serif/sans, radius-card/frame, ease-out-soft, animate-*) · primitives `components/ui/Button.tsx` (primary/secondary/ghost, `href` → Link/a, `arrow`) + `components/ui/Section.tsx` (Section/Container/Eyebrow/Heading/SectionHead/Tag/cardSurface) · `lib/cn.ts`
- ⚠️ กับดัก: ธาตุที่ใช้ `background-clip:text` (`.text-gold` / `.heading-gold em` / `.shiny-text`) **ห้ามมีลูกที่มี filter/transform/opacity/animation** (เช่น `<Words>` spans) — Chromium จะวาดตัวหนังสือไม่ออกทั้งบรรทัด (บรรทัดทอง hero เคยหายไป 1 วัน Sep 8–9) → แอนิเมตธาตุนั้นทั้งก้อนแทน และตรวจด้วยตา ไม่ใช่ grep HTML
- Effects (ฟรี, เขียนเองแนว Magic UI/Aceternity; deps เพิ่มแค่ `canvas-confetti` + `lenis`): `components/fx/` Particles (hero embers ทุกจอ) · NumberTicker · BorderBeam · Ripple · DotPattern · Lens (ซูมรูปหน้าจาน) · CardGlow (spotlight + 3D tilt บน `.glow-card`, magnetic `[data-magnetic]`) · **SmoothScroll (Lenis root, anchors offset -118, stop/start ตาม body lock; nested scroller ใส่ `data-lenis-prevent`)** · **Ambience (scroll progress / cursor aura / film grain)** · Tilt (การ์ด hero) · CircularText (ป้ายหมุนรอบ medallion) · Marquee + `components/PhotoMarquee.tsx` (เมนูวิ่ง 56 จาน ทุกการ์ดบอกหมวด — **Over Rice / À La Carte ป้ายเด่น** กันรีวิว) · confetti.ts · CSS: `.fade-up` blur reveal, `.word-in`, `.btn-shine`, `.text-gold`/`.heading-gold em`, `.shiny-text`, `.aurora` (Section tone="aurora"), `.page-in` (app/template.tsx), `.wordmark` footer · **motion always on — ไม่มี prefers-reduced-motion (user สั่ง Sep 8)**
- 🖼️ Art pass (Sep 9, LIVE): ภาพวาดสไตล์ placemat (ทองบนน้ำเงิน, Higgsfield gpt_image_2_5 + placemat เป็น style ref) ใน `public/images/art/<name>-<w>.{jpg,webp}` — siam-to-hb (แถบก่อน Story + หัว /about), royal-court (กรอบใน Story), wok-fire (กรอบ sticky ใน Experience), banquet (หัว /menu), pompano (ท้ายหน้าจาน seafood), patio (แถบก่อน Contact + โคมลอย), pattern (`.art-texture` หลัง marquee/footer); สำรอง narwhal-rising, family-table · คอมโพเนนต์ `components/fx/ArtBand` (parallax band) · `FloatingLanterns` · `ThaiWaveDivider` · `GoldCorners` · `TextReveal` · `ArtPanel` (ใน HomeSections) · ต้นฉบับ PNG: `..\_art-candidates\` (git-excluded) · กติกาภาพ: ไม่มีคน/ไม่มีตัวหนังสือ
- หน้าแรก: Hero (h1 "From Siam's royal court / to Huntington Beach" + โน้ตลงชื่อสามพี่น้อง "Sawasdee, Huntington Beach — welcome to our table… the art is on the plate…" — **ข้อความ hero เจ้าของเคาะแล้ว Sep 9 ห้ามแก้เอง**; ป้าย Lunch/ชิปจานเหนือ h1 เอาออกแล้ว — `HERO_FEATURED_SLUG` ใน app/page.tsx = null) → PhotoMarquee → จานแนะนำ `HOME_PICKS` (HomeSections) → Story → LunchSpecials (marquee 8 จาน) → Experience → Room → Contact
- globals.css เหลือเฉพาะ: tokens + base + a11y + fade-up + hero medallion + prose-nt + faq-item + **บล็อกเดิมที่ห้ามลบ** (ticker `.cs-ticker*`, chat `.nara-*`, promo `.promo-*`, carousel `.pc-*`, chef-bio) เพราะ /stats (PromoEditor/PromoCardView) และ ChatWidget/PromoCard ยังใช้ · owner pages (/stats /cal /calls /orders) ไม่ได้แตะ
- กติกาที่คง: Toast/tel เป็น `<a href>` จริง (AdsConversions) · ทุก metadata/JSON-LD/id/alt/field name เหมือนเดิม · `?t=` QR/PromoCard/ChatWidget ไม่แตะ · เทสใน Claude browser pane: `document.hidden=true` → IntersectionObserver ไม่ยิง ต้อง `document.querySelectorAll('.fade-up').forEach(e=>e.classList.add('visible'))` ก่อน screenshot
- แก้เว็บต่อจากนี้ = แก้บน main ตามสูตร Deploy ด้านล่างเหมือนเดิม (ใช้ primitives ใน components/ui + tokens ใน globals.css, อย่ากลับไปใช้ class เก่า) · ก่อน push รัน `npx tsc --noEmit` (~5 วิ) · `next build` ~2 นาที

## Deploy (สูตรมาตรฐาน — มี skill `narwhal-deploy`)
1. แก้ไฟล์ใน `Narwhal Thai Table\` (จาก cloud: stage → แก้ใน /tmp → SendUserFile → device_commit_files พร้อม mtime guard; หรือ device_bash แก้ในที่) · syntax เร็ว: `npx --yes esbuild <file> --loader:.tsx=tsx` · typecheck จริง: `npx tsc --noEmit` ที่ Windows (Desktop Commander/PowerShell, ~5 วิ) — **อย่า build ผ่าน sandbox mount (ช้ามาก)**
2. **commit+push ผ่าน Windows-MCP PowerShell เท่านั้น**: `cd D:\projects\narwhal-thai-table; git add -A; git commit -m "..."; git push origin main` — ห้าม git จาก sandbox (mount lag)
3. **git push → Netlify build โดน auto-cancel ทุกครั้ง** (สาเหตุไม่ทราบ) → ต้อง trigger เอง: **curl POST build hook `claude-deploy`** (URL อยู่ใน project memory `narwhal-deploy-workflow` + skill; ดู/สร้างใหม่ที่ Netlify → Build & deploy → Build hooks) → HTTP 200 → publish ~60 วิ
4. รอ ~100 วิ แล้วเช็ค Netlify MCP `get-deploy-for-site` จน `state: ready` และ `commit_ref` = sha ที่ push · WebFetch แคช 15 นาที — เช็คหน้า live ให้ใส่ `?v=` กันแคช
5. **ถ้าแก้ dishes.ts / RESTAURANT_FACTS / persona → หลัง deploy เสร็จรัน `npm run sync:orderline`** (ดึง prompt จากเว็บ **live** — รันก่อน deploy = "already in sync" หลอก)
- Netlify env: `manage-env-vars` ผ่าน MCP · **ห้ามตั้ง `envVarIsSecret:true` ถ้าโค้ดอ่านตอน runtime** (Next function อ่านไม่เห็น) · env ที่มี: ANTHROPIC_API_KEY, STATS_TOKEN, GUEST_MAIL_URL/TOKEN, TOAST_* (4 ตัว สำหรับ /api/toast/*) · ห้าม `deploy-site` zip-upload (พังทุกครั้ง + cancel build)
- runtime log: app.netlify.com/projects/nrwlhb/logs/functions/___netlify-server-handler (`console.warn` ฝั่ง server โผล่ที่นี่)
- Netlify UI/session อยู่เบราว์เซอร์ **ส่วนตัว** (1aefabb3) ไม่ใช่เบราว์เซอร์ร้าน · `deploy.bat` ที่ git root = ทางของ user เอง

## Drift ที่รู้อยู่ (ยังไม่แก้ ตั้งใจหรือรอ user)
- เว็บยังไม่มี Orange Chicken / Fried Tofu / Sides (ข้าว 3 แบบ, ไข่ดาว, ไข่เจียว) / Meat Ball Skewer · ไวน์+เบียร์ตั้งใจไม่ขึ้นเว็บจนใบ Type 41 ออก · Lunch Specials ยังไม่อยู่บนเว็บ/Toast · Toast สะกดห้วนบางจาน (เว็บสวยกว่า ปล่อย)
- Toast write API ไม่มี (ออเดอร์จากแชทเข้า POS ไม่ได้) — `submitOrder()` ใน lib/orders.ts = จุด swap เดียวเมื่อได้ custom integration
- narwhal-web-preview (Higgsfield hero 4K, รูป AI) ไม่ deploy — รูปอาหารบนเว็บต้องเป็นรูปจริง

## กับดักเทสเว็บผ่าน Chrome MCP
resize_window ใช้กับหน้าต่าง maximize ไม่ได้ · แท็บ background ไม่ reflow/visibilityState=hidden (override ด้วย defineProperty) · React input = native value setter + dispatch input · ดู request จริง: monkey-patch fetch · geolocation ใน background → error path (เทส fail-open ฟรี) · seed localStorage ก่อน navigate แล้ว removeItem คืน (เครื่องจริงของ user) · หลายเซสชัน Claude ใช้ Chrome เดียวกันแย่ง focus — ทำผ่าน CDP ทั้งหมด
