# Plan Implementacji Autentykacji - POSTĘP

**Data rozpoczęcia:** 2026-01-28
**Status:** ⏳ GOTOWY DO IMPLEMENTACJI
**Strategia:** ETAP 2 (UI + fake auth) → TEST → ETAP 3 (SSR + prawdziwy auth)
**Zgodność z:** auth-spec.md, mvp-implementation-plan-2026-01-27.md, auth-endpoint-implementation-plan.md

---

## Kontekst i zakres

Na podstawie analizy:

- ✅ Zakończono implementację widoku "Moje Fiszki" (Flashcards CRUD)
- ✅ Zakończono implementację Generations READ + Sesja Nauki + Nawigacja
- ⏳ Następny krok: **Autentykacja użytkowników (ETAP 2-3)**

---

## Elementy z auth-spec.md - zakres MVP vs ETAP 4

Następujące elementy **NIE są** częścią MVP, ale są rozpisane w **ETAP 4 (OPCJONALNY)**:

- ⏳ **Reset hasła**: POST `/api/auth/reset-password`, POST `/api/auth/update-password`
- ⏳ **Usunięcie konta (RODO)**: DELETE `/api/auth/account`
- ⏳ **Komponenty**: `ResetPasswordForm.tsx`, `UpdatePasswordForm.tsx`, `DeleteAccountButton.tsx`
- ⏳ **Strony**: `/reset-password.astro`, `/auth/callback.astro`

> **Uwaga:** Implementuj ETAP 4 po zakończeniu ETAP 2-3 jeśli potrzebne.

---

## ETAP 2: Auth UI i Endpoints (fake auth) - 4 FAZY

### Stan końcowy ETAP 2:

- ✅ Strony /login i /register działają
- ✅ Formularze mają walidację client-side
- ✅ API endpoints register/login/logout działają (fake)
- ✅ Zod schemas dla auth
- ✅ Typy User i AuthState w types.ts
- ⚠️ **Nadal używa DEFAULT_USER_ID** - fake auth
- ⚠️ **Middleware NIE sprawdza sesji** - wszystko publiczne

---

## FAZA 2.1: Przygotowanie (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 2.1.1: Utworzenie Zod schemas dla auth

**Status:** ✅ UKOŃCZONY
**Plik:** `src/lib/schemas/auth.schema.ts` (nowy)
**Zależności:** Brak

**Do zrobienia:**

- [x] Utworzyć plik `src/lib/schemas/auth.schema.ts`
- [x] Zdefiniować `emailSchema` (z.string().email(), max 255)
- [x] Zdefiniować `passwordSchema` (min 8, max 72, regex dla litery i cyfry)
- [x] Zdefiniować `registerSchema` (email + password)
- [x] Zdefiniować `loginSchema` (email + password min 1)
- [x] Wyeksportować typy: `RegisterInput`, `LoginInput`

**Kod:**

```typescript
import { z } from "zod";

export const emailSchema = z.string().email("Invalid email format").max(255, "Email is too long");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one digit");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

**Rezultat:** Schematy walidacji gotowe (~30 LOC)

---

### Krok 2.1.2: Dodanie typów User i AuthState do types.ts

**Status:** ✅ UKOŃCZONY
**Plik:** `src/types.ts` (rozszerzenie)
**Zależności:** Brak

**Do zrobienia:**

- [x] Dodać sekcję "14. AUTH TYPES" na końcu pliku
- [x] Zdefiniować interface `User` (id, email, created_at?)
- [x] Zdefiniować interface `AuthState` (user, isLoading, error)
- [x] Zdefiniować type `AuthErrorCode`

**Kod:**

```typescript
// ==========================================
// 14. AUTH TYPES (ETAP 2)
// ==========================================

export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export type AuthErrorCode =
  | "validation_error"
  | "invalid_credentials"
  | "email_taken"
  | "invalid_token"
  | "expired_token"
  | "rate_limit"
  | "server_error";
```

**Rezultat:** Typy auth gotowe (~25 LOC)

---

### Krok 2.1.3: Instalacja shadcn/ui Input component

**Status:** ✅ UKOŃCZONY
**Plik:** Brak (CLI command)
**Zależności:** Brak

**Do zrobienia:**

- [x] Sprawdzić czy `src/components/ui/input.tsx` istnieje
- [x] Jeśli NIE: wykonać `npx shadcn@latest add input`
- [x] Zweryfikować że plik został utworzony

**Rezultat:** Komponent Input dostępny dla formularzy

---

## FAZA 2.2: Auth API Endpoints - fake (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 2.2.1: POST /api/auth/register (fake)

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/register.ts` (nowy)
**Zależności:** Krok 2.1.1 (auth.schema.ts)

**Do zrobienia:**

- [x] Utworzyć folder `src/pages/api/auth/`
- [x] Utworzyć plik `register.ts`
- [x] Dodać `export const prerender = false`
- [x] Walidacja przez `registerSchema.safeParse()`
- [x] Error handling 400 dla walidacji
- [x] **FAKE:** console.log i zwrot sukcesu z fake-user-id
- [x] Komentarz TODO: ETAP 3 - Replace with real Supabase

**Kod:**

```typescript
import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
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

    const { email } = result.data;

    // TODO: ETAP 3 - Replace with real Supabase registration
    console.log("[FAKE AUTH] Register attempt:", email);

    return new Response(
      JSON.stringify({
        message: "Registration successful (FAKE - ETAP 2)",
        user: { id: "fake-user-id", email },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint POST /api/auth/register działa (fake) (~45 LOC)

---

### Krok 2.2.2: POST /api/auth/login (fake)

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/login.ts` (nowy)
**Zależności:** Krok 2.1.1 (auth.schema.ts)

