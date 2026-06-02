import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "collection", "season", "artist"
  const id = searchParams.get("id"); // collection/season/artist id or username
  const format = searchParams.get("format") || "html"; // "html" or "json"

  if (!type || !id) {
    return NextResponse.json({ error: "type and id are required. type=collection|season|artist" }, { status: 400 });
  }

  let pieces: Record<string, unknown>[] = [];
  let title = "";
  let subtitle = "";
  let profileUrl = "";

  if (type === "artist") {
    const { data: artist } = await supabase.from("rs_artists").select("*").eq("username", id).single();
    if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

    title = (artist as Record<string, unknown>).display_name as string || (artist as Record<string, unknown>).username as string;
    subtitle = `@${(artist as Record<string, unknown>).username}`;
    profileUrl = `/artist/${(artist as Record<string, unknown>).username}`;

    const { data: p } = await supabase.from("rs_pieces").select("id, title, price, after_images, status")
      .eq("artist_id", (artist as Record<string, unknown>).id).eq("status", "available").order("created_at", { ascending: false }).limit(8);
    pieces = (p || []) as Record<string, unknown>[];

  } else if (type === "collection") {
    const { data: col } = await supabase.from("rs_collections").select("*, artist:rs_artists(username, display_name)").eq("id", id).single();
    if (!col) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    title = (col as Record<string, unknown>).title as string;
    const artist = (col as Record<string, unknown>).artist as Record<string, unknown>;
    subtitle = `by ${artist.display_name || artist.username}`;
    profileUrl = `/artist/${artist.username}`;

    const { data: p } = await supabase.from("rs_pieces").select("id, title, price, after_images, status")
      .eq("collection_id", id).eq("status", "available").order("created_at", { ascending: false }).limit(8);
    pieces = (p || []) as Record<string, unknown>[];

  } else if (type === "season") {
    const { data: season } = await supabase.from("rs_seasons").select("*, artist:rs_artists(username, display_name)").eq("id", id).single();
    if (!season) return NextResponse.json({ error: "Season not found" }, { status: 404 });

    title = (season as Record<string, unknown>).title as string;
    const artist = (season as Record<string, unknown>).artist as Record<string, unknown>;
    subtitle = `by ${artist.display_name || artist.username}`;
    profileUrl = `/artist/${artist.username}`;

    // Get all collections in this season, then all pieces
    const { data: cols } = await supabase.from("rs_collections").select("id").eq("season_id", id);
    const colIds = ((cols || []) as Record<string, unknown>[]).map((c) => c.id as string);
    if (colIds.length > 0) {
      const { data: p } = await supabase.from("rs_pieces").select("id, title, price, after_images, status")
        .in("collection_id", colIds).eq("status", "available").order("created_at", { ascending: false }).limit(8);
      pieces = (p || []) as Record<string, unknown>[];
    }
  }

  // JSON format
  if (format === "json") {
    return NextResponse.json({ title, subtitle, profileUrl, pieces }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  // HTML embed format
  const baseUrl = request.url.split("/api/")[0];
  const piecesHtml = pieces.map((p) => {
    const img = (p.after_images as string[])?.[0] || "";
    return `<a href="${baseUrl}/piece/${p.id}" target="_blank" style="text-decoration:none;display:block;width:140px;flex-shrink:0">
      <div style="width:140px;height:187px;border-radius:8px;overflow:hidden;background:#141414;margin-bottom:6px">
        ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover" />` : ""}
      </div>
      <div style="font-size:12px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</div>
      <div style="font-size:11px;color:#e8d5b7">$${p.price}</div>
    </a>`;
  }).join("");

  const html = `<div style="background:#0a0a0a;border:1px solid #1e1e1e;border-radius:12px;padding:16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:640px">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div>
      <div style="font-size:14px;font-weight:700;color:#fff">${title}</div>
      <div style="font-size:11px;color:#888">${subtitle}</div>
    </div>
    <a href="${baseUrl}${profileUrl}" target="_blank" style="font-size:11px;color:#e8d5b7;text-decoration:none">View on Rethread Studios →</a>
  </div>
  <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px">
    ${piecesHtml}
  </div>
  <div style="text-align:center;margin-top:8px">
    <a href="${baseUrl}" target="_blank" style="font-size:10px;color:#555;text-decoration:none">Powered by Rethread Studios</a>
  </div>
</div>`;

  // Return as embeddable HTML
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
