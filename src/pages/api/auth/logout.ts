import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Supabase signOut error:", error);
      return new Response(
        JSON.stringify({ error: "server_error", message: "Logout failed" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Internal server error" }),
      { status: 500 }
    );
  }
};
