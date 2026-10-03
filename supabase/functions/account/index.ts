import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import content from "./private-content.json" with { type: "json" };

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return reply({ error: "Authentication required" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false },
    });
    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) return reply({ error: "Authentication required" }, 401);
    const { data: live, error: sessionError } = await client.rpc("has_live_session");
    if (sessionError || !live) return reply({ error: "Session expired" }, 401);
    const body = await request.json();
    if (body.action === "private" || body.action === "catalog") {
      const { data: allowed, error: accessError } = await client.rpc("has_private_access");
      if (accessError || !allowed) return reply({ error: "Access denied" }, 403);
      if (body.action === "catalog") return reply({ items: Object.values(content).map((trainer) => trainer.item) });
      const trainer = (content as Record<string, unknown>)[body.slug];
      return trainer ? reply(trainer) : reply({ error: "Not found" }, 404);
    }
    if (body.action === "delete" && body.confirm === "LÖSCHEN") {
      const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
      const { error: revokeError } = await admin.auth.admin.signOut(token, "global");
      if (revokeError) return reply({ error: "Session revocation failed" }, 500);
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      return deleteError ? reply({ error: "Account deletion failed" }, 500) : reply({ deleted: true });
    }
    return reply({ error: "Invalid request" }, 400);
  } catch { return reply({ error: "Request failed" }, 500); }
});
