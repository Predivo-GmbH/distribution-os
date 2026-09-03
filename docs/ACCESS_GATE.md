# The access gate, and where its code is allowed to live

The whole app is wrapped in `<PasswordGate>` (`app/src/App.tsx`). It is a pre-launch
gate, not an auth system: the component holds a **SHA-256 digest** of the access code
(`app/src/components/shared/PasswordGate.tsx`), hashes what the visitor types, compares,
and on a match sets a `sessionStorage` key. The plaintext code is never in the bundle.

## Where the value lives — the only two places

| Where | What for |
|---|---|
| `docs/Credentials.txt` (**gitignored**) | humans, manual testing |
| GitHub repo secret `DISTOS_GATE_PASSWORD` | the e2e job in `.github/workflows/test.yml` |

It must never appear anywhere else — not in a spec, not in a doc, not in a workflow
file, not in a commit message. Docs that need to mention it point *here* or at the
credentials file; they never quote a value.

## Why this file exists

On 2026-09-02, commit `b3a2c8c` rotated the gate off a value five sites shared and, in
the same commit, typed the **new live code** into `app/e2e/password-gate.spec.ts` as a
plaintext literal. A committed secret is a burned secret, so it had to be rotated again
(`f45cf25`) — the value published by `b3a2c8c` is dead, but **it is still in git history
and always will be** unless history is rewritten. Removing a secret from HEAD does not
unpublish it.

## Running the gate spec

```bash
cd app
export DISTOS_GATE_PASSWORD='...'   # from docs/Credentials.txt — never echo it
npx playwright test e2e/password-gate.spec.ts --project=chromium
```

If `DISTOS_GATE_PASSWORD` is unset the spec **throws a named error**. That is deliberate:
it used to default to `''` and fail later on a confusing UI assertion, which hides the
real cause. In CI the workflow supplies it from the repo secret.

## The artefact hazard — read before editing that spec

A failing Playwright test **photographs the page**. It writes `error-context.md`, an
accessibility snapshot that includes form field *values*, and with `trace:
'on-first-retry'` (set in `app/playwright.config.ts`) a retry records the verbatim
arguments to `fill()`. `test.yml` uploads `app/playwright-report/` as an artefact on
failure, where GitHub keeps it for days.

So `password-gate.spec.ts`:

1. sets `trace/screenshot/video: 'off'` for the whole file, and
2. blanks the field in a `finally` **the instant the form is submitted**, before any
   assertion can fail with the code still in the DOM.

Turning tracing off is not sufficient on its own — `error-context.md` is written
regardless. Step 2 is the control that actually holds.

That `finally` uses a **short explicit timeout**, and that is load-bearing. On the
success path the gate unmounts, so `fill('')` would otherwise wait out the entire
remaining test budget for an element that has correctly gone away, and the assertion
after it then fails for lack of time — a green control that turns the test red for the
wrong reason.

## Commit-time protection

The fleet pre-commit hook (`~/.git-hooks/pre-commit`, wired via `core.hooksPath`)
harvests known secret values from the **credentials file of the repo being committed**
and refuses any commit whose staged diff contains one. Before 2026-09-02 it only read
BackOffice's credentials file, which is exactly why `b3a2c8c` sailed through it.

If it ever blocks you, fix the commit — do not `--no-verify`.
