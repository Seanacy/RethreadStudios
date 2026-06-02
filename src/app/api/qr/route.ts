import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("artist");
  const pieceId = searchParams.get("piece");

  if (!username) {
    return NextResponse.json({ error: "artist username is required" }, { status: 400 });
  }

  // QR links to artist profile, optionally with piece context
  const baseUrl = request.url.split("/api/")[0];
  const url = pieceId
    ? `${baseUrl}/artist/${username}?from=qr&piece=${pieceId}`
    : `${baseUrl}/artist/${username}?from=qr`;

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    // Return as JSON with the data URL and the target URL
    return NextResponse.json({
      qr_image: qrDataUrl,
      target_url: url,
      artist: username,
      piece_id: pieceId || null,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
