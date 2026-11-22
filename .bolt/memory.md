# Project memory

## Product intent & audience

- Practice 10 booking app; evaluator/agent-facing runbook via `AGENTS.md`.
- Small booking UI with reason-code output; no human-facing README yet.
- No backend; purely client-side logic.

## Brand personality & voice

- Minimal, technical; AGENTS.md doubles as runbook (agent-facing, not user-facing).

## Visual design & UX direction

- `index.html` loads `booking.js` as a classic `<script src>` (line ~295).
- Vite dev-server is the only exercised rendering path; `dist/` was deleted ad hoc.
- No inferred design system specifics beyond classic-script browser delivery.

## Decisions, constraints & rationale

- `booking.js` uses dual-mode guard (`if (typeof module !== 'undefined') module.exports=…`) to support both browser classic script and Node `require`.
- Tests are three separate commands, not an aggregate `npm test` gate:
  - `node --test booking.test.cjs`
  - `node --test booking.explain.test.cjs`
  - `node test_checker.cjs index.html --check-reset`
- `package.json` has only `dev` script; no `test` or `build` keys.
- `now=540` and touching endpoints are intentional test fixtures.
- Framework: DEFAULT_TO_DEV (Vite dev-served artifact).
- Read-only audit pass requested; no edits, installs, or servers without explicit approval.
- Proposed mitigations (not yet applied): add aggregate `test` script; add AGENTS.md "Safety & operations" section (no secrets, approval before installs/servers, `npm test` as gate).

## Open questions & assumptions

- Whether graded artifact is dev-served or built (`dist/`) — unknown.
- Browser-path semantic exposure of `booking.js` globals is untested beyond `test_checker.cjs` VM run.
- No test results from this session claimed; audit was read-only.
- README absence is an open gap for human/evaluator onboarding.