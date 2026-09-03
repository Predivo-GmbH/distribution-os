#!/usr/bin/env bash
#
# seed-email-relay-vault.sh — re-seed the Vault secrets that handle_send_email needs.
#
# handle_send_email (the GoTrue "Send Email" hook relay -> send-auth-email edge fn) reads
# `supabase_url` + `service_role_key` from Vault, and `send_email_internal_secret` for the
# `x-send-email-secret` header. The relay FUNCTION is codified in
# supabase/migrations/20260903000001_handle_send_email_relay_secret.sql, but those Vault values
# are DATA, not schema — a fresh `supabase db reset` / re-provision drops them and auth email
# silently stops (the relay RAISEs "vault secrets ... missing").
#
# ORDER MATTERS, and getting it wrong rejects every auth email in between:
#   Vault first (the relay starts sending the header), THEN the edge-function secret
#   (the moment enforcement turns on).
#
# The generated value is never echoed, never written to a file, and never put in a commit.
#
# Usage:  bash scripts/seed-email-relay-vault.sh <project-ref>
#   e.g.  bash scripts/seed-email-relay-vault.sh jckctrtkstejolddqzlk   # staging
#         bash scripts/seed-email-relay-vault.sh jxjpbmkgmuunpayqgbsx   # production
#
# NOTE (measured 2026-09-03): this project's LEGACY anon/service_role keys were disabled on
# 2026-06-12, so the script takes the `secret` (sb_secret_...) key, not the legacy service_role
# JWT. send-auth-email runs with verify_jwt=false, so the bearer is belt-and-braces either way.
#
# Ported from ChannelMover/scripts/seed-email-relay-vault.sh. Diff the two before changing either.
set -euo pipefail

REF="${1:?usage: seed-email-relay-vault.sh <project-ref>}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Skip commented-out lines: this file records RETIRED tokens as comments, and taking the first
# `sbp_` in the file would take a revoked one (verified 2026-09-03: retired PATs answer 401).
TOKEN="$(grep -v '^[[:space:]]*#' "$DIR/docs/Credentials.txt" 2>/dev/null | grep -o 'sbp_[A-Za-z0-9]\{20,\}' | head -1)"
[ -n "$TOKEN" ] || { echo "ERROR: no live sbp_ management token found in docs/Credentials.txt" >&2; exit 1; }

SR="$(curl -s "https://api.supabase.com/v1/projects/$REF/api-keys?reveal=true" \
        -H "Authorization: Bearer $TOKEN" \
      | python -c "import sys,json;ks=json.load(sys.stdin);print(next((k['api_key'] for k in ks if k.get('type')=='secret'), next((k['api_key'] for k in ks if k.get('name')=='service_role'),'')))")"
[ -n "$SR" ] || { echo "ERROR: could not read a secret key for $REF" >&2; exit 1; }

URL="https://$REF.supabase.co"

q(){ curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
       -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       --data-binary @- -o /dev/null -w "%{http_code}" \
       < <(python -c "import json,sys;print(json.dumps({'query':sys.stdin.read()}))" <<<"$1"); }

q "delete from vault.secrets where name in ('supabase_url','service_role_key')" >/dev/null
c1="$(q "select vault.create_secret('$URL','supabase_url','edge base url for handle_send_email')")"
c2="$(q "select vault.create_secret('$SR','service_role_key','functions gateway auth for handle_send_email')")"
if [ "$c1" != "201" ] || [ "$c2" != "201" ]; then
  echo "ERROR: unexpected HTTP (url=$c1 key=$c2) for $REF" >&2; exit 1
fi
echo "OK: seeded Vault for $REF (supabase_url + service_role_key)"

# -- Internal relay secret (fleet:send-auth-email:unauthenticated-relay) ----------------------
RELAY_SECRET="$(openssl rand -hex 32)"

c3="$(q "delete from vault.secrets where name = 'send_email_internal_secret'; select vault.create_secret('$RELAY_SECRET','send_email_internal_secret','shared secret handle_send_email sends to send-auth-email')")"
[ "$c3" = "201" ] || { echo "ERROR: could not seed send_email_internal_secret in Vault for $REF (HTTP $c3)" >&2; exit 1; }

c4="$(curl -s -X POST "https://api.supabase.com/v1/projects/$REF/secrets" \
       -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       --data-binary @- -o /dev/null -w "%{http_code}" \
       < <(python -c "import json,sys;print(json.dumps([{'name':'SEND_EMAIL_INTERNAL_SECRET','value':sys.stdin.read().strip()}]))" <<<"$RELAY_SECRET"))"
unset RELAY_SECRET
case "$c4" in 200|201) echo "OK: relay secret set on both sides for $REF (Vault + SEND_EMAIL_INTERNAL_SECRET)";;
  *) echo "ERROR: Vault secret is set but the edge-function secret failed (HTTP $c4) for $REF — auth email will 401 until it is set" >&2; exit 1;; esac
