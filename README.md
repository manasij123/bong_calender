# বাংলা পঞ্জিকা — Bengali Panjika

A Bengali (Bangla) calendar app — web and desktop — showing the Bengali year,
month and date alongside tithi, nakshatra, yoga, karana, পূজা-পার্বণ
(festivals) and holidays, with a toggle between the Bengali and English
(Gregorian) calendar.

## What's inside

This is an npm-workspaces monorepo:

- **`packages/panjika-core`** — the calendar engine, in TypeScript, with no UI
  dependencies:
  - Sun & Moon geocentric ecliptic longitude (Jean Meeus, *Astronomical
    Algorithms*, low-precision solar theory + the full ELP2000-82B
    truncated lunar series — accurate to about 1 arcsecond in longitude).
  - Lahiri (Chitrapaksha) ayanamsa for sidereal positions.
  - Tithi, nakshatra, yoga, karana (the five limbs of the panchang).
  - Gregorian ⇄ Bengali date conversion, West Bengal / traditional Panjika
    style: months are solar (sankranti-based) with lengths that vary
    slightly year to year, rather than a fixed 30/31-day rule.
  - A festival rule engine — most Bengali Hindu festivals are derived from
    a tithi falling inside a specific solar month (the same way a printed
    panjika derives them), so they stay correct for any year, plus a
    curated set of fixed Gregorian/national holidays.
  - Rahu Kalam / Yamaganda / Gulika Kalam windows and a few traditional
    tithi-based auspiciousness hints.
- **`apps/web`** — the React + Vite + Tailwind web app.
- **`apps/desktop`** — a Tauri (Rust) shell that wraps the same web app for
  a native Windows/macOS/Linux desktop build.

## A note on accuracy

Tithi/nakshatra/yoga/karana are computed from modern astronomical positions
and have been checked against known reference dates (full moon, new moon,
Ekadashi). The Bengali month **start dates (sankranti)**, however, are
inherently sensitive to which ayanamsa / traditional convention is used —
this is exactly why different printed panjikas (Vishuddha Siddhanta, Gupta
Press, Bangladesh's reformed calendar, etc.) sometimes disagree with each
other by a day or two around a sankranti. This app uses the well-documented
modern Lahiri ayanamsa with true (apparent) solar/lunar positions; treat
sankranti-adjacent dates as "usually correct, occasionally a day off from
your particular family panjika," the same caveat that applies between any
two printed panjikas.

## Getting started

```bash
npm install
npm run build       # builds panjika-core, then the web app
npm run dev          # starts the web app dev server (http://localhost:5173)
```

### Desktop app (Tauri)

Requires the Rust toolchain (https://rustup.rs) and, on Linux, WebKitGTK +
GTK3 dev packages (`libwebkit2gtk-4.1-dev libgtk-3-dev librsvg2-dev
libssl-dev libayatana-appindicator3-dev` on Debian/Ubuntu). Windows and
macOS just need their standard build tools (Tauri uses the OS's built-in
WebView2 / WKWebView).

```bash
npm run desktop:dev     # launch the desktop app in dev mode
npm run desktop:build   # produce a native installer/bundle
```

The bundled icons under `apps/desktop/src-tauri/icons` are a simple
placeholder; regenerate proper multi-format icons (including `.icns`/`.ico`
for macOS/Windows) from a source image with `npx tauri icon <path-to-image>`
inside `apps/desktop` before shipping a production build.

## Project structure

```
packages/panjika-core/   # calendar + astronomy engine (TypeScript library)
apps/web/                # React web app
apps/desktop/            # Tauri desktop shell
```
