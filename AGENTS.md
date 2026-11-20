# Smart Campus — Room Availability Checker (Experiment A baseline)

Single-room availability checker for Room A101. All times are integer minutes
after midnight on one day (0–1440). The scenario is fixed and fictional:
the existing booking is **600–660 (10:00–11:00)** and "now" is fixed at
**540 (09:00)**. There is no backend, no login, no database, and no saved
booking creation — checks are pure and stateless by design.

## Files

- `booking.js` — pure rule function `canBook({start, end, now, blocked, bookings})` returning a boolean. Must not mutate its input.
- `index.html` — the entire UI (styles, form, inline script with `validateAvailability`, `parseIntegerMinutes`, `minutesToTimeDisplay`). The UI must not be redesigned.
- `cases.json` — fixture data: 16 tabular cases (T01–T14, T16, T17).
- `booking.test.cjs` — runs the JSON cases plus purity tests T15, T18, T19.
- `test_checker.cjs` — runs the inline UI script in a VM with DOM stubs; re-encodes the same 16 rule cases plus parsing, hint, and stale-result reset checks.

## Exact test commands

```
node --test booking.test.cjs
node test_checker.cjs index.html --check-reset
```

The `--check-reset` flag is optional but required for the stale-result reset
assertions. Baseline counts: 19 node tests pass; 16 UI logic cases pass plus
parsing/hint/reset checks. All assertions are current and must not be weakened.

## Acceptance criteria (Lesson 09 numbering)

- **AC1 — Invalid / past intervals.** Reject non-integer minutes, minutes
  outside 0–1440 (1440 inclusive; 1441 rejected), reversed intervals
  (`start >= end`, zero duration included), and any interval starting at or
  before `now` (`start > now` is required; `start === now` fails).
- **AC2 — Duration.** Duration must satisfy `end - start <= 120` minutes.
  Exactly 120 is allowed; 121 is rejected.
- **AC3 — Blocked.** If the room is blocked (out of service), always
  unavailable regardless of the requested interval.
- **AC4 — Overlap / touching endpoints.** Reject any strict overlap with an
  existing booking (`start < booking.end && end > booking.start`). Touching
  endpoints are allowed: a request may start exactly at an existing booking's
  end, and may end exactly at its start.
- **AC5 — Immutable data.** `canBook` must not mutate its inputs, must not
  persist anything, and repeated checks on the same input must return the
  same result. The UI must leave the fixed existing booking unchanged.
- **AC6 — Responsive clear feedback.** The existing responsive UI (grid
  collapses on narrow viewports) and its feedback behavior are preserved:
  a visible Available/Unavailable result with a reason, and the old result
  is cleared whenever the inputs or the block toggle change.

## Preservation rules for future changes

- Preserve the existing validation order in `canBook`: blocked check first,
  then integer/bounds checks (`start < 0 || start >= end || end > 1440 || start <= now`), then the 120-minute duration cap, then the overlap scan.
- Preserve integer 0–1440 minute bounds, `start > now`, `start < end`,
  duration <= 120, blocked rejection, and strict-overlap-with-touching-allowed
  exactly as specified above.
- Preserve fixture immutability (AC5) and the unchanged responsive UI and
  feedback/reset behavior (AC6).

## Architecture preferences

- Prefer pure functions and minimal module boundaries. Keep `canBook` pure
  and side-effect free.
- At most two justified patterns. Do NOT use a Strategy pattern for a single
  policy or an Adapter for a single data shape.
- Do NOT add a backend, login, database, saved booking creation, or a UI
  redesign. The app stays stateless.

## Verification protocol for any change

Run all existing tests without weakening assertions, plus focused regressions
for the touched behavior. Report the exact commands, pass counts, and the
list of changed files.
