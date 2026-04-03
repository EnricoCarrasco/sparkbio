import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog/posts";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? "Viopage Blog";
  const category = post?.category ?? "BLOG";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          background: "linear-gradient(135deg, #1E1E2E 0%, #2D1B14 50%, #3D1F0F 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: category + logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#FF6B35",
              color: "white",
              padding: "8px 20px",
              borderRadius: "100px",
              fontSize: "16px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {category}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                background: "#FF6B35",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              V
            </div>
            <span
              style={{
                color: "white",
                fontSize: "24px",
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              viopage
            </span>
          </div>
        </div>

        {/* Center: title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "900px",
          }}
        >
          <h1
            style={{
              color: "white",
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom: site URL + accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "18px",
            }}
          >
            viopage.com/blog
          </span>
          <div
            style={{
              width: "80px",
              height: "4px",
              background: "#FF6B35",
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
