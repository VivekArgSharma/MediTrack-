You are fixing an existing Remote Vital Monitoring Dashboard HTML file.
Do NOT rewrite from scratch — identify and surgically fix the following issues only.

---

ISSUE 1 — DUPLICATE HEART RATE
Heart Rate appears as both a mid-section standalone card AND as one of the three
bottom stat cards. Remove the standalone mid-section Heart Rate card entirely.
The only Heart Rate display should be in the bottom row alongside Blood Status
and Temperature as one of the three equal stat cards.

---

ISSUE 2 — BOTTOM ROW STAT CARDS: GRAPHS ARE TOO LARGE
In the three bottom stat cards (Blood Status, Temperature, Heart Rate), the line
charts are rendering too large and overflowing the card boundaries.

Fix:
- Each chart canvas or SVG must be constrained to exactly: width 100%, height 60px max
- Set overflow: hidden on each card
- The chart should occupy only the bottom half of the card
- Top half of each card: icon + label + sub-reading (e.g. "94/100", "37°", "70 bpm")
- Bottom half: the small sparkline/line chart clipped within the card bounds
- Do NOT let the chart overflow or push card height beyond 160px

---

ISSUE 3 — MISSING STEPS RADIAL ARC CARD
There is no Steps card in the current render. Add it back.

Placement: Second column, spanning rows 2 and 3 (tall card).
Specs:
- Large SVG radial arc, 220-degree sweep, stroke-width 14px, rounded linecaps
- Background arc: #E8E8E4
- Foreground arc: #1A3A6B, filled to 74.25% of sweep
- Animate arc fill from 0 to 74.25% on load over 1200ms cubic-bezier(0.4,0,0.2,1)
- Inside arc center: "7,425" in 36px font-weight 600, color #1C1C1C
- Below that number inside arc: "Steps" in 13px color #888780
- Below entire arc: "10,000 Steps" in 11px #B4B2A9 centered
- Top-left of card: "DAILY STEPS" in 11px letter-spacing 0.08em #B4B2A9

---

ISSUE 4 — MISSING BODY MAP CARD
The anatomical body silhouette card is not rendering. Add it back.

Placement: Fourth column, spanning all main rows (tall, full-height right panel).
Specs:
- Background: #F1EFE8
- SVG full-body human silhouette, front view, gender-neutral
- Outline only: stroke #B4B2A9, stroke-width 1.5px, fill none
- Scale SVG to fill 80% of card height, centered horizontally
- Place 4 pulsing dots (radius 5px, fill #D85A30) at these relative SVG positions:
    chest center (heart), throat/neck, left knee, right shoulder
- Each dot has a radial pulse animation: a second circle scales from 1 to 2 and fades
  out over 2s, looping infinitely, with staggered animation-delay (0s, 0.5s, 1s, 1.5s)
- No text inside this card

---

ISSUE 5 — HEART ORGAN CARD IS CROPPED
The Heart organ status card in the bottom-left is being clipped/cut off.

Fix:
- Set min-height: 160px on this card
- Set overflow: visible so the organ illustration is not clipped
- Ensure the card sits fully within the grid row and does not bleed outside the
  dashboard boundary
- Content: small heart SVG illustration (~60px), "Heart" label 15px font-weight 500,
  green dot + "Normal" in #1D9E75 13px below

---

ISSUE 6 — SLEEP TIMELINE NOT RENDERING
The sleep card shows only text. The visual track is missing or invisible.

Fix — rebuild the sleep timeline bar:
- Full-width horizontal track: height 8px, background #E8E8E4, border-radius 4px
- Filled region: left 10% to right 80% of track width, background #1A3A6B, border-radius 4px
- Left thumb: 24px circle, background white, border 1.5px solid #1A3A6B, 
  position absolute at left edge of fill
- Right thumb: same style, position absolute at right edge of fill
- Below left thumb: "00:30" in 11px #888780
- Below right thumb: pill badge — background #1A3A6B, color white, 
  font-size 11px, padding 3px 10px, border-radius 10px, text "02:03 PM – 02:04 PM"
- The entire track section takes the right 70% of the card width
- Left 30% of card: "SLEEP TIME" in 11px #B4B2A9 uppercase + "7:30h" in 16px 
  font-weight 500 #1C1C1C below it

---

ISSUE 7 — PATIENT ACTIVITY CARD REPLACE
The current "Patient Activity / Therapy" card does not match the design spec.
Replace it entirely with the correct Weight Card.

Weight Card specs:
- Top-left: "WEIGHT" 11px letter-spacing 0.08em #B4B2A9
- Below label: "Lost 0.4 kg" 12px #1D9E75
- Segmented bar: 10 segments in a row, each 8px tall, 4px gap between segments,
  border-radius 3px on each segment. 7 segments filled #1A3A6B, 3 segments #E8E8E4
  Full bar spans card width minus padding.
- Bottom-right: "74.2" in 32px font-weight 600 #1C1C1C + "kg" in 13px #888780
  baseline aligned next to number

---

ISSUE 8 — HEADER FIX
Current header shows "Fallback" text and is not styled correctly.

Fix:
- Left side: 36px circle with initials "AM" — background #1A3A6B, color white,
  font-size 14px font-weight 500 — next to "Arjun Mehta" in 18px font-weight 500
- Center: "VITALWATCH" in 13px #B4B2A9 letter-spacing 0.12em (or remove if
  centering is broken)
