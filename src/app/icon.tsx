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
          fontSize: 20,
          background: "#030712",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "4px",
          border: "2px solid #3b82f6",
        }}
      >
        <span style={{ color: "#3b82f6", fontWeight: 700 }}>V</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