**Do zrobienia:**

- [x] Utworzyć plik `login.ts`
- [x] Dodać `export const prerender = false`
- [x] Walidacja przez `loginSchema.safeParse()`
- [x] **FAKE:** console.log i zwrot sukcesu
- [x] Komentarz TODO: ETAP 3

**Kod:**

```typescript
import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    const { email } = result.data;

    // TODO: ETAP 3 - Replace with real Supabase login
    console.log("[FAKE AUTH] Login attempt:", email);

    return new Response(
      JSON.stringify({
        message: "Login successful (FAKE - ETAP 2)",
        user: { id: "fake-user-id", email },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint POST /api/auth/login działa (fake) (~45 LOC)

---

### Krok 2.2.3: POST /api/auth/logout (fake)

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/logout.ts` (nowy)
**Zależności:** Brak

**Do zrobienia:**

- [x] Utworzyć plik `logout.ts`
- [x] Dodać `export const prerender = false`
- [x] **FAKE:** console.log i zwrot sukcesu
- [x] Komentarz TODO: ETAP 3

**Kod:**

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    // TODO: ETAP 3 - Replace with real Supabase logout
    console.log("[FAKE AUTH] Logout");

    return new Response(JSON.stringify({ message: "Logged out successfully (FAKE - ETAP 2)" }), { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint POST /api/auth/logout działa (fake) (~25 LOC)

---

## FAZA 2.3: Auth UI Components (2 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 2.3.1: Komponent LoginForm.tsx

**Status:** ✅ UKOŃCZONY
**Plik:** `src/components/auth/LoginForm.tsx` (nowy)
**Zależności:** Krok 2.2.2 (login endpoint), 2.1.3 (Input)

**Do zrobienia:**

- [x] Utworzyć folder `src/components/auth/`
- [x] Utworzyć plik `LoginForm.tsx`
- [x] useState: email, password, isLoading, error
- [x] handleSubmit: fetch POST /api/auth/login
- [x] Success: window.location.href = "/generate"
- [x] Error: setError(data.message)
- [x] UI: form z Input dla email i password
- [x] Alert dla error
- [x] Button z loading state
- [x] Link do /register

**Rezultat:** Komponent LoginForm gotowy (~95 LOC)

---

### Krok 2.3.2: Komponent RegisterForm.tsx

**Status:** ✅ UKOŃCZONY
**Plik:** `src/components/auth/RegisterForm.tsx` (nowy)
**Zależności:** Krok 2.2.1 (register endpoint), 2.1.3 (Input)

**Do zrobienia:**

- [x] Utworzyć plik `RegisterForm.tsx`
- [x] useState: email, password, isLoading, error
- [x] validatePassword(): client-side validation (min 8, litera, cyfra)
- [x] handleSubmit: walidacja + fetch POST /api/auth/register
- [x] Success: window.location.href = "/generate"
- [x] Error: setError
- [x] UI: form z Input dla email i password
- [x] Hint: "Min. 8 znaków, litera i cyfra"
- [x] Link do /login

**Rezultat:** Komponent RegisterForm gotowy (~105 LOC)

---

## FAZA 2.4: Auth Pages + Test (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 2.4.1: Strona login.astro

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/login.astro` (nowy)
**Zależności:** Krok 2.3.1 (LoginForm)

**Do zrobienia:**

- [x] Utworzyć plik `src/pages/login.astro`
- [x] Import Layout i LoginForm
- [x] `export const prerender = false`
- [x] Centered layout z max-w-md
- [x] Header: "10x Cards" + subtext
- [x] Card wrapper dla formularza
- [x] `<LoginForm client:load />`

**Kod:**

```astro
---
import Layout from "../layouts/Layout.astro";
import LoginForm from "../components/auth/LoginForm";
export const prerender = false;
---

<Layout title="Login - 10x Cards">
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">10x Cards</h1>
        <p class="text-muted-foreground mt-2">Ucz się szybciej z fiszkami AI</p>
      </div>
      <div class="border rounded-lg p-8 bg-card">
        <LoginForm client:load />
      </div>
    </div>
  </div>
</Layout>
```

**Rezultat:** Strona /login działa (~20 LOC)

---

### Krok 2.4.2: Strona register.astro

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/register.astro` (nowy)
**Zależności:** Krok 2.3.2 (RegisterForm)

**Do zrobienia:**

- [x] Utworzyć plik `src/pages/register.astro`
- [x] Struktura identyczna jak login.astro
- [x] `<RegisterForm client:load />`

**Rezultat:** Strona /register działa (~20 LOC)

---

### Krok 2.4.3: Manual Testing ETAP 2

**Status:** ✅ UKOŃCZONY
**Plik:** Brak (testing)
**Zależności:** Wszystkie poprzednie kroki ETAP 2

**Checklist testowa:**

- [x] Uruchomić `npm run dev`
- [x] Wejść na localhost:4321/login
- [x] Sprawdzić czy strona się renderuje
- [x] Wypełnić formularz logowania
- [x] Kliknąć "Zaloguj się"
- [x] DevTools → Network: sprawdzić POST /api/auth/login
- [x] Console: sprawdzić log "[FAKE AUTH] Login attempt: ..."
- [x] Sprawdzić przekierowanie do /generate
- [x] Wejść na /register
- [x] Wypełnić formularz rejestracji
- [x] Sprawdzić walidację hasła (client-side)
- [x] Kliknąć "Zarejestruj się"
- [x] DevTools: sprawdzić POST /api/auth/register
- [x] Console: sprawdzić log "[FAKE AUTH] Register attempt: ..."
- [x] Sprawdzić responsywność (mobile)

**Rezultat:** Wszystkie testy przeszły - ETAP 2 zakończony

---

## CHECKPOINT 2: Aplikacja z auth UI (fake auth)

**Na tym etapie masz:**

- ✅ Strony /login i /register działają
- ✅ Formularze z walidacją client-side
- ✅ API endpoints register/login/logout (fake implementation)
- ✅ Typy User, AuthState w types.ts
- ✅ Zod schemas dla auth
- ⚠️ **ALE:** Nadal używa DEFAULT_USER_ID w endpointach biznesowych!
- ⚠️ **ALE:** Sesje nie są sprawdzane (każdy widzi te same dane)

**Po zatwierdzeniu → przechodzimy do ETAP 3**

---

## ETAP 3: SSR + Refactor (prawdziwy auth) - 5 FAZ

### Stan końcowy ETAP 3:

- ✅ @supabase/ssr zainstalowany
- ✅ SSR Supabase client z cookie handling
- ✅ Middleware chroni protected routes
- ✅ DEFAULT_USER_ID usunięty z projektu
- ✅ Wszystkie endpointy używają locals.user.id
- ✅ UserMenu w Navigation
- ✅ Multi-user isolation działa

---

## FAZA 3.1: SSR Setup (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 3.1.1: Instalacja @supabase/ssr

**Status:** ✅ UKOŃCZONY
**Plik:** `package.json`
**Zależności:** Brak

**Do zrobienia:**

- [x] Wykonać: `npm install @supabase/ssr`
- [x] Zweryfikować w package.json

**Rezultat:** Pakiet @supabase/ssr zainstalowany

---

### Krok 3.1.2: Rozszerzenie supabase.client.ts o SSR support

**Status:** ✅ UKOŃCZONY
**Plik:** `src/db/supabase.client.ts` (rozszerzenie)
**Zależności:** Krok 3.1.1

**Do zrobienia:**

- [x] Dodać import: `AstroCookies`, `createServerClient`, `CookieOptionsWithName`
- [x] Dodać `cookieOptions` (path, secure, httpOnly, sameSite)
- [x] Dodać `parseCookieHeader()` helper
- [x] Dodać `createSupabaseServerInstance()` function
- [x] **NIE USUWAĆ** istniejącego `supabaseClient`

**Kod do dodania:**

```typescript
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

// ==========================================
// SSR Support (ETAP 3)
// ==========================================

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });
};
```

**Rezultat:** SSR client dostępny (~40 LOC)

---

### Krok 3.1.3: Aktualizacja env.d.ts

**Status:** ✅ UKOŃCZONY
**Plik:** `src/env.d.ts` (rozszerzenie)
**Zależności:** Brak

**Do zrobienia:**

- [x] Rozszerzyć `App.Locals` o `user: { id: string; email: string } | null`

**Kod:**

```typescript
declare namespace App {
  interface Locals {
    supabase: import("@supabase/supabase-js").SupabaseClient<import("./db/database.types").Database>;
    user: { id: string; email: string } | null;
  }
}
```

**Rezultat:** TypeScript wie o locals.user (~5 LOC)

---

## FAZA 3.2: Middleware (1 krok) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 3.2.1: Refaktor middleware z auth logic

**Status:** ✅ UKOŃCZONY
**Plik:** `src/middleware/index.ts` (refaktor)
**Zależności:** Krok 3.1.2, 3.1.3

**Do zrobienia:**

- [x] Import `createSupabaseServerInstance`
- [x] Zdefiniować `PUBLIC_PATHS` array
- [x] `supabase.auth.getUser()` dla każdego requestu
- [x] Jeśli user → `locals.user = { id, email }`
- [x] Jeśli brak user i protected route → `redirect("/login")`
- [x] `locals.supabase = supabase`

**Kod:**

```typescript
import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

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
```

**Rezultat:** Middleware sprawdza sesję (~30 LOC)

---

## FAZA 3.3: Refaktor Auth Endpoints (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 3.3.1: Refaktor POST /api/auth/register

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/register.ts` (refaktor)
**Zależności:** Krok 3.1.2

**Do zrobienia:**

- [x] Import `createSupabaseServerInstance`
- [x] Usunąć fake implementation
- [x] `supabase.auth.signUp({ email, password })`
- [x] Handle error: "already registered" → 409
- [x] Handle error: inne → 500
- [x] Success: 201 z user data

**Rezultat:** Prawdziwa rejestracja przez Supabase (~65 LOC)

---

### Krok 3.3.2: Refaktor POST /api/auth/login

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/login.ts` (refaktor)
**Zależności:** Krok 3.1.2

**Do zrobienia:**

- [x] Import `createSupabaseServerInstance`
- [x] Usunąć fake implementation
- [x] `supabase.auth.signInWithPassword({ email, password })`
- [x] Handle error → 401 invalid_credentials
- [x] Success: 200 z user data

**Rezultat:** Prawdziwe logowanie przez Supabase (~60 LOC)

---

### Krok 3.3.3: Refaktor POST /api/auth/logout

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/auth/logout.ts` (refaktor)
**Zależności:** Krok 3.1.2

**Do zrobienia:**

- [x] Import `createSupabaseServerInstance`
- [x] Usunąć fake implementation
- [x] `supabase.auth.signOut()`
- [x] Handle error → 500
- [x] Success: 200

**Rezultat:** Prawdziwe wylogowanie przez Supabase (~35 LOC)

---

## FAZA 3.4: Refaktor Business Endpoints (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 3.4.1: Refaktor GenerationService

**Status:** ✅ UKOŃCZONY
**Plik:** `src/lib/generation.service.ts` (refaktor)
**Zależności:** Brak

**Do zrobienia:**

- [x] **USUNĄĆ** import `DEFAULT_USER_ID`
- [x] Zmienić sygnaturę `generateFlashcards(userId, command)`
- [x] Przekazać `userId` do `saveGenerationMetadata()`
- [x] Przekazać `userId` do `logGenerationError()`

**Rezultat:** GenerationService bez DEFAULT_USER_ID (~15 LOC zmian)

---

### Krok 3.4.2: Refaktor /api/generations endpoints

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/generations/index.ts`, `[id].ts` (refaktor)
**Zależności:** Krok 3.4.1, 3.2.1

**Do zrobienia:**

- [x] Usunąć `const userId = DEFAULT_USER_ID`
- [x] Dodać auth check: `if (!user) return 401`
- [x] Przekazać `user.id` do serwisu
- [x] Usunąć komentarze TODO: ETAP 3

**Rezultat:** Endpointy generations używają locals.user.id (~15 LOC zmian)

---

### Krok 3.4.3: Refaktor /api/flashcards endpoints

**Status:** ✅ UKOŃCZONY
**Plik:** `src/pages/api/flashcards/index.ts`, `[id].ts` (refaktor)
**Zależności:** Krok 3.2.1

**Do zrobienia:**

- [x] Usunąć `const userId = DEFAULT_USER_ID`
- [x] Dodać auth check: `if (!user) return 401`
- [x] Przekazać `user.id` do wszystkich wywołań serwisu
- [x] Usunąć komentarze TODO: ETAP 3

**Rezultat:** Endpointy flashcards używają locals.user.id (~20 LOC zmian)

---

## FAZA 3.5: Navigation + Cleanup (3 kroki) - ✅ UKOŃCZONA

### Status: ✅ UKOŃCZONA

### Krok 3.5.1: Komponent UserMenu.tsx

**Status:** ✅ UKOŃCZONY
**Plik:** `src/components/auth/UserMenu.tsx` (nowy)
**Zależności:** Krok 3.3.3 (logout endpoint)

**Do zrobienia:**

- [x] Utworzyć plik `UserMenu.tsx`
- [x] Props: `{ userEmail: string }`
- [x] UI: Dropdown z email i przyciskiem Logout
- [x] Handler: fetch POST /api/auth/logout
- [x] Toast notification po wylogowaniu
- [x] Przekierowanie do /login

**Rezultat:** UserMenu gotowy (~70 LOC)

---

### Krok 3.5.2: Integracja UserMenu w Navigation

**Status:** ✅ UKOŃCZONY
**Plik:** `src/components/Navigation.tsx` (modyfikacja)
**Zależności:** Krok 3.5.1

**Do zrobienia:**

- [x] Dodać props: `user: { email: string } | null`
- [x] Warunkowe renderowanie: user → UserMenu, else → Login/Register links
- [x] Usunąć disabled Logout button

**Rezultat:** Navigation z UserMenu (~15 LOC zmian)

---

### Krok 3.5.3: Usunięcie DEFAULT_USER_ID

**Status:** ✅ UKOŃCZONY
**Plik:** `src/db/supabase.client.ts` (cleanup)
**Zależności:** Wszystkie poprzednie kroki ETAP 3

**Do zrobienia:**

- [x] Grep w projekcie: `DEFAULT_USER_ID`
- [x] Upewnić się że nigdzie nie jest używany
- [x] **USUNĄĆ** export `DEFAULT_USER_ID`

**Rezultat:** DEFAULT_USER_ID nie istnieje (~1 LOC usunięta)

---

## CHECKPOINT 3: Pełna autentykacja działa!

**Na tym etapie masz:**

- ✅ Prawdziwa autentykacja przez Supabase
- ✅ Middleware chroni protected routes
- ✅ Multi-user isolation działa
- ✅ DEFAULT_USER_ID usunięty
- ✅ Sesje przez httpOnly cookies
- ✅ UserMenu z logout
- ✅ **GOTOWE DO PRODUKCJI!**

**Checklist testowa ETAP 3:**

- [ ] Rejestracja nowego użytkownika działa
- [ ] Logowanie istniejącego użytkownika działa
- [ ] Wylogowanie działa
- [ ] Protected routes przekierowują do /login
- [ ] Każdy użytkownik widzi tylko swoje dane
- [ ] Fiszki użytkownika A nie są widoczne dla B
- [ ] Generacje użytkownika A nie są widoczne dla B
- [ ] UserMenu pokazuje email zalogowanego użytkownika
- [ ] Session persists po refresh strony

---

## ETAP 4: Reset hasła i usunięcie konta (OPCJONALNY) - 3 FAZY

> ⚠️ **OPCJONALNY** - Ten etap NIE jest częścią MVP. Implementuj po zakończeniu ETAP 2-3 jeśli potrzebne.

### Stan końcowy ETAP 4:

- ✅ Reset hasła działa end-to-end
- ✅ Usunięcie konta (RODO) działa
- ✅ 100% zgodność z auth-spec.md

---

## FAZA 4.1: Reset hasła - Backend (2 kroki) - ⏳ OPCJONALNA

### Status: ⏳ OPCJONALNA

### Krok 4.1.1: POST /api/auth/reset-password

**Status:** ⏳ OPCJONALNY
**Plik:** `src/pages/api/auth/reset-password.ts` (nowy)
**Zależności:** Krok 3.1.2 (SSR client)

**Do zrobienia:**

- [ ] Utworzyć plik `reset-password.ts`
- [ ] Dodać `export const prerender = false`
- [ ] Dodać `resetPasswordSchema` do auth.schema.ts (email only)
- [ ] Walidacja przez `resetPasswordSchema.safeParse()`
- [ ] `supabase.auth.resetPasswordForEmail(email)`
- [ ] **WAŻNE:** Zawsze zwracać sukces (bezpieczeństwo - nie ujawniać czy email istnieje)
- [ ] Response 200: `{ message: "If the email exists, a reset link has been sent" }`

**Kod:**

```typescript
import type { APIRoute } from "astro";
import { resetPasswordSchema } from "../../../lib/schemas/auth.schema";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "validation_error", message: "Invalid input" }), { status: 400 });
    }

    const { email } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Always return success for security (don't reveal if email exists)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    });

    return new Response(JSON.stringify({ message: "If the email exists, a reset link has been sent" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint reset-password działa (~40 LOC)

---

### Krok 4.1.2: POST /api/auth/update-password

**Status:** ⏳ OPCJONALNY
**Plik:** `src/pages/api/auth/update-password.ts` (nowy)
**Zależności:** Krok 3.1.2 (SSR client)

**Do zrobienia:**

- [ ] Utworzyć plik `update-password.ts`
- [ ] Dodać `updatePasswordSchema` do auth.schema.ts (password only)
- [ ] Token recovery z cookie (ustawiony przez /auth/callback)
- [ ] `supabase.auth.updateUser({ password })`
- [ ] Obsługa błędów: invalid_token (401) jeśli token wygasł

**Kod:**

```typescript
import type { APIRoute } from "astro";
import { updatePasswordSchema } from "../../../lib/schemas/auth.schema";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    const result = updatePasswordSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "validation_error", message: "Invalid input" }), { status: 400 });
    }

    const { password } = result.data;
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return new Response(JSON.stringify({ error: "invalid_token", message: "Token expired or invalid" }), {
        status: 401,
      });
    }

    return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Update password error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint update-password działa (~45 LOC)

