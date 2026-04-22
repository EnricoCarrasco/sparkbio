import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Viopage — Link in Bio for Creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFBE0B 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 800,
              color: "#FF6B35",
            }}
          >
            V
          </div>
          <span
            style={{
              fontSize: "44px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            Viopage
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "28px",
          }}
        >
          <h1
            style={{
              fontSize: "88px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.02,
              margin: 0,
              letterSpacing: "-0.035em",
              maxWidth: "960px",
            }}
          >
            One link for everything you create.
          </h1>
          <p
            style={{
              fontSize: "34px",
              color: "rgba(255,255,255,0.92)",
              margin: 0,
              maxWidth: "960px",
              lineHeight: 1.25,
            }}
          >
            The link-in-bio platform for creators — 12 premium themes,
            analytics, and a 7-day free trial.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontSize: "26px",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 600,
          }}
        >
          <span>viopage.com</span>
          <span>60,000+ creators</span>
        </div>
      </div>
    ),
    size,
  );
}
