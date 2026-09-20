# Welcome cards — `/stats/cards`

Prints a table tent for every **confirmed** reservation of a chosen day, so the
team can set the table with the guest's name on it before they walk in.

Reads the same records the Control Room's Confirm button writes — the
`aileen-reservations` blob, via `/api/owner/data` — not the notification
emails. Same data, one hop shorter, and it works offline of any inbox.

## What to call a party

The question the card has to answer is what to write when we know exactly who
booked and nothing about who they are bringing. `lib/guestCards.ts` settles it:

| Booking | Card reads |
| --- | --- |
| 2+ guests, first + last | `John Smith & Party` |
| 2+ guests, first only | `John & Party` |
| 1 guest | `John Smith` |
| no name on file | `Reserved` |

`& Party` is the house convention: it is never wrong and never presumes a
relationship — a card guessing "& Family" in front of a business dinner is
worse than no card at all. Every name is editable in the UI before printing,
and `+ เพิ่มการ์ดเอง` adds a card for a phone booking that never reached the
system.

`occasionLine()` lifts a birthday / anniversary / graduation out of the booking
notes (English or Thai) and prints a line for it — but stays silent when the
note *asks* us not to mark it ("no birthday song please").

`todayInLA()` asks `America/Los_Angeles` for the date. Never the device clock:
the server runs UTC and the page may be open on a phone in another zone, either
of which would show an evening service tomorrow's book.

## Sheet geometry — do not "simplify" this

A tent's fold has to become the **top ridge**, so one blank is `W` wide by `2H`
tall and folds at its waist. Two blanks side by side on **Letter landscape
(11 × 8.5in)** give `W = 5.5`, `H = 4.25` — a **5.5 × 4.25in** tent, wider than
tall, which stands without tipping.

The same two-up on portrait yields 4.25 × 5.5in: tall, narrow, and it falls
over. Landscape is the whole reason the numbers are what they are.

```
        11in  ───────────────────────────────
      ┌──────────────────┬──────────────────┐
      │  face B (180°)   │  face B (180°)   │   ← becomes the far side
 8.5in├ ─ ─ ─ fold ─ ─ ─ ┼ ─ ─ ─ fold ─ ─ ─ ┤   y = 4.25in
      │  face A          │  face A          │   ← faces the guest
      └──────────────────┴──────────────────┘
                         ↑ cut, x = 5.5in
```

Both faces of a tent carry the same name so it reads from either side of the
table. The face above the fold is rotated 180° so it lands upright once folded.
The cut line ends up as a trimmed edge and the fold line inside the crease, so
both guides can print at full strength.

Cards are **white-ground with navy and brass ink** — no full-bleed fill. The
shop Epson is not borderless on plain stock, and this is far lighter on ink.

`nameSize()` steps the type down by length (34 / 29 / 24 / 20pt) and long names
wrap to a second line.

## Printing

Browser print dialog straight to the shop printer: **Epson ET-16650 · Letter ·
landscape · scale 100% · headers and footers off**. Then one cut down the
middle and one fold per half. Stock of 65–110 lb (176–300 gsm) stands up; copy
paper flops.

`@page { size: 11in 8.5in; margin: 0 }` pins the sheet. The sheets are
duplicated into a `createPortal` at `document.body` and print CSS hides every
other body child, which keeps the nav, promo pop-up and Aileen widget out of the
printed document. (The `visibility: hidden` trick leaves blank pages behind —
it was tried and rejected.)

## Gotchas

- Use `/images/logo-mark-print.png` (457 × 260, trimmed from the 4k master).
  `/images/logo-mark.png` is 96 × 55 and turns to mush on paper.
- The narwhal mark carries its own gold wave, so the brass hairline needs
  `margin-top: 0.19in` or the two collide.
- Both Control Room pages need
  `padding: calc(var(--cs-ticker-h, 0px) + 96px) …` at the top — the nav is
  `position: fixed` at `top: var(--cs-ticker-h)` and 72px tall.

## Testing the logic

`lib/guestCards.ts` is pure string work with no imports, so it tests standalone:

```bash
./node_modules/.bin/tsc lib/guestCards.ts --target es2020 --module commonjs \
  --outDir /tmp/gc --skipLibCheck
node -e "const g=require('/tmp/gc/guestCards.js'); console.log(g.partyName('john','smith','4 Guests'))"
```

## Not built yet

Hands-free printing: a watcher on the shop PC that polls `/api/owner/data` each
morning and sends the day's sheet to the printer with nobody clicking. The API
already accepts `Authorization: Bearer $HQ_GAME_TOKEN`, so it needs no cookie.
