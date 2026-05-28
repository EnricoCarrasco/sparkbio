import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { RedemptionPage } from "./redemption-page";

export const dynamic = "force-dynamic";

interface CodeInfo {
  found: boolean;
  code?: string;
  handle?: string | null;
  locale?: "en" | "pt-BR";
  status?: "active" | "redeemed" | "revoked";
}

export default async function RedeemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  // Fetch code info using the public RPC (returns only safe subset — no notes / commission).
  const admin = createAdminClient();
  const { data: rpcData } = await admin.rpc("get_lifetime_code_info", {
    p_code: code,
  });

  const info = (rpcData as CodeInfo | null) ?? { found: false };

  // Increment view counter. Supabase's PostgrestBuilder is thenable but only
  // executes when awaited — `void rpc(...)` discards the builder without firing
  // the request. Add a `.then()` so the request actually goes out. We don't
  // await it (page render isn't blocked on telemetry).
  if (info.found) {
    admin
      .rpc("increment_lifetime_code_view", { p_code: code })
      .then(({ error }) => {
        if (error) console.error("[redeem] view_count increment failed:", error);
      });
  }

  // Determine if there's already a signed-in user (so we can render the
  // "claim on this account" variant instead of the signup form).
  const userClient = await createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  const signedInEmail = user?.email ?? null;

  return (
    <RedemptionPage
      code={info.found ? (info.code ?? code) : code}
      handle={info.handle ?? null}
      locale={info.locale ?? "en"}
      status={info.found ? info.status ?? "active" : null}
      signedInEmail={signedInEmail}
    />
  );
}
