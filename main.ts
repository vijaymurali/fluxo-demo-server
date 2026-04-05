/**
 * Fluxo – Xtream Codes Compatible Demo Server
 * Runtime: Deno Deploy (https://deno.com/deploy)
 *
 * Implements the Xtream Codes API protocol so Fluxo can log in,
 * browse channels, and play video — using copyright-free MP4 files
 * hosted on GitHub raw as stream content.
 *
 * Routes:
 *   /player_api.php  — standard Xtream Codes path (real IPTV servers)
 *   /player_api      — alias for platforms that block .php at the edge
 *   /live/:u/:p/:id  — stream redirect to GitHub raw MP4
 */

const USERNAME = "fluxodemo";
const PASSWORD = "review2026";
const EXPIRY_TS = String(Math.floor(new Date("2028-01-01").getTime() / 1000));

// Raw GitHub URLs for the demo MP4 files (Coverr free license)
const RAW_BASE = "https://raw.githubusercontent.com/vijaymurali/fluxo-demo-server/main/content";

const STREAM_URLS: Record<number, string> = {
  101: `${RAW_BASE}/channel1.mp4`,
  102: `${RAW_BASE}/channel2.mp4`,
  103: `${RAW_BASE}/channel3.mp4`,
};

const ALL_CHANNELS = [
  { stream_id: 101, name: "Popcorn [FHD]",   category_id: "1", stream_icon: "", tv_archive: 0, stream_type: "live" },
  { stream_id: 102, name: "Ocean Boat [HD]",  category_id: "1", stream_icon: "", tv_archive: 0, stream_type: "live" },
  { stream_id: 103, name: "Mountains [FHD]",  category_id: "2", stream_icon: "", tv_archive: 0, stream_type: "live" },
];

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function isValid(params: URLSearchParams): boolean {
  return params.get("username") === USERNAME && params.get("password") === PASSWORD;
}

function handleApiRequest(url: URL, params: URLSearchParams): Response {
  if (!isValid(params)) {
    return json({ user_info: { status: "Banned", username: params.get("username") ?? "" } });
  }

  const action = params.get("action");

  // Login — no action param
  if (!action) {
    return json({
      user_info: {
        username: USERNAME,
        password: PASSWORD,
        status: "Active",
        exp_date: EXPIRY_TS,
        is_trial: "0",
        active_cons: "0",
        created_at: "1700000000",
        max_connections: "2",
        allowed_output_formats: ["m3u8", "ts", "rtmp"],
      },
      server_info: {
        url: url.hostname,
        port: "443",
        https_port: "443",
        server_protocol: "https",
        rtmp_port: "1935",
        timezone: "UTC",
        timestamp_now: Math.floor(Date.now() / 1000),
        time_now: new Date().toISOString().replace("T", " ").substring(0, 19),
      },
    });
  }

  if (action === "get_live_categories") {
    return json([
      { category_id: "1", category_name: "Demo Channels", parent_id: 0 },
      { category_id: "2", category_name: "Scenic Clips",  parent_id: 0 },
    ]);
  }

  if (action === "get_live_streams") {
    const catId = params.get("category_id");
    const channels = catId && catId !== "all"
      ? ALL_CHANNELS.filter((c) => c.category_id === catId)
      : ALL_CHANNELS;
    return json(channels);
  }

  return json([]);
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const { pathname: path, searchParams: params } = url;

  // Health check
  if (path === "/") {
    return new Response("Fluxo demo server OK", { status: 200 });
  }

  // Xtream Codes API — standard .php path AND plain alias
  // (Deno Deploy blocks .php at the edge, so /player_api serves as fallback)
  if (path === "/player_api.php" || path === "/player_api") {
    return handleApiRequest(url, params);
  }

  // /live/:username/:password/:streamFile
  // Fluxo builds: {serverURL}/live/{u}/{p}/{streamID}.{ext}
  const liveMatch = path.match(/^\/live\/([^/]+)\/([^/]+)\/(\d+)\.(mp4|m3u8|ts)$/i);
  if (liveMatch) {
    const [, user, pass, idStr] = liveMatch;
    if (user !== USERNAME || pass !== PASSWORD) {
      return new Response("Forbidden", { status: 403 });
    }
    const streamUrl = STREAM_URLS[parseInt(idStr, 10)];
    if (!streamUrl) {
      return new Response("Stream not found", { status: 404 });
    }
    return Response.redirect(streamUrl, 302);
  }

  return new Response("Not found", { status: 404 });
});
