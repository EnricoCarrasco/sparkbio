import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import type { PublicProfile } from "@/types";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ username: string }> };

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_profile", {
      p_username: username,
    });

    if (error || !data || !data.profile) return null;
    return data as PublicProfile;
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: Props) {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  const displayName = data?.profile.display_name ?? username;
  const bio = data?.profile.bio ?? null;
  const bgColor = data?.theme.bg_color ?? "#FAFAFA";
  const textColor = data?.theme.text_color ?? "#1E1E2E";
  const buttonColor = data?.theme.button_color ?? "#FF6B35";
  const avatarUrl = data?.profile.avatar_url ?? null;

  // Determine if the bg is dark (lightness heuristic) to set overlay contrast
  const isDarkBg =
    bgColor.toLowerCase().includes("0f0f") ||
    bgColor.toLowerCase().includes("1a1a") ||
    bgColor.toLowerCase().includes("1e1e") ||
    bgColor.toLowerCase().includes("263238");

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          position: "relative",
          fontFamily: "'Inter', sans-serif",
          padding: "60px 80px",
          gap: "0",
        }}
      >
        {/* Subtle decorative accent circle */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            backgroundColor: buttonColor,
            opacity: 0.08,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-60px",
            width: "380px",
            height: "380px",
            borderRadius: "50%",
            backgroundColor: buttonColor,
            opacity: 0.06,
          }}
        />

        {/* Avatar (if available) */}
        {avatarUrl && (
          <img
            src={avatarUrl}
            width={120}
            height={120}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "28px",
              border: `4px solid ${buttonColor}`,
            }}
            alt={displayName}
          />
        )}

        {/* Display name */}
        <div
          style={{
            fontSize: avatarUrl ? "64px" : "72px",
            fontWeight: 800,
            color: textColor,
            lineHeight: 1.1,
            textAlign: "center",
            letterSpacing: "-0.02em",
            maxWidth: "1000px",
          }}
        >
          {displayName}
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 500,
            color: textColor,
            opacity: 0.5,
            marginTop: "12px",
            letterSpacing: "0.01em",
          }}
        >
          @{username}
        </div>

        {/* Bio (truncated) */}
        {bio && (
          <div
            style={{
              fontSize: "22px",
              fontWeight: 400,
              color: textColor,
              opacity: 0.7,
              marginTop: "20px",
              maxWidth: "760px",
              textAlign: "center",
              lineHeight: 1.5,
              display: "-webkit-box",
              overflow: "hidden",
            }}
          >
            {bio.slice(0, 120)}
            {bio.length > 120 ? "…" : ""}
          </div>
        )}

        {/* Sparkbio branding */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: buttonColor,
            }}
          />
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: isDarkBg ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)",
              letterSpacing: "0.04em",
              textTransform: "lowercase",
            }}
          >
            sparkbio.co
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
