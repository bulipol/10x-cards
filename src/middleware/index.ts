import { defineMiddleware } from "astro:middleware";

import { supabaseClient } from "../db/supabase.client";

//Public paths that should be accessible without authentication
// const PUBLIC_PATHS = ["/login", "/register", "/reset-password"];

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
