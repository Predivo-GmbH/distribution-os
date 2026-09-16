# Closeout — Distribution-OS can no longer release code to production that never ran on staging

_Board row: `distribution-os-can-release-code-to-production-that-neve` (opened 2026-09-12, weight low)._
_Verified and closed 2026-09-16._

## The defect

`deploy.yml` (production, dispatched manually on `master`) originally declared
`deploy:` with `needs: [gate-security]` only. Staging lives in a **separate**
workflow, `deploy-staging.yml`, triggered by a push to the `staging` branch.
Nothing tied a production promotion to a staging run having happened, let alone
passed — so `gh workflow run deploy.yml -f confirm=deploy` on a `master` commit
that had never been near `staging` shipped it straight to production. (Measured
2026-09-02: `f45cf25c` went to production while staging held `f4608322`, nine
code files apart.)

## The fix (already shipped, verified this turn)

`deploy.yml` on `origin/master` now has a dedicated **`gate-staging`** job, and
`deploy:` declares `needs: [gate-security, gate-staging]` (verified this turn:
lines 183 / 202 / 211 / 296 / 298 of `origin/master:.github/workflows/deploy.yml`).

`gate-staging` compares the **git tree object ids** of the three build-input
directories — `app/` (built and uploaded), `scripts/` (the guard suites) and
`supabase/` (prod migrations + edge functions) — between the commit being
promoted and every `head_sha` of a successful `deploy-staging.yml` run. Equal
tree ids mean byte-identical trees.

- **Not SHA equality** — `staging` and `master` are different branches, so the
  promoted SHA is normally not the staged SHA; equality would refuse every
  honest release.
- **Not the GitHub compare API** — its `files[]` array is capped at 300 entries,
  returns HTTP 200 with no truncation flag, and cuts off in path order, so a bulk
  docs change reads as "docs only" over changed app code (Cockpit hit this,
  cockpit#76). A tree id has no cap, no pagination, no API call.
- **Fail-closed on every branch** — unreadable API, zero green staging runs, an
  unresolvable `head_sha`, an unresolvable tree all refuse. A gate that cannot
  look has not passed.

There is also an older inline "Verify staging gate" step inside the `deploy` job
(curl+grep tree compare), so the promotion is now gated in two independent places.

### Commit trail (repo `Predivo-GmbH/distribution-os`, on `master`)
- `ed321cbd42fee5f2c5c5fd0cf482f4197fd7735e` — "Production could ship a build tree staging had never run (#2)": adds `gate-staging`, makes `deploy` need it.
- `11eecac32dbce35b2123b59d23ef4f44190fa394` — "The staging gate could not look, so it refused every release (#5)": full-history fetch + ref resolution so the gate can resolve staged SHAs.
- `2eb3f7df2cb4e73bb903e314b5ec6ea12a961e7f` — "Stop the staging deploy gate reddening on a secret it was never given (#7)".

## Finish-test (the row's own definition of done)

`production-monitor/scripts/distribution-os-cannot-ship-what-staging-never-ran.test.mjs`
asserts the production `deploy` job waits for staging (a `needs:` entry naming
staging, or a step reading `deploy-staging.yml`'s conclusion). It was written to
FAIL while the gate was missing.

Run 2026-09-16:

```
Distribution-OS cannot ship what staging never ran:
  ok  the workflow still declares a production deploy job called `deploy`
  ok  the production job waits for SOMETHING
  ok  ...and what it waits for includes staging

all passed
EXIT=0
```

## Boundary note

No production deploy was dispatched from this session and none was needed: the
fix is CI config already on `origin/master`, and the proof for a CI guard is its
passing finish-test, not a deploy run. Staging-max boundary respected.
