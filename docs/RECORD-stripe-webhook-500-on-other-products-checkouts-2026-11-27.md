# RECORD: the live stripe-webhook answered 500 to deliveries that were not Distribution-OS's (27.11.2026)

**Board row:** `inbox-1a21d258dd1486f7`.

## What happened

Stripe mailed hello@ on 27.11.2026, 13:15Z (Predivo GmbH account, live mode). The endpoint
`https://jxjpbmkgmuunpayqgbsx.supabase.co/functions/v1/stripe-webhook` (we_1TSFdO3t3lPzxbvZSVnFEgxv) had answered
HTTP 500 to all 3 delivery attempts since 21.11.2026, 13:14:08Z. Stripe stops sending to it on 30.11.2026 at 13:14:08Z
if the failures continue.

A board worker first diagnosed arivioo instead. arivioo's stripe-webhook does answer 500, because that project has no
Stripe secrets at all. But Stripe's mail names this project (DistributionOS.predivo.ch), not arivioo.

## What was measured (read-only)

- **Secrets and signature:** STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are both set on jxjpbmkgmuunpayqgbsx (names
  read through the Management API, never a value). An unsigned POST answers 400, as it should.
- **Where the 500 came from:** `error_log` has no `signature-verify` row since 20.11, so the signature check passed.
  The 500 therefore came from the handler after the signature check, which logged nothing.
- **Customer impact:** `user_preferences` has 0 rows with a `stripe_customer_id` and 0 with a subscription. No
  Distribution-OS customer has ever paid through Stripe, so the failed deliveries left no paying customer of this
  product unserved.
- **Why the handler sees other products' events:** the account is shared by every product, so this endpoint receives
  every completed checkout of the account. For a one-time payment (`mode: payment`, no subscription), the old handler
  called `stripe.subscriptions.retrieve(null)`. That throws, and the function answered 500.
- **Not established:** the exact three events. Reading them needs the live Stripe key, which takes Roger's approval
  under the paid-key guard.

## Proof on this PC

Both versions were served on localhost with dummy env (Deno), and each got the same signed one-time checkout
(`checkout.session.completed`, `mode: payment`, `subscription: null`):

- old (origin/master): **HTTP 500 Internal Server Error**
- new (this change): **HTTP 200 {"received":true}**

`deno check supabase/functions/stripe-webhook/index.ts` passes.

## The change

- A checkout that is not a subscription, or has none, is acknowledged and skipped. Distribution-OS sells subscriptions
  only (stripe-checkout `mode: 'subscription'`). Checkouts with a subscription are handled exactly as before.
- Every handler failure is now written to `error_log` before the 500 is returned. That covers a thrown error and a
  failed `user_preferences` update, logged as `handle <event type>` with the event id and livemode only, never customer
  data. Stripe still gets the 500 and retries, so a real failure of our own is neither hidden nor dropped.

## Release

Deploy with deploy-edge-functions.yml, `functions=stripe-webhook`: first `target=staging`, then `target=production`
with `confirm=deploy`. Distribution-OS is ours to release (Roger 2026-09-03, see that workflow's header).
