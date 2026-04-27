# FlipClock

A minimalist flip-card clock that reads your machine's local time and renders it
as large, animated hours and minutes — inspired by [flipclocker.com](https://flipclocker.com).

![FlipClock](https://img.shields.io/badge/runs%20on-Chrome%20103%2B-blue) ![macOS](https://img.shields.io/badge/macOS-El%20Capitan%2B-lightgrey)

## Run it

The simplest way — just open `index.html` directly in your browser:

```bash
open index.html
```

Everything (HTML, CSS, JS) is inlined into that single file, so it works without
a server.

If you'd rather edit the split-file version (`styles.css` + `script.js`), serve
the directory with any static HTTP server so the relative paths resolve:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Browser support

Targets **Chrome 103+** on **macOS El Capitan** and newer. Uses only
long-supported features:

- ES5 syntax (IIFE, `var`) — no modules, no top-level `await`
- `transform: rotateX()`, `perspective`, `backface-visibility` for the 3D flip
- `padStart()` for zero-padded digits

No build step, no dependencies, no external fonts.

## Files

| File | Role |
| --- | --- |
| `index.html` | Self-contained build with CSS and JS inlined. **This is what the demo renders.** |
| `styles.css` | Split-file version of the styles (reference / for editing). |
| `script.js` | Split-file version of the clock logic (reference / for editing). |

`styles.css` and `script.js` are not loaded by `index.html` — they exist as a
readable two-file mirror of the inlined code, so you can edit each concern
independently when developing locally over HTTP.

## How it works

Each hour/minute digit is its own "card" with two stacked halves split by a thin
seam line. When the time changes:

1. Only the digit that actually changed re-renders — unchanged digits stay still.
2. The static bottom half is swapped to the new digit immediately, hidden behind
   two rotating overlays.
3. The "old top" rotates down 90° around its bottom edge; the "new bottom" then
   rotates up 90° around its top edge. The overall flip takes ~1.2 s.

### Tick scheduling

Because the display only shows hours and minutes, the clock doesn't tick every
second. Instead, after each render it computes the milliseconds until the next
wall-clock minute boundary and schedules a single `setTimeout` to land just past
it (`+50 ms` buffer). This:

- Avoids waking the CPU 60× per minute for nothing.
- Self-corrects against drift, system sleep, and tab throttling — when the tab
  resumes, the next `setTimeout` fires immediately and reads the *current*
  `Date`, so the clock jumps straight to the right time.
- Uses constant memory — exactly one pending timer at any moment.

## License

MIT
