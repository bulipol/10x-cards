import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email!,
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname) && !url.pathname.startsWith("/api/auth/")) {
    return redirect("/login");
  }

  locals.supabase = supabase;
  return next();
});
