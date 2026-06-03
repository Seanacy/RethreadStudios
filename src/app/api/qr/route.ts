import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("artist");
  const pieceId = searchParams.get("piece");

  if (!username) {
    return NextResponse.json({ error: "artist username is required" }, { status: 400 });
  }

  const baseUrl = request.url.split("/api/")[0];
  let url = `${baseUrl}/artist/${username}?from=qr`;
  let collectionName: string | null = null;

  // If piece is specified, check if it belongs to a collection
  if (pieceId) {
    const { data: piece } = await supabase
      .from("rs_pieces")
      .select("collection_id")
      .eq("id", pieceId)
      .single();

    if (piece?.collection_id) {
      const { data: col } = await supabase
        .from("rs_collections")
        .select("title")
        .eq("id", piece.collection_id)
        .single();
      if (col) collectionName = col.title;
    }

    url = `${baseUrl}/piece/${pieceId}?from=qr`;
  }

  try {
    // Generate QR as SVG string so we can add text
    const qrSvg = await QRCode.toString(url, {
      type: "svg",
      width: 300,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });

    // Build a combined SVG with collection name
    const label = collectionName || `@${username}`;
    const totalHeight = collectionName ? 370 : 350;

    const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="${totalHeight}" viewBox="0 0 340 ${totalHeight}">
      <rect width="340" height="${totalHeight}" rx="16" fill="#ffffff"/>
      <g transform="translate(20, 15)">
        ${qrSvg.replace(/<svg[^>]*>/, "").replace("</svg>", "")}
      </g>
      <text x="170" y="${totalHeight - 18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#0a0a0a">${label}</text>
      <text x="170" y="${totalHeight - 4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#888888">Rethread Studios</text>
    </svg>`;

    // Also generate data URL version for download
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    });

    return NextResponse.json({
      qr_image: qrDataUrl,
      qr_svg: combinedSvg,
      target_url: url,
      artist: username,
      piece_id: pieceId || null,
      collection_name: collectionName,
    }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
