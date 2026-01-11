import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <path
            d="M16 4 L9 18 L12 18 L16 10 L20 18 L23 18 L16 4Z"
            fill="white"
          />
          <rect x="7" y="20" width="18" height="3" rx="1" fill="white" />
          <rect
            x="9"
            y="24"
            width="14"
            height="2.5"
            rx="1"
            fill="white"
            opacity="0.85"
          />
          <rect
            x="11"
            y="27.5"
            width="10"
            height="2"
            rx="1"
            fill="white"
            opacity="0.7"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
