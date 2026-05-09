Build a Remote Vital Monitoring Dashboard as a single self-contained HTML file.
No external dependencies except Google Fonts (Inter) and a Tabler Icons CDN.
All CSS and JS inline in one file. No frameworks. No React. Pure HTML/CSS/JS.

---

DESIGN SYSTEM

Page background: #F5F4F0
Card background: #FFFFFF
Border radius on all cards: 16px
Gap between cards: 6px
Font: Inter (import from Google Fonts)
No card box-shadows heavier than: 0 2px 8px rgba(0,0,0,0.05)
No colored card backgrounds — color lives only inside cards, never on the card itself
No gridlines, axes, tooltips, pie charts, or bar charts anywhere

Color tokens:
  --accent-navy: #1A3A6B
  --accent-coral: #D85A30
  --accent-teal: #1D9E75
  --accent-amber: #BA7517
  --text-primary: #1C1C1C
  --text-secondary: #888780
  --text-muted: #B4B2A9
  --bg-page: #F5F4F0
  --bg-card: #FFFFFF
  --bg-card-secondary: #F1EFE8

---

LAYOUT

Use CSS Grid. The dashboard fills 100vw x 100vh with padding: 20px. Grid gap: 6px.

Define this exact grid template:
- 4 columns: 200px 1fr 280px 200px
- 4 rows: 80px 220px 180px 70px

Place cards in these grid positions:

  HEADER:           col 1-5, row 1        (full width top bar)
  WEIGHT CARD:      col 1,   row 2
  STEPS CARD:       col 2,   row 2-3      (spans 2 rows, tall)
  HEART HERO:       col 3,   row 1-3      (spans 3 rows, the centerpiece)
  BODY MAP:         col 4,   row 1-3      (spans 3 rows, right side)
  FOOD CARD:        col 1,   row 3
  HEART CARD:       col 1,   row 4 (small organ status)
  LUNGS CARD:       col 2,   row 4 (small organ status)
  BLOOD CARD:       col 3,   row 4
  TEMP CARD:        col 3,   row 4 — adjust so blood/temp/hr fit row 4 col 3-4 as sub-grid
  SLEEP CARD:       col 1-5, row 5        (full width bottom strip)

You may adjust the sub-grid for row 4 to fit Blood Status, Temperature, Heart Rate as 3 equal cards side by side spanning col 1 to col 4.

---

HEADER CARD

Background: var(--bg-page), no card styling — blends into page.
Left side: Patient name "Arjun Mehta" in 18px font-weight 500, next to a 36px circle avatar with initials "AM" in --accent-navy background.
Center: App name "VitalWatch" in 13px --text-muted, letter-spacing 0.1em, uppercase.
Right side: Green pulsing dot (8px circle, background #1D9E75, box-shadow pulse animation 2s loop) + "Live" text in 13px --accent-teal + current date-time updating every second in 13px --text-secondary.

---

WEIGHT CARD (Type A — stat with bar)

Label: "WEIGHT" — 11px, letter-spacing 0.08em, --text-muted, top-left
Sub-label: "Lost 0.4 kg" — 12px, --accent-teal
Visual: A horizontal segmented bar (10 segments, 7 filled in --accent-navy, 3 empty in #E8E8E4), 6px tall, rounded ends, full card width, positioned vertically centered.
Number: "74.2" — 32px, font-weight 600, --text-primary. Unit "kg" — 13px, --text-secondary, baseline aligned.
Layout: label top-left, sub-label below it, bar in middle, number bottom-right.

---

FOOD CARD (Type A — stat with bar)

Same structure as Weight Card.
Label: "FOOD"
Sub-label: "254 / 1,342 kCal"
Bar: 10 segments, 2 filled in --accent-amber, 8 empty. Represents portion consumed.
Number: "253" — 32px. Unit "kCal" — 13px.

---

STEPS CARD (Type B — radial arc, tall)

Background: var(--bg-card)
Center of card: Large SVG radial arc.
  Arc: 220-degree sweep, starts bottom-left, ends bottom-right.
  Stroke width: 14px. Linecap: round.
  Background arc: #E8E8E4
  Foreground arc: --accent-navy, drawn with SVG stroke-dasharray/dashoffset animation that fills from 0 to 74.25% on load over 1200ms easeOut.
Inside arc center: "7,425" in 36px font-weight 600 --text-primary. Below it: "Steps" in 13px --text-secondary.
Below the arc: "10,000 Steps" in 11px --text-muted centered.
Label top-left: "DAILY STEPS" 11px muted uppercase.

---

HEART HERO CARD (Type C — centerpiece)

This is the largest card. Spans rows 1 through 3.
Background: var(--bg-card)
Content layout: vertically centered.

Top section:
  An SVG anatomical heart illustration — draw it in SVG using paths.
  The heart should be: coral/red toned (#C0392B base with #E74C3C highlights and #922B21 shadows),
  three-dimensional appearance using filled SVG paths with multiple color stops (no CSS gradients — use multiple layered SVG path fills at different opacities),
  roughly 160px wide x 160px tall,
  centered horizontally,
  slightly overflows the card top edge by 10px (use negative margin-top or overflow: visible on the card).

Bottom section (inside card, below heart):
  "Heart Rate" — 16px font-weight 500 --text-primary, left-aligned
  "124 bpm" — 13px --text-secondary, left-aligned below label
  Right side: A live ECG-style sparkline SVG (200px wide, 40px tall).
    Draw as a polyline with points that simulate an ECG waveform (flat baseline, sharp spike up, dip, recovery).
    Stroke: --accent-coral, 1.5px, no fill.
    Animate: The polyline scrolls left continuously using a CSS animation (translateX) at 3s linear infinite, creating a live monitor feel.

---

BODY MAP CARD

Tall narrow card, background: var(--bg-card-secondary).
Contains an SVG full-body anatomical silhouette — draw a simple human body outline in SVG (front view, gender-neutral, clean strokes).
Body outline stroke: #B4B2A9, fill: none, stroke-width: 1.5px.
Place 4 red pulsing dots (6px circles, --accent-coral, with a slow radial pulse animation 2s loop) at these body positions: chest (heart), throat, left knee, right shoulder.
These dots represent active monitoring sensor points.
No text inside this card. Pure visual.

---

HEART STATUS CARD + LUNGS STATUS CARD (Type C — small organ cards)

These sit side by side in the bottom row, each roughly 160px wide.
Each card contains:
  Top-left: diagonal arrow icon (use Tabler ti-arrow-up-right, 16px --text-muted)
  Center: A small organ SVG illustration (heart for one, lungs for the other) — 60px tall, simplified but 3D-toned using layered SVG paths.
  Bottom-left: Organ name "Heart" or "Lungs" — 15px font-weight 500 --text-primary
  Below name: Green dot (8px, #1D9E75) + "Normal" in 13px --accent-teal

---

BLOOD STATUS CARD, TEMPERATURE CARD, HEART RATE CARD (Type A — three equal stat cards in bottom row)

These three sit side by side spanning the remaining columns in the bottom stats row.
Each card is identical in structure:

  Top-left: icon + label
    Blood Status: ti-droplet icon, coral
    Temperature: ti-thermometer icon, amber
    Heart Rate: ti-heart-pulse icon, coral

  Sub-label below icon: reading value ("102/ml", "37°", "124 bpm") in 11px --text-muted

  Center: A mini visualization
    Blood Status: A vertical segmented bar (6 segments tall, 4 filled coral, 2 empty) + "102" in 28px bold --text-primary to the right + "ml" 12px unit
    Temperature: A flat horizontal line with a moving dot at the 37.1 position + "37.1°" in 28px bold --text-primary to the right
    Heart Rate: A tiny ECG sparkline (80px wide, 30px tall, same style as hero card but smaller) + "124" in 28px bold --text-primary to the right

---

SLEEP TIMELINE CARD (Type D — full width bottom strip)

Full width card, 70px tall, background: var(--bg-card).
Left: "SLEEP TIME" 11px muted uppercase label. Below: "7:30h" in 16px font-weight 500.
Right section (takes 70% of card width): A horizontal timeline track.
  Track: full width, 8px tall, background #E8E8E4, border-radius 4px.
  Filled region: from roughly 30% to 90% of the track width, filled with --accent-navy, border-radius 4px.
  Left thumb handle: pill-shaped (24px x 24px circle), white background, 1px border --accent-navy, positioned at start of fill.
  Right thumb handle: same style, positioned at end of fill.
  Left time label below left thumb: "00:30" in 11px --text-secondary
  Right time label below right thumb: "08:00" in 11px --accent-navy inside a small dark pill badge (background: #1A3A6B, color: white, padding: 2px 8px, border-radius: 10px, font-size: 11px)

---

ANIMATIONS

1. On page load, all cards fade up from 10px below with opacity 0 to 1, staggered 80ms per card using animation-delay.
2. Steps arc fills from 0 to current value over 1200ms with cubic-bezier(0.4, 0, 0.2, 1).
3. ECG sparkline in hero card scrolls left continuously at 3s linear infinite.
4. Live dot in header pulses: scale 1 to 1.4 to 1, box-shadow grows and fades, 2s loop.
5. Sensor dots on body map pulse: same radial pulse, staggered delays so they don't all pulse simultaneously.
6. Heart rate number in hero updates every 3 seconds to a value between 118–130 with a smooth count animation.

---

RESPONSIVE

Do not make this responsive. This is a fixed desktop dashboard designed for 1440px wide screens. Use fixed pixel column widths. Overflow: hidden on body.

---

OUTPUT

Return a single complete HTML file. All styles in a <style> tag in <head>. All JavaScript in a <script> tag before </body>. No comments in the code. No placeholder text — all data values must be realistic medical readings. The dashboard should look production-ready on first render.