#!/usr/bin/env node
// Renders Huebo's icons and social card into public/ from the app's own dial
// geometry and colour maths, so they always match what the page draws.
//
//   pnpm brand
//
// Writes public/favicon.svg, public/icon-192.png, public/icon-512.png,
// public/apple-touch-icon.png and public/og.png. Rerun it after changing the
// dial's colours or geometry, and commit the results.
import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'vite'

/** The hue the brand is shown at: a warm rose that reads on every feed. */
const BRAND_HUE = 340
const PICK = { brightness: 88, saturation: 62 }
const STEPS = [12, 25, 38, 50, 62, 75, 88, 100]
const PUBLIC = new URL('../../public/', import.meta.url)

const vite = await createServer({
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
})

const { STOPS, polar, segmentPath } = await vite.ssrLoadModule(
  '/src/picker/hue-dial/geometry.ts',
)

const { hsbToHex } = await vite.ssrLoadModule('/src/shared/color.ts')

await vite.close()

const ink = `hsl(${BRAND_HUE} 42.9% 14%)`
const tint = hsbToHex(BRAND_HUE, 12, 90)
const picked = hsbToHex(BRAND_HUE, PICK.saturation, PICK.brightness)

/** The ring: 72 hard-edged segments, notched every 45°, with the thumb on `hue`. */
function ring({ hue, inner, outer, notches, knobScale = 0.62 }) {
  const segments = STOPS.map(
    stop =>
      `<path d="${segmentPath(stop.hue, inner, outer)}" fill="${stop.color}"/>`,
  )

  const lines = notches
    ? STOPS.map((stop, index) => {
        const long = index % 9 === 0

        const from = polar(
          stop.hue - 2.5,
          long ? inner : outer - (outer - inner) * 0.35,
        )

        const to = polar(stop.hue - 2.5, outer)

        return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="rgb(255 255 255 / 0.6)" stroke-width="${long ? 2.4 : 1.2}"/>`
      })
    : []

  const thumb = polar(hue, (inner + outer) / 2)
  const knob = (outer - inner) * knobScale

  return [
    ...segments,
    ...lines,
    `<circle cx="${thumb.x}" cy="${thumb.y}" r="${knob}" fill="${ink}"/>`,
    `<circle cx="${thumb.x}" cy="${thumb.y}" r="${knob * 0.84}" fill="${hsbToHex(hue, 85, 92)}" stroke="#fff" stroke-width="${knob * 0.16}"/>`,
  ].join('')
}

/** The 8×8 grid for `hue`, `size` wide and centred on (0, 0), with the pick raised. */
function grid({ hue, size }) {
  const cell = size / 8
  const gap = cell * 0.12
  const start = -size / 2

  return STEPS.flatMap((brightness, row) =>
    STEPS.map((saturation, column) => {
      const isPick =
        saturation === PICK.saturation && brightness === PICK.brightness

      const x = start + column * cell + gap / 2
      const y = start + (STEPS.length - 1 - row) * cell + gap / 2
      const side = cell - gap
      const square = `<rect x="${x}" y="${y}" width="${side}" height="${side}" rx="${cell * 0.18}" fill="${hsbToHex(hue, saturation, brightness)}"/>`

      return isPick
        ? `<rect x="${x - gap}" y="${y - gap}" width="${side + gap * 2}" height="${side + gap * 2}" rx="${cell * 0.26}" fill="#fff"/>${square}`
        : square
    }),
  ).join('')
}

function iconSvg({ background }) {
  const body = `${ring({ hue: BRAND_HUE, inner: 30, outer: 46, notches: false, knobScale: 0.5 })}<rect x="-15" y="-15" width="30" height="30" rx="7" fill="${picked}"/>`

  const plate = background
    ? `<rect x="-50" y="-50" width="100" height="100" fill="${tint}"/>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100">${plate}${body}</svg>`
}

async function card() {
  const font = (
    await readFile(
      new URL(
        '../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
        import.meta.url,
      ),
    )
  ).toString('base64')

  return `<!doctype html><html><head><style>
    @font-face { font-family: Bricolage; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 200 800; }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; background: ${tint}; color: ${ink}; font-family: Bricolage, sans-serif; position: relative; }
    .copy { position: absolute; left: 84px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 28px; width: 520px; }
    h1 { font-size: 148px; font-weight: 800; letter-spacing: -0.035em; line-height: 0.9; }
    p { font-size: 56px; font-weight: 600; line-height: 1.15; letter-spacing: -0.01em; }
    .chip { display: inline-flex; align-items: center; gap: 14px; align-self: flex-start; padding: 12px 22px 12px 12px; border-radius: 999px; background: rgb(255 255 255 / 0.74); font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .chip i { width: 40px; height: 40px; border-radius: 999px; background: ${picked}; }
    .chip span { opacity: 0.6; font-weight: 600; }
    svg { position: absolute; right: -40px; top: 50%; width: 640px; height: 640px; transform: translateY(-50%); }
  </style></head><body>
    <div class="copy">
      <h1>Huebo</h1>
      <p>Dial it in.</p>
      <div class="chip"><i></i>${picked}<span>HSB · RGB · Hex</span></div>
    </div>
    <svg viewBox="-110 -110 220 220">${ring({ hue: BRAND_HUE, inner: 76, outer: 100, notches: true })}${grid({ hue: BRAND_HUE, size: 104 })}</svg>
  </body></html>`
}

const browser = await chromium.launch()
const page = await browser.newPage()

async function shoot(html, { height, name, width }) {
  await page.setViewportSize({ height, width })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: new URL(name, PUBLIC).pathname })
}

const square = svg =>
  `<!doctype html><style>*{margin:0}body{width:100vw;height:100vh}svg{display:block;width:100%;height:100%}</style>${svg}`

const icon = square(iconSvg({ background: true }))

await writeFile(
  new URL('favicon.svg', PUBLIC),
  `${iconSvg({ background: false })}\n`,
)

const shots = [
  { height: 180, html: icon, name: 'apple-touch-icon.png', width: 180 },
  { height: 192, html: icon, name: 'icon-192.png', width: 192 },
  { height: 512, html: icon, name: 'icon-512.png', width: 512 },
  { height: 630, html: await card(), name: 'og.png', width: 1200 },
]

for (const { html, ...shot } of shots) {
  await shoot(html, shot)
}

await browser.close()

console.log(
  'Wrote favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png and og.png to public/',
)