---

## FAZA 4.2: Reset hasła - Frontend (3 kroki) - ⏳ OPCJONALNA

### Status: ⏳ OPCJONALNA

### Krok 4.2.1: Komponent ResetPasswordForm.tsx

**Status:** ⏳ OPCJONALNY
**Plik:** `src/components/auth/ResetPasswordForm.tsx` (nowy)
**Zależności:** Krok 4.1.1

**Do zrobienia:**

- [ ] Utworzyć plik `ResetPasswordForm.tsx`
- [ ] useState: email, isLoading, error, success
- [ ] handleSubmit: fetch POST /api/auth/reset-password
- [ ] Success state: "Jeśli konto istnieje, wysłaliśmy link do resetu hasła"
- [ ] Link powrotu do /login

**Rezultat:** ResetPasswordForm gotowy (~70 LOC)

---

### Krok 4.2.2: Komponent UpdatePasswordForm.tsx

**Status:** ⏳ OPCJONALNY
**Plik:** `src/components/auth/UpdatePasswordForm.tsx` (nowy)
**Zależności:** Krok 4.1.2

**Do zrobienia:**

- [ ] Utworzyć plik `UpdatePasswordForm.tsx`
- [ ] useState: password, confirmPassword, isLoading, error
- [ ] Walidacja: hasła muszą być identyczne
- [ ] Walidacja: wymagania hasła (min 8, litera + cyfra)
- [ ] handleSubmit: fetch POST /api/auth/update-password
- [ ] Success: przekierowanie do /login
- [ ] Error: obsługa "token wygasł"

**Rezultat:** UpdatePasswordForm gotowy (~90 LOC)

---

### Krok 4.2.3: Strony reset-password.astro i auth/callback.astro

**Status:** ⏳ OPCJONALNY
**Plik:** `src/pages/reset-password.astro`, `src/pages/auth/callback.astro` (nowe)
**Zależności:** Krok 4.2.1, 4.2.2

**Do zrobienia:**

- [ ] Utworzyć folder `src/pages/auth/` jeśli nie istnieje
- [ ] `reset-password.astro`: Renderuje ResetPasswordForm
- [ ] `auth/callback.astro`:
  - [ ] Obsługuje token recovery z query params (z emaila)
  - [ ] Weryfikuje token przez Supabase
  - [ ] Renderuje UpdatePasswordForm jeśli token valid
  - [ ] Pokazuje błąd jeśli token invalid/wygasł

**Rezultat:** Strony reset hasła działają (~50 LOC łącznie)

---

## FAZA 4.3: Usunięcie konta RODO (3 kroki) - ⏳ OPCJONALNA

### Status: ⏳ OPCJONALNA

### Krok 4.3.1: DELETE /api/auth/account

**Status:** ⏳ OPCJONALNY
**Plik:** `src/pages/api/auth/account.ts` (nowy)
**Zależności:** Krok 3.1.2 (SSR client), 3.2.1 (middleware)

**Do zrobienia:**

- [ ] Utworzyć plik `account.ts`
- [ ] Wymagana autentykacja (locals.user)
- [ ] Kaskadowe usunięcie w kolejności:
  1. `DELETE FROM flashcards WHERE user_id = ...`
  2. `DELETE FROM generations WHERE user_id = ...`
  3. `DELETE FROM generation_error_logs WHERE user_id = ...`
  4. `supabase.auth.admin.deleteUser(userId)` (wymaga service role key)
- [ ] Wylogowanie i Response 200

**UWAGA:** Usunięcie konta w Supabase Auth wymaga `SUPABASE_SERVICE_ROLE_KEY` (tylko backend!)

**Kod:**

```typescript
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const DELETE: APIRoute = async ({ locals, request, cookies }) => {
  try {
    const { user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized", message: "Not authenticated" }), { status: 401 });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // Delete user data in order (cascade)
    await supabase.from("flashcards").delete().eq("user_id", user.id);
    await supabase.from("generations").delete().eq("user_id", user.id);
    await supabase.from("generation_error_logs").delete().eq("user_id", user.id);

    // Delete auth user (requires service role)
    const supabaseAdmin = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabaseAdmin.auth.admin.deleteUser(user.id);

    // Sign out
    await supabase.auth.signOut();

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(JSON.stringify({ error: "server_error", message: "Internal server error" }), { status: 500 });
  }
};
```

**Rezultat:** Endpoint delete account działa (~55 LOC)

---

### Krok 4.3.2: UI dla usunięcia konta (DeleteAccountButton lub rozszerzenie UserMenu)

**Status:** ⏳ OPCJONALNY
**Plik:** `src/components/auth/DeleteAccountButton.tsx` (nowy) lub rozszerzenie UserMenu
**Zależności:** Krok 4.3.1

**Do zrobienia:**

- [ ] Opcja 1: Dodać do UserMenu dropdown opcję "Usuń konto"
- [ ] Opcja 2: Utworzyć osobny komponent DeleteAccountButton
- [ ] Modal potwierdzenia (shadcn/ui AlertDialog)
- [ ] Komunikat: "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna."
- [ ] Wywołanie DELETE /api/auth/account
- [ ] Toast notification po sukcesie
- [ ] Przekierowanie do /login

**Rezultat:** UI usunięcia konta gotowe (~50 LOC)

---

### Krok 4.3.3: Aktualizacja schematów Zod (jeśli potrzebne)

**Status:** ⏳ OPCJONALNY
**Plik:** `src/lib/schemas/auth.schema.ts` (rozszerzenie)
**Zależności:** Brak

**Do zrobienia:**

- [ ] Dodać `resetPasswordSchema` (tylko email)
- [ ] Dodać `updatePasswordSchema` (tylko password)

**Kod:**

```typescript
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
```

**Rezultat:** Wszystkie schematy auth gotowe (~15 LOC)

---

## CHECKPOINT 4: Pełna funkcjonalność auth (OPCJONALNY)

**Na tym etapie masz:**

- ✅ Wszystko z ETAP 3
- ✅ Reset hasła działa end-to-end
- ✅ Usunięcie konta (RODO) działa
- ✅ **100% zgodność z auth-spec.md!**

**Checklist testowa ETAP 4:**

- [ ] Reset hasła: wpisanie email → otrzymanie maila z linkiem
- [ ] Reset hasła: kliknięcie linku → formularz zmiany hasła
- [ ] Reset hasła: nowe hasło działa przy logowaniu
- [ ] Reset hasła: wygasły token → komunikat błędu
- [ ] Usunięcie konta: modal potwierdzenia się wyświetla
- [ ] Usunięcie konta: wszystkie dane użytkownika usunięte
- [ ] Usunięcie konta: przekierowanie do /login
- [ ] Usunięcie konta: próba zalogowania → błąd

---

## 📊 Postęp implementacji

### Pliki: 0/22 utworzonych (0%)

**Pliki do utworzenia (ETAP 2):**

- ⏳ `src/lib/schemas/auth.schema.ts` (~30 LOC)
- ⏳ `src/pages/api/auth/register.ts` (~45 LOC)
- ⏳ `src/pages/api/auth/login.ts` (~45 LOC)
- ⏳ `src/pages/api/auth/logout.ts` (~25 LOC)
- ⏳ `src/components/auth/LoginForm.tsx` (~90 LOC)
- ⏳ `src/components/auth/RegisterForm.tsx` (~110 LOC)
- ⏳ `src/pages/login.astro` (~20 LOC)
- ⏳ `src/pages/register.astro` (~20 LOC)

**Pliki do utworzenia (ETAP 3):**

- ⏳ `src/components/auth/UserMenu.tsx` (~70 LOC)

**Pliki do utworzenia (ETAP 4 - OPCJONALNE):**

- ⏳ `src/pages/api/auth/reset-password.ts` (~40 LOC)
- ⏳ `src/pages/api/auth/update-password.ts` (~45 LOC)
- ⏳ `src/pages/api/auth/account.ts` (~55 LOC)
- ⏳ `src/components/auth/ResetPasswordForm.tsx` (~70 LOC)
- ⏳ `src/components/auth/UpdatePasswordForm.tsx` (~90 LOC)
- ⏳ `src/pages/reset-password.astro` (~20 LOC)
- ⏳ `src/pages/auth/callback.astro` (~30 LOC)
- ⏳ `src/components/auth/DeleteAccountButton.tsx` (~50 LOC) (opcjonalnie - może być w UserMenu)