- Right side: 
    Green pulsing dot: 8px circle background #1D9E75, with keyframe animation
    pulseDot that goes box-shadow 0 0 0 0 rgba(29,158,117,0.4) → 
    box-shadow 0 0 0 8px rgba(29,158,117,0) over 2s infinite
    Next to dot: "Live" in 13px #1D9E75
    Then: current time updating every second via JS setInterval in 13px #888780

---

ISSUE 9 — GRID LAYOUT ALIGNMENT
The cards are not respecting the 4-column layout. Fix the grid:

Set on the main grid container:
  display: grid;
  grid-template-columns: 220px 1fr 1fr 220px;
  grid-template-rows: 70px 200px 160px 170px 80px;
  gap: 6px;
  padding: 20px;
  height: 100vh;
  box-sizing: border-box;

Assign grid-area / grid-column / grid-row explicitly to each card:
  Header:         grid-column: 1 / 5;  grid-row: 1
  Weight card:    grid-column: 1;      grid-row: 2
  Steps card:     grid-column: 2;      grid-row: 2 / 4
  Heart hero:     grid-column: 3;      grid-row: 1 / 4
  Body map:       grid-column: 4;      grid-row: 1 / 4
  Food card:      grid-column: 1;      grid-row: 3
  Bottom organs:  grid-column: 1 / 3;  grid-row: 4   (Heart + Lungs side by side subgrid)
  Bottom stats:   grid-column: 3 / 5;  grid-row: 4   (Blood + Temp + HR side by side subgrid)
  Sleep:          grid-column: 1 / 5;  grid-row: 5

For the bottom organs row, use a nested grid: display grid, grid-template-columns: 1fr 1fr, gap 6px
For the bottom stats row, use a nested grid: display grid, grid-template-columns: 1fr 1fr 1fr, gap 6px

---

GLOBAL RULES TO MAINTAIN

- All cards: background #FFFFFF, border-radius 16px, overflow hidden (except organ cards where illustration bleeds — set overflow: visible selectively)
- Page background: #F5F4F0
- No card box-shadow heavier than 0 2px 8px rgba(0,0,0,0.05)
- No duplicate metrics — each vital appears exactly once
- All card content must be fully visible and not clipped by card boundaries
- Output the complete fixed HTML file, single file, no external dependencies 
  except Google Fonts Inter and Tabler Icons CDN