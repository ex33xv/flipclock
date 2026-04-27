(function () {
  'use strict';

  var slots = {};
  var slotIds = ['h-tens', 'h-ones', 'm-tens', 'm-ones'];
  slotIds.forEach(function (id) {
    slots[id] = document.querySelector('[data-slot="' + id + '"]');
  });

  var current = { 'h-tens': null, 'h-ones': null, 'm-tens': null, 'm-ones': null };

  function makeHalf(kind, layer, digit) {
    // kind: "top" | "bottom" — which half of the digit to show
    // layer: "half" (static) | "flip" (animating overlay)
    var div = document.createElement('div');
    div.className = layer + ' ' + kind;
    var span = document.createElement('span');
    span.textContent = digit;
    div.appendChild(span);
    return div;
  }

  function clear(card) {
    while (card.firstChild) card.removeChild(card.firstChild);
  }

  function renderStatic(card, digit) {
    clear(card);
    card.appendChild(makeHalf('top', 'half', digit));
    card.appendChild(makeHalf('bottom', 'half', digit));
  }

  // Animate a card from `oldDigit` to `newDigit`.
  // Static halves underneath show: old top, new bottom (so when the old top
  // flips away, the new digit is already in place underneath).
  // Two flipping overlays animate on top.
  function flipTo(card, oldDigit, newDigit) {
    clear(card);
    card.appendChild(makeHalf('top', 'half', oldDigit));
    card.appendChild(makeHalf('bottom', 'half', newDigit));
    card.appendChild(makeHalf('top', 'flip', oldDigit));
    var bottomFlip = makeHalf('bottom', 'flip', newDigit);
    card.appendChild(bottomFlip);

    var settled = false;
    var settle = function () {
      if (settled) return;
      settled = true;
      renderStatic(card, newDigit);
    };
    bottomFlip.addEventListener('animationend', settle);
    // Safety net in case animationend is missed (background tab throttling, etc.).
    setTimeout(settle, 1400);
  }

  function update(now) {
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var next = {
      'h-tens': hh[0],
      'h-ones': hh[1],
      'm-tens': mm[0],
      'm-ones': mm[1]
    };

    slotIds.forEach(function (id) {
      var card = slots[id];
      var prev = current[id];
      if (prev === null) {
        renderStatic(card, next[id]);
      } else if (prev !== next[id]) {
        flipTo(card, prev, next[id]);
      }
      current[id] = next[id];
    });
  }

  // ── DECISION POINT: tick scheduling ─────────────────────────────────────
  // The display only shows hours and minutes, so we don't need to update
  // every second. But naïve approaches each have problems:
  //
  //   (A) setInterval(tick, 1000)
  //       Simple, but wakes the CPU 60× more than needed and drifts
  //       (each tick is "~1s after the last one", not aligned to wall clock).
  //
  //   (B) setInterval(tick, 60000)
  //       Cheap, but if started at e.g. 10:41:30, it fires at 10:42:30 —
  //       half a minute LATE for displaying "10:42". Drift compounds over time.
  //
  //   (C) setTimeout aligned to the next minute boundary, recursing each tick.
  //       Each tick computes "ms until the next :00 second" and schedules
  //       precisely. Self-correcting against drift, system sleep, tab throttling.
  //
  // Option (C) is the right call for a minute-resolution clock. Implement it below.
  //
  // YOUR TASK: write `scheduleNextTick()` so that:
  //   1. It calls `update(new Date())` exactly when the wall clock crosses
  //      the next minute boundary (e.g., at 10:43:00.000).
  //   2. After firing, it schedules the next tick the same way (recursion).
  //   3. Hint: `now.getSeconds()` and `now.getMilliseconds()` tell you how
  //      far past the previous minute boundary you are. Add a small buffer
  //      (e.g. +50ms) so we land just *after* the boundary, not before it
  //      (where rounding could still show the old minute).
  //
  function scheduleNextTick() {
    var now = new Date();
    var msIntoMinute = now.getSeconds() * 1000 + now.getMilliseconds();
    var msUntilNextMinute = 60000 - msIntoMinute + 50;
    setTimeout(function () {
      update(new Date());
      scheduleNextTick();
    }, msUntilNextMinute);
  }
  // ────────────────────────────────────────────────────────────────────────

  update(new Date());
  scheduleNextTick();
})();