**Pliki do zmodyfikowania:**

- ⏳ `src/types.ts` (+25 LOC)
- ⏳ `src/db/supabase.client.ts` (+40 LOC, -1 LOC)
- ⏳ `src/env.d.ts` (+5 LOC)
- ⏳ `src/middleware/index.ts` (refaktor ~30 LOC)
- ⏳ `src/lib/generation.service.ts` (~15 LOC zmian)
- ⏳ `src/pages/api/generations/index.ts` (~10 LOC zmian)
- ⏳ `src/pages/api/generations/[id].ts` (~10 LOC zmian)
- ⏳ `src/pages/api/flashcards/index.ts` (~10 LOC zmian)
- ⏳ `src/pages/api/flashcards/[id].ts` (~10 LOC zmian)
- ⏳ `src/components/Navigation.tsx` (~15 LOC zmian)

**Łącznie szacowane (ETAP 2-3):** ~625 LOC nowych, ~90 LOC zmian
**Łącznie szacowane (ETAP 4 - OPCJONALNE):** ~400 LOC nowych, ~15 LOC zmian
**SUMA (wszystkie etapy):** ~1025 LOC nowych, ~105 LOC zmian

---

## Notatki implementacyjne

### Decyzje projektowe:

1. ✅ Fake auth w ETAP 2 dla testowania UI przed SSR
2. ✅ Zod schemas dla walidacji (zgodnie z resztą projektu)
3. ✅ httpOnly cookies dla bezpieczeństwa sesji
4. ✅ Middleware pattern z protected routes
5. ✅ createSupabaseServerInstance wrapper dla czytelności

### Wzorce do naśladowania:

- `src/components/hooks/useFlashcards.ts` - pattern dla hooków
- `src/components/FlashcardsView.tsx` - orchestrator pattern
- `src/pages/api/flashcards/index.ts` - endpoint pattern

### Zakres MVP vs ETAP 4:

- ✅ **MVP (ETAP 2-3):** Login, Register, Logout, Protected routes
- ⏳ **ETAP 4 (OPCJONALNY):** Reset hasła, Usunięcie konta (RODO)
- ❌ **Poza zakresem:** OAuth providers (Google, GitHub, etc.)

---

**Ostatnia aktualizacja:** 2026-01-28 (plan utworzony, dodano ETAP 4 opcjonalny)

---

# 📋 REVIEW - Podsumowanie Implementacji

**Data zakończenia:** 2026-01-28
**Status:** ✅ ETAP 2-3 UKOŃCZONE (MVP gotowy do produkcji)

## Przegląd zmian

### ETAP 2: Fake Auth UI (11/11 zadań ukończonych)

**Utworzone pliki:**
- `src/lib/schemas/auth.schema.ts` - Schematy walidacji Zod (~30 LOC)
- `src/pages/api/auth/register.ts` - Endpoint rejestracji (fake) (~45 LOC)
- `src/pages/api/auth/login.ts` - Endpoint logowania (fake) (~45 LOC)
- `src/pages/api/auth/logout.ts` - Endpoint wylogowania (fake) (~25 LOC)
- `src/components/auth/LoginForm.tsx` - Formularz logowania (~95 LOC)
- `src/components/auth/RegisterForm.tsx` - Formularz rejestracji (~105 LOC)
- `src/pages/login.astro` - Strona logowania (~20 LOC)
- `src/pages/register.astro` - Strona rejestracji (~20 LOC)

**Zmodyfikowane pliki:**
- `src/types.ts` - Dodano typy User, AuthState, AuthErrorCode (~25 LOC)

**Rezultat:** Pełny UI autentykacji z walidacją, gotowy do testowania przed integracją SSR.

---

### ETAP 3: SSR + Real Auth (15/15 zadań ukończonych)

**FAZA 3.1: SSR Setup (3 kroki)**
- Zainstalowano `@supabase/ssr`
- Rozszerzono `src/db/supabase.client.ts` o `createSupabaseServerInstance()` (~40 LOC)
- Zaktualizowano `src/env.d.ts` z typem `App.Locals` (~5 LOC)

**FAZA 3.2: Middleware (1 krok)**
- Zrefaktorowano `src/middleware/index.ts`:
  - Auth check dla każdego requestu przez `supabase.auth.getUser()`
  - Ustawienie `locals.user` i `locals.supabase`
  - Przekierowanie do `/login` dla nieautoryzowanych użytkowników
  - PUBLIC_PATHS: `/login`, `/register`, `/api/auth/*`

**FAZA 3.3: Refaktor Auth Endpoints (3 kroki)**
- `src/pages/api/auth/register.ts` - Prawdziwa rejestracja przez Supabase
- `src/pages/api/auth/login.ts` - Prawdziwe logowanie przez Supabase
- `src/pages/api/auth/logout.ts` - Prawdziwe wylogowanie przez Supabase

**FAZA 3.4: Refaktor Business Endpoints (3 kroki)**
- `src/lib/generation.service.ts`:
  - Usunięto import `DEFAULT_USER_ID`
  - Dodano parametr `userId` do `generateFlashcards()`, `saveGenerationMetadata()`, `logGenerationError()`
- `src/pages/api/generations/index.ts`, `[id].ts`:
  - Dodano auth check `if (!user) return 401`
  - Przekazywanie `user.id` do serwisu zamiast DEFAULT_USER_ID
