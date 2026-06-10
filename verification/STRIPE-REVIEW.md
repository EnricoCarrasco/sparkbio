# Stripe configuration review

Answer to: "did we configure Stripe well (customers, payments etc.)?"

**Overall: the integration is well-built.** Signature verification, server-side
price IDs, geo-pricing from a trusted header, trial-abuse guard, customer↔user
binding, and refund/dispute handling are all correct. The gaps are around
**edge-case money logic** (grace period, trial commissions, webhook
idempotency) and one **compliance** question (tax). None are quick "flip a
switch" fixes — they need testing in Stripe **test mode**, which is why they're
here rather than auto-applied.

---

## What's already correct ✅

| Area | Status |
|------|--------|
| Webhook signature verification (`constructEvent`, raw body) | ✅ |
| Price IDs are server-side only; client can't pick price/currency | ✅ |
| Geo-pricing trusts only `x-vercel-ip-country` | ✅ |
| Trial-abuse guard (one trial per user, blocks cancel→resubscribe loop) | ✅ |
| `already_subscribed` 409 guard against double-charge | ✅ |
| Customer reuse + `metadata.user_id` binding; `client_reference_id` set | ✅ |
| Refund (full) → cancel sub; partial refund leaves access | ✅ |
| Dispute/chargeback → cancel sub immediately | ✅ |
| Portal session scoped to caller's own `stripe_customer_id` | ✅ |
| Referral commission keyed on internal sub UUID (was a real bug, fixed) | ✅ |
| Stripe client lazy-init (this branch) — build no longer crashes w/o key | ✅ |

---

## Gaps to address (test in Stripe test mode)

### 1. Grace period over-grants free Pro (HIGH — `H2`)
On a failed renewal Stripe rolls `current_period_end` to the **new unpaid**
period; we store it with `past_due`, and `isSubscriptionActive` honors it — up
to a year of free Pro on annual plans.

**Recommended fix:** confirm payment before extending. Handle `invoice.paid`:
```ts
case "invoice.paid": {
  const invoice = event.data.object as Stripe.Invoice;
  const line = invoice.lines.data[0];
  const paidThrough = line?.period?.end; // unix seconds
  if (invoice.subscription && paidThrough) {
    await supabase.from("subscriptions")
      .update({ paid_period_end: new Date(paidThrough * 1000).toISOString() })
      .eq("stripe_subscription_id", String(invoice.subscription));
  }
  break;
}
```
Add a `paid_period_end TIMESTAMPTZ` column and have `isSubscriptionActive` clamp
the `past_due`/`cancelled` grace window to `paid_period_end` (not
`current_period_end`). **Minimum viable:** cap that grace at 14 days from
`stripe_updated_at`.

### 2. Referral commission booked at trial start (HIGH — `H3`)
The webhook calls `processReferralConversion` on `on_trial`, so a commission is
owed before any money moves. Self-referral is blocked, but cross-account rings
(A refers B, both start trials, neither pays) still accrue payable commission
after the 30-day hold.

**Recommended fix:** move the conversion trigger from the subscription event to
`invoice.paid` (first successful charge), and additionally void earnings when a
sub sits `past_due` past the hold:
```ts
// in the invoice.paid handler, after recording paid_period_end:
if (invoice.billing_reason === "subscription_create" /* first paid invoice */) {
  await processReferralConversion(userId, internalSubId, priceId);
}
```
Then drop the `on_trial` branch from `handleSubscription`'s `after()` block.

### 3. Webhook idempotency / ordering (MEDIUM — `M5`)
No `event.id` dedupe; the ordering guard is read-then-write at 1-second
granularity, so replays / out-of-order deliveries can win.

**Recommended fix (defensive — safe with or without the migration applied):**
```ts
// after constructEvent succeeds:
const admin = createAdminClient();
const { error: dupErr } = await admin
  .from("stripe_webhook_events")
  .insert({ event_id: event.id, type: event.type });
if (dupErr?.code === "23505") {        // already processed
  return NextResponse.json({ ok: true, dedup: true });
}
// if the table doesn't exist yet, dupErr is a different code → log + continue
```
Migration:
```sql
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
-- no policies: service_role (webhook) bypasses RLS; nobody else can read/write
```
Alternatively, re-fetch the subscription with `stripe.subscriptions.retrieve`
and write *that* authoritative state instead of trusting event-payload ordering.

### 4. Duplicate / orphaned subscriptions (MEDIUM)
The `already_subscribed` check is TOCTOU; two concurrent checkouts could create
two Stripe subs, and the webhook upsert (`onConflict: user_id`) keeps only the
last `stripe_subscription_id` — the other keeps billing invisibly.
**Fix:** in `handleSubscription`, if the stored `stripe_subscription_id` differs
from the incoming one and the stored one is still active in Stripe, cancel the
newcomer via the API instead of blindly overwriting. Add a nightly reconcile
cron (see #6).

### 5. Tax / VAT (COMPLIANCE — decide)
`automatic_tax: { enabled: false }` in `checkout/route.ts`. For an EU-based SaaS
selling to EU/BR consumers, VAT (EU OSS) / Brazilian taxes may be legally
required on the invoice. **Decision for you:** if you're obligated to collect
VAT, enable Stripe Tax (`automatic_tax: { enabled: true }` + configure tax
registrations in the Stripe dashboard + collect billing address). Not a code
bug — a tax-compliance call.

### 6. No reconciliation path (MEDIUM)
Stripe drops events after ~3 days of retries; a missed cancellation + the
generous grace (#1) = indefinite free Pro. **Fix:** a nightly cron that lists
non-terminal DB subscriptions and reconciles each against
`stripe.subscriptions.retrieve`. You already have the cron harness
(`vercel.json` + `/api/cron/*` with `CRON_SECRET`).

### 7. Minor
- `customers.list({email})` then unconditional `metadata.user_id` overwrite —
  only adopt a customer whose `metadata.user_id` is empty or already equals
  `user.id`, so you can't hijack a customer tied to a deleted/re-created account.
- No rate limit on `/api/checkout` — an authed user can mint unlimited
  customers/sessions (tie into the distributed limiter from `H4`).
- `return_url` carries `amount`/`currency` for the Meta Pixel — user-tamperable,
  analytics-only; keep the dashboard-side validation.

---

## Test plan (Stripe test mode, your machine)
See `MANUAL-CHECKLIST.md` → "Stripe test-mode flows".
