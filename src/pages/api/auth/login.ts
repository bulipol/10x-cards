import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/schemas/auth.schema";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "validation_error",
          message: "Invalid input",
          details: result.error.format(),
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "invalid_credentials", message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: { id: data.user?.id, email: data.user?.email },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "server_error", message: "Internal server error" }),
      { status: 500 }
    );
  }
};