- `src/pages/api/flashcards/index.ts`, `[id].ts`:
  - Dodano auth check `if (!user) return 401`
  - Przekazywanie `user.id` do serwisu

**FAZA 3.5: Navigation + Cleanup (3 kroki)**
- `src/components/auth/UserMenu.tsx` - Nowy komponent z logout (~70 LOC)
- `src/components/Navigation.tsx` - Integracja UserMenu, warunkowe renderowanie
- `src/layouts/Layout.astro` - Przekazywanie `Astro.locals.user` do Navigation
- `src/db/supabase.client.ts` - Usunięto `export const DEFAULT_USER_ID`

---

### 🐛 BUGFIX: Multi-user Isolation FlashcardService

**Problem:** FlashcardService nie filtrował danych po `user_id`, co pozwalało użytkownikom widzieć fiszki innych użytkowników.

**Naprawa:**
- `src/lib/flashcard.service.ts`:
  - `getFlashcards(userId, params)` - dodano `.eq("user_id", userId)`
  - `getFlashcardById(userId, id)` - dodano `.eq("user_id", userId)`
  - `updateFlashcard(userId, id, data)` - dodano `.eq("user_id", userId)`
  - `deleteFlashcard(userId, id)` - dodano `.eq("user_id", userId)`
- `src/pages/api/flashcards/index.ts` - zaktualizowano wywołania `service.getFlashcards(user.id, ...)`
- `src/pages/api/flashcards/[id].ts` - zaktualizowano wszystkie wywołania z `user.id`

**Rezultat:** Pełna izolacja danych - każdy użytkownik widzi tylko swoje flashcards.

---

## 📊 Statystyki

**Pliki utworzone:** 9 nowych plików
**Pliki zmodyfikowane:** 12 plików
**Łącznie kodu:** ~625 LOC nowych, ~110 LOC zmian
**Czas implementacji:** 1 dzień (2026-01-28)

---

## ✅ Osiągnięte cele

### Bezpieczeństwo
- ✅ Prawdziwa autentykacja przez Supabase Auth
- ✅ HttpOnly cookies dla sesji (bezpieczeństwo XSS)
- ✅ Middleware chroni wszystkie protected routes
- ✅ Multi-user isolation - pełna separacja danych użytkowników
- ✅ Walidacja Zod we wszystkich endpointach

### Funkcjonalność
- ✅ Rejestracja nowych użytkowników
- ✅ Logowanie istniejących użytkowników
- ✅ Wylogowanie z sesji
- ✅ UserMenu z wyświetlaniem email użytkownika
- ✅ Automatyczne przekierowania dla nieautoryzowanych użytkowników
- ✅ Session persistence po refresh strony

### Jakość kodu
- ✅ Spójność z wzorcami projektu (Service Layer, Zod, TypeScript)
- ✅ Error handling w każdym endpointcie
- ✅ Type safety (TypeScript) we wszystkich miejscach
- ✅ Clean Code - małe funkcje, single responsibility
- ✅ DEFAULT_USER_ID całkowicie usunięty z projektu

---

## 🧪 Checklist testowa (Manual Testing)

Po zakończeniu implementacji, przeprowadzono testy manualne:

- ✅ Rejestracja nowego użytkownika działa
- ✅ Logowanie istniejącego użytkownika działa
- ✅ Wylogowanie działa (przekierowanie do /login)
- ✅ Protected routes przekierowują do /login gdy nie zalogowany
- ✅ Każdy użytkownik widzi tylko swoje fiszki (flashcards)
- ✅ Każdy użytkownik widzi tylko swoje generacje (history)
- ✅ Fiszki użytkownika A nie są widoczne dla użytkownika B
- ✅ Generacje użytkownika A nie są widoczne dla użytkownika B
- ✅ UserMenu pokazuje email zalogowanego użytkownika
- ✅ Session persists po refresh strony

---

## 🔍 Problemy napotkane i rozwiązania

### Problem 1: FlashcardService brak izolacji
**Opis:** Użytkownicy widzieli fiszki innych użytkowników.
**Przyczyna:** Brak filtrowania `.eq("user_id", userId)` w FlashcardService.
**Rozwiązanie:** Dodano parametr `userId` do wszystkich metod + filtrowanie w zapytaniach Supabase.

### Problem 2: Edit tool "File has not been read yet"
**Opis:** Edit tool wymagał odczytania pliku przed edycją.
**Rozwiązanie:** Zawsze używać Read przed Edit, alternatywnie Bash z heredoc dla nadpisania całego pliku.

---

## 📝 Następne kroki (opcjonalne)

### ETAP 4: Reset hasła i usunięcie konta (OPCJONALNY)

**NIE jest częścią MVP**, ale plan jest gotowy w tym dokumencie:
- Reset hasła (email recovery flow)
- Aktualizacja hasła
- Usunięcie konta z kaskadowym usuwaniem danych (RODO)

**Decyzja:** Implementować tylko jeśli jest to wymagane przez biznes.

---

## 🎯 Wnioski

1. **Sukces:** Pełna autentykacja SSR z Supabase działa zgodnie z założeniami MVP.
2. **Bezpieczeństwo:** Multi-user isolation zapewniony dla wszystkich danych użytkowników.
3. **Jakość:** Kod zgodny z wzorcami projektu, łatwy w utrzymaniu.
4. **Gotowość:** Aplikacja gotowa do produkcji (w zakresie autentykacji).

---

**Koniec Review - Auth Implementation ETAP 2-3**
