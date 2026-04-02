import { NextResponse } from "next/server";

type Props = { params: Promise<{ username: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { username } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

  const manifest = {
    name: `${username} | Viopage`,
    short_name: username,
    start_url: `${siteUrl}/${username}`,
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#FF6B35",
    icons: [
      {
        src: `${siteUrl}/icons/icon-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${siteUrl}/icons/icon-512x512.png`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
