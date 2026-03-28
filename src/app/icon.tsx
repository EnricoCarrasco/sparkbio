import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF6B35",
          borderRadius: "8px",
        }}
      >
        {/* Diamond sparkle */}
        <div
          style={{
            position: "absolute",
            top: "3px",
            right: "7px",
            width: "5px",
            height: "5px",
            background: "white",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "2px",
            right: "3px",
            width: "3px",
            height: "3px",
            background: "white",
            transform: "rotate(45deg)",
            opacity: 0.7,
          }}
        />
        {/* V letter */}
        <span
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "white",
            marginTop: "1px",
            fontFamily: "sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          V
        </span>
      </div>
    ),
    { ...size }
  );
}
