# Plan Implementacji: ETAP 2 i ETAP 3 - Autentykacja (z checkpointem do testowania)

**Data utworzenia:** 2026-01-28
**Status:** ⏳ GOTOWY DO IMPLEMENTACJI
**Strategia:** ETAP 2 (UI + fake auth) → TEST → ETAP 3 (SSR + prawdziwy auth)
**Zgodność z:** mvp-implementation-plan-2026-01-27.md, auth-spec.md, Cursor rules

---

## ⚠️ Elementy z auth-spec.md nieuwzględnione w ETAP 2-3

Następujące elementy z `auth-spec.md` **NIE są** w tym planie (do implementacji później lub jako ETAP 4):

- ❌ **Reset hasła**: POST `/api/auth/reset-password`, POST `/api/auth/update-password`
- ❌ **Usunięcie konta (RODO)**: DELETE `/api/auth/account`
- ❌ **Komponenty**: `ResetPasswordForm.tsx`, `UpdatePasswordForm.tsx`
- ❌ **Strony**: `/reset-password.astro`, `/auth/callback.astro`
- ❌ **AuthLayout.astro**: Dedykowany layout dla stron autentykacji (opcjonalny)

**Uwaga:** Te elementy są opisane w `auth-spec.md` i `auth-endpoint-implementation-plan.md`, ale nie są częścią MVP w tym planie. Zobacz ETAP 4 poniżej dla opcjonalnej implementacji.

---

## 🎯 Strategia implementacji (2 etapy z checkpointem)

### **ETAP 2: Auth UI i Endpoints (fake auth z DEFAULT_USER_ID)**

**Cel:** Przetestować UI i formularze zanim dodamy prawdziwy auth

**Co zostanie zaimplementowane:**

- ✅ Strony /login i /register z formularzami
- ✅ Komponenty LoginForm, RegisterForm
- ✅ API endpoints: register, login, logout
- ✅ Zod validation schemas
- ✅ Typy User i AuthState
- ⚠️ **ALE:** Używa DEFAULT_USER_ID (fake auth)
- ⚠️ **ALE:** Middleware NIE sprawdza sesji
- ⚠️ **ALE:** Wszyscy użytkownicy widzą te same dane

**Checkpoint 2:** Możesz przetestować czy UI działa, formularze walidują, strony się renderują

---

### **ETAP 3: SSR + Refactor (prawdziwy auth)**

**Cel:** Dodać prawdziwą autentykację z session management

**Co zostanie zaimplementowane:**

- ✅ Instalacja @supabase/ssr
- ✅ SSR Supabase client z cookie handling
- ✅ Middleware z auth checks i protected routes
- ✅ Usunięcie DEFAULT_USER_ID z całego projektu
- ✅ Refaktor wszystkich endpointów do używania locals.user.id
- ✅ UserMenu w Navigation
- ✅ Multi-user isolation działa

**Checkpoint 3:** Prawdziwa autentykacja działa, każdy użytkownik widzi tylko swoje dane

---

## 📋 ETAP 2: Auth UI i Endpoints (11 zadań)

### Stan końcowy ETAP 2:

- ✅ Strony /login i /register działają
- ✅ Formularze mają walidację client-side
- ✅ API endpoints register/login/logout działają
- ✅ Zod schemas dla auth
- ✅ Typy User i AuthState w types.ts
- ⚠️ **Nadal używa DEFAULT_USER_ID** - fake auth
- ⚠️ **Middleware NIE sprawdza sesji** - wszystko publiczne
- ⚠️ **Multi-user isolation NIE działa** - to będzie w ETAP 3

---

### **ETAP 2.1: Przygotowanie (3 zadania)**

#### ✅ Zadanie 2.1.1: Utworzenie Zod schemas dla auth

**Plik:** `src/lib/schemas/auth.schema.ts` (nowy)
**Zależności:** Brak

**Co zrobić:**

- Utworzyć plik `src/lib/schemas/auth.schema.ts`
- Zdefiniować `emailSchema`:
  ```typescript
  export const emailSchema = z.string().email("Invalid email format").max(255, "Email is too long");
  ```
- Zdefiniować `passwordSchema`:
  ```typescript
  export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one digit");
  ```
- Zdefiniować `registerSchema`:
  ```typescript
  export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });
  ```
- Zdefiniować `loginSchema`:
  ```typescript
  export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  });
  ```

**Zgodność:** auth-endpoint-implementation-plan.md sekcja 3.2

**Rezultat:** Schematy walidacji gotowe (~50 LOC)

---

#### ✅ Zadanie 2.1.2: Dodanie typów User i AuthState do types.ts

**Plik:** `src/types.ts` (rozszerzenie)
**Zależności:** Brak

**Co zrobić:**

- Dodać na końcu pliku:

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

**Zgodność:** auth-endpoint-implementation-plan.md sekcja 3.1

**Rezultat:** Typy auth gotowe (~30 LOC)

---

#### ✅ Zadanie 2.1.3: Instalacja shadcn/ui Input component

**Plik:** Brak (CLI command)
**Zależności:** Brak

**Co zrobić:**

- Sprawdzić czy `src/components/ui/input.tsx` istnieje
- Jeśli NIE: wykonać `npx shadcn@latest add input`
- Zweryfikować że plik został utworzony

**Rezultat:** Komponent Input dostępny dla formularzy

---

### **ETAP 2.2: Auth API Endpoints (fake auth) (3 zadania)**

#### ✅ Zadanie 2.2.1: POST /api/auth/register (fake)

**Plik:** `src/pages/api/auth/register.ts` (nowy)
**Zależności:** Zadanie 2.1.1 (auth.schema.ts)

**Co zrobić:**

- Utworzyć folder `src/pages/api/auth/`
- Utworzyć plik `register.ts`
- Dodać `export const prerender = false`
- **FAKE IMPLEMENTATION** (bez prawdziwego Supabase):

```typescript
import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validation
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

    const { email, password } = result.data;

    // TODO: ETAP 3 - Replace with real Supabase registration
    // For now, just return success (fake registration)
    console.log("[FAKE AUTH] Register attempt:", email);

    return new Response(
      JSON.stringify({
        message: "Registration successful (FAKE - ETAP 2)",
        user: {
          id: "fake-user-id",
          email: email,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**UWAGA:** To jest fake implementation! W ETAP 3 zamienimy na prawdziwy Supabase.

**Rezultat:** Endpoint POST /api/auth/register działa (fake) (~50 LOC)

---

#### ✅ Zadanie 2.2.2: POST /api/auth/login (fake)

**Plik:** `src/pages/api/auth/login.ts` (nowy)
**Zależności:** Zadanie 2.1.1 (auth.schema.ts)

**Co zrobić:**

- Utworzyć plik `login.ts`
- **FAKE IMPLEMENTATION**:

```typescript
import type { APIRoute } from "astro";
import { loginSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // Validation
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

    // TODO: ETAP 3 - Replace with real Supabase login
    // For now, accept any credentials (fake login)
    console.log("[FAKE AUTH] Login attempt:", email);

    return new Response(
      JSON.stringify({
        message: "Login successful (FAKE - ETAP 2)",
        user: {
          id: "fake-user-id",
          email: email,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**Rezultat:** Endpoint POST /api/auth/login działa (fake) (~50 LOC)

---

#### ✅ Zadanie 2.2.3: POST /api/auth/logout (fake)

**Plik:** `src/pages/api/auth/logout.ts` (nowy)
**Zależności:** Brak

**Co zrobić:**

- Utworzyć plik `logout.ts`
- **FAKE IMPLEMENTATION**:

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  try {
    // TODO: ETAP 3 - Replace with real Supabase logout
    // For now, just return success (fake logout)
    console.log("[FAKE AUTH] Logout");

    return new Response(
      JSON.stringify({
        message: "Logged out successfully (FAKE - ETAP 2)",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**Rezultat:** Endpoint POST /api/auth/logout działa (fake) (~30 LOC)

---

### **ETAP 2.3: Auth UI Components (2 zadania)**

#### ✅ Zadanie 2.3.1: Komponent LoginForm.tsx

**Plik:** `src/components/auth/LoginForm.tsx` (nowy)
**Zależności:** Zadanie 2.2.2 (POST /api/auth/login), 2.1.3 (Input component)

**Co zrobić:**

- Utworzyć folder `src/components/auth/`
- Utworzyć plik `LoginForm.tsx`
- Implementacja:

```typescript
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Success - redirect to /generate
      window.location.href = "/generate";
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Zaloguj się</h2>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Logowanie..." : "Zaloguj się"}
      </Button>

      <div className="text-center text-sm">
        <a href="#" className="text-muted-foreground hover:underline">
          Zapomniałeś hasła?
        </a>
      </div>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Nie masz konta? </span>
        <a href="/register" className="font-medium hover:underline">
          Zarejestruj się
        </a>
      </div>
    </form>
  );
}
```

**Zgodność:** auth-spec.md sekcja 2.3.2, 2.6.1

**Rezultat:** Komponent LoginForm gotowy (~100 LOC)

---

#### ✅ Zadanie 2.3.2: Komponent RegisterForm.tsx

**Plik:** `src/components/auth/RegisterForm.tsx` (nowy)
**Zależności:** Zadanie 2.2.1 (POST /api/auth/register), 2.1.3 (Input component)

**Co zrobić:**

- Utworzyć plik `RegisterForm.tsx`
- Implementacja (podobna do LoginForm):

```typescript
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side validation
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Hasło musi mieć co najmniej 8 znaków";
    if (!/[a-zA-Z]/.test(pwd)) return "Hasło musi zawierać literę";
    if (!/[0-9]/.test(pwd)) return "Hasło musi zawierać cyfrę";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // Success - redirect to /generate
      window.location.href = "/generate";
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Utwórz konto</h2>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Min. 8 znaków, litera i cyfra
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Rejestracja..." : "Zarejestruj się"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Masz już konto? </span>
        <a href="/login" className="font-medium hover:underline">
          Zaloguj się
        </a>
      </div>
    </form>
  );
}
```

**Zgodność:** auth-spec.md sekcja 2.3.2, 2.6.2

**Rezultat:** Komponent RegisterForm gotowy (~120 LOC)

---

### **ETAP 2.4: Auth UI Pages (2 zadania)**

#### ✅ Zadanie 2.4.1: Strona login.astro

**Plik:** `src/pages/login.astro` (nowy)
**Zależności:** Zadanie 2.3.1 (LoginForm)

**Co zrobić:**

- Utworzyć plik `src/pages/login.astro`

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

**Zgodność:** auth-spec.md sekcja 2.1.1, 2.6.1

**Rezultat:** Strona /login działa (~25 LOC)

---

#### ✅ Zadanie 2.4.2: Strona register.astro

**Plik:** `src/pages/register.astro` (nowy)
**Zależności:** Zadanie 2.3.2 (RegisterForm)

**Co zrobić:**

- Utworzyć plik `src/pages/register.astro`

```astro
---
import Layout from "../layouts/Layout.astro";
import RegisterForm from "../components/auth/RegisterForm";
export const prerender = false;
---

<Layout title="Register - 10x Cards">
  <div class="min-h-screen flex items-center justify-center bg-background px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">10x Cards</h1>
        <p class="text-muted-foreground mt-2">Ucz się szybciej z fiszkami AI</p>
      </div>

      <div class="border rounded-lg p-8 bg-card">
        <RegisterForm client:load />
      </div>
    </div>
  </div>
</Layout>
```

**Zgodność:** auth-spec.md sekcja 2.1.1, 2.6.2

**Rezultat:** Strona /register działa (~25 LOC)

---

### **ETAP 2.5: Test Manual (1 zadanie)**

#### ✅ Zadanie 2.5.1: Manual Testing ETAP 2

**Plik:** Brak (testing)
**Zależności:** Wszystkie poprzednie zadania ETAP 2

**Co zrobić:**

- [ ] Uruchomić `npm run dev`
- [ ] Wejść na localhost:4321/login
- [ ] Sprawdzić czy strona się renderuje
- [ ] Wypełnić formularz logowania
- [ ] Kliknąć "Zaloguj się"
- [ ] Sprawdzić czy wywołanie POST /api/auth/login działa (DevTools → Network)
- [ ] Sprawdzić console: powinien być log "[FAKE AUTH] Login attempt: ..."
- [ ] Sprawdzić przekierowanie do /generate
- [ ] Wejść na /register
- [ ] Wypełnić formularz rejestracji
- [ ] Sprawdzić walidację hasła (client-side)
- [ ] Kliknąć "Zarejestruj się"
- [ ] Sprawdzić czy wywołanie POST /api/auth/register działa
- [ ] Sprawdzić console: powinien być log "[FAKE AUTH] Register attempt: ..."

**Rezultat:** Wszystkie testy przeszły - ETAP 2 zakończony

---

## 🎉 CHECKPOINT 2: Aplikacja z auth UI (fake auth)

**Na tym etapie masz:**

- ✅ Strony /login i /register działają
- ✅ Formularze z walidacją client-side
- ✅ API endpoints register/login/logout (fake implementation)
- ✅ Typy User, AuthState w types.ts
- ✅ Zod schemas dla auth
- ⚠️ **ALE:** Nadal używa DEFAULT_USER_ID w endpointach biznesowych!
- ⚠️ **ALE:** Sesje nie są sprawdzane (każdy widzi te same dane)
- ⚠️ **ALE:** Middleware NIE chroni tras

**To przygotowanie pod ETAP 3.**

**🧪 TERAZ TY TESTUJESZ:**

- Czy strony się renderują?
- Czy formularze wyglądają OK?
- Czy walidacja działa?
- Czy wszystko jest responsywne?

**Po zatwierdzeniu → przechodzimy do ETAP 3**

---

## 📋 ETAP 3: SSR + Refactor (prawdziwy auth) (15 zadań)

### Stan końcowy ETAP 3:

- ✅ @supabase/ssr zainstalowany
- ✅ SSR Supabase client z cookie handling
- ✅ Middleware chroni protected routes
- ✅ DEFAULT_USER_ID usunięty z projektu
- ✅ Wszystkie endpointy używają locals.user.id
- ✅ UserMenu w Navigation
- ✅ Multi-user isolation działa
- ✅ Prawdziwa autentykacja end-to-end

---

### **ETAP 3.1: Instalacja i SSR Setup (3 zadania)**

#### ✅ Zadanie 3.1.1: Instalacja @supabase/ssr

**Plik:** `package.json`
**Zależności:** Brak

**Co zrobić:**

- Wykonać: `npm install @supabase/ssr`
- Zweryfikować w package.json że pakiet został dodany

**Rezultat:** Pakiet @supabase/ssr zainstalowany

---

#### ✅ Zadanie 3.1.2: Rozszerzenie supabase.client.ts o SSR support

**Plik:** `src/db/supabase.client.ts` (rozszerzenie)
**Zależności:** Zadanie 3.1.1

**Co zrobić:**

- Dodać import:

```typescript
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
```

- Dodać na końcu pliku:

```typescript
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

// NOTE: Wrapper around @supabase/ssr createServerClient for Astro context
// auth-spec.md używa nazwy createServerClient, ale tutaj używamy wrappera createSupabaseServerInstance
// dla czytelności i zgodności z konwencją projektu
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
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
  return supabase;
};
```

- **NIE USUWAĆ** istniejącego `supabaseClient`

**Zgodność:** supabase-auth.mdc sekcja 1

**Rezultat:** SSR client dostępny (~45 LOC)

---

#### ✅ Zadanie 3.1.3: Aktualizacja env.d.ts

**Plik:** `src/env.d.ts` (rozszerzenie)
**Zależności:** Brak

**Co zrobić:**

- Rozszerzyć `App.Locals`:

```typescript
namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: { id: string; email: string } | null; // NOWE
  }
}
```

**Rezultat:** TypeScript wie o locals.user (~5 LOC)

---

### **ETAP 3.2: Middleware z Auth Checks (1 zadanie)**

#### ✅ Zadanie 3.2.1: Refaktor middleware z auth logic

**Plik:** `src/middleware/index.ts` (refaktor)
**Zależności:** Zadanie 3.1.2, 3.1.3

**Co zrobić:**

- Zastąpić całą zawartość pliku:

```typescript
import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // IMPORTANT: Always get user session first
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email!,
      id: user.id,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname) && !url.pathname.startsWith("/api/auth/")) {
    // Redirect to login for protected routes
    return redirect("/login");
  }

  locals.supabase = supabase;
  return next();
});
```

**Zgodność:** supabase-auth.mdc sekcja 2

**Rezultat:** Middleware sprawdza sesję (~35 LOC)

---

### **ETAP 3.3: Refaktor Auth Endpoints (prawdziwy Supabase) (3 zadania)**

#### ✅ Zadanie 3.3.1: Refaktor POST /api/auth/register

**Plik:** `src/pages/api/auth/register.ts` (refaktor)
**Zależności:** Zadanie 3.1.2

**Co zrobić:**

- Zastąpić fake implementation prawdziwym Supabase:

```typescript
import type { APIRoute } from "astro";
import { registerSchema } from "../../../lib/schemas/auth.schema";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const { email, password } = result.data;

    // Real Supabase registration
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Handle specific Supabase errors
      if (error.message.includes("already registered")) {
        return new Response(
          JSON.stringify({
            error: "email_taken",
            message: "User with this email already exists",
          }),
          { status: 409 }
        );
      }

      return new Response(
        JSON.stringify({
          error: "server_error",
          message: error.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Registration successful",
        user: {
          id: data.user!.id,
          email: data.user!.email!,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**Rezultat:** Prawdziwa rejestracja przez Supabase (~70 LOC)

---

#### ✅ Zadanie 3.3.2: Refaktor POST /api/auth/login

**Plik:** `src/pages/api/auth/login.ts` (refaktor)
**Zależności:** Zadanie 3.1.2

**Co zrobić:**

- Zastąpić fake implementation:

```typescript
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

    // Real Supabase login
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "invalid_credentials",
          message: "Invalid email or password",
        }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**Rezultat:** Prawdziwe logowanie przez Supabase (~65 LOC)

---

#### ✅ Zadanie 3.3.3: Refaktor POST /api/auth/logout

**Plik:** `src/pages/api/auth/logout.ts` (refaktor)
**Zależności:** Zadanie 3.1.2

**Co zrobić:**

- Zastąpić fake implementation:

```typescript
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Real Supabase logout
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(
        JSON.stringify({
          error: "server_error",
          message: error.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Logged out successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({
        error: "server_error",
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
};
```

**Rezultat:** Prawdziwe wylogowanie przez Supabase (~40 LOC)

---

### **ETAP 3.4: Refaktor Services (2 zadania)**

#### ✅ Zadanie 3.4.1: Refaktor GenerationService

**Plik:** `src/lib/generation.service.ts` (refaktor)
**Zależności:** Brak

**Co zrobić:**

- **USUNĄĆ** import `DEFAULT_USER_ID`
- Zmienić sygnaturę `generateFlashcards()`:
  - **PRZED:** `generateFlashcards(command: GenerateFlashcardsCommand)`
  - **PO:** `generateFlashcards(userId: string, command: GenerateFlashcardsCommand)`
- Przekazać `userId` do `saveGenerationMetadata(userId, ...)`
- Przekazać `userId` do `logGenerationError(userId, ...)`
- Wszystkie inserty używają `userId` z parametru

**Rezultat:** GenerationService bez DEFAULT_USER_ID (~20 LOC zmian)

---

#### ✅ Zadanie 3.4.2: Weryfikacja FlashcardService

**Plik:** `src/lib/flashcard.service.ts` (weryfikacja)
**Zależności:** Brak

**Co zrobić:**

- Sprawdzić czy NIE używa DEFAULT_USER_ID
- Wszystkie metody już przyjmują `userId` ✅
- Upewnić się że query używają userId z parametru

**Rezultat:** FlashcardService zweryfikowany

---

### **ETAP 3.5: Refaktor API Endpoints (6 zadań)**

#### ✅ Zadanie 3.5.1: Refaktor POST /api/generations

**Plik:** `src/pages/api/generations/index.ts`
**Zależności:** Zadanie 3.4.1, 3.2.1

**Co zrobić:**

- Usunąć: `const userId = DEFAULT_USER_ID;`
- Dodać auth check:

```typescript
const { user } = context.locals;
if (!user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
}
```

- Przekazać `user.id` do serwisu:

```typescript
generationService.generateFlashcards(user.id, command);
```

**Rezultat:** POST /api/generations używa locals.user.id (~10 LOC)

---

#### ✅ Zadanie 3.5.2: Odkomentować auth w GET /api/generations

**Plik:** `src/pages/api/generations/index.ts`
**Zależności:** Zadanie 3.4.1, 3.2.1

**Co zrobić:**

- Usunąć: `const userId = DEFAULT_USER_ID;`
- Odkomentować blok `// TODO: ETAP 3`
- Przekazać `user.id` do serwisu

**Rezultat:** GET /api/generations używa locals.user.id (~5 LOC)

---

#### ✅ Zadanie 3.5.3: Odkomentować auth w GET /api/generations/[id]

**Plik:** `src/pages/api/generations/[id].ts`
**Zależności:** Zadanie 3.4.1, 3.2.1

**Co zrobić:**

- Usunąć: `const userId = DEFAULT_USER_ID;`
- Odkomentować blok `// TODO: ETAP 3`
- Przekazać `user.id` do serwisu

**Rezultat:** GET /api/generations/[id] używa locals.user.id (~5 LOC)

---

#### ✅ Zadanie 3.5.4: Odkomentować auth w POST /api/flashcards

**Plik:** `src/pages/api/flashcards/index.ts`
**Zależności:** Zadanie 3.2.1

**Co zrobić:**

- Odkomentować blok `// TODO: ETAP 3` w POST handler
- Przekazać `user.id` do `flashcardService.createBatch(user.id, ...)`

**Rezultat:** POST /api/flashcards używa locals.user.id (~5 LOC)

---

#### ✅ Zadanie 3.5.5: Odkomentować auth w GET /api/flashcards

**Plik:** `src/pages/api/flashcards/index.ts`
**Zależności:** Zadanie 3.2.1

**Co zrobić:**

- Odkomentować blok `// TODO: ETAP 3` w GET handler
- Przekazać `user.id` do `flashcardService.getFlashcards(user.id, ...)`

**Rezultat:** GET /api/flashcards używa locals.user.id (~5 LOC)

---

#### ✅ Zadanie 3.5.6: Odkomentować auth w /api/flashcards/[id]

**Plik:** `src/pages/api/flashcards/[id].ts`
**Zależności:** Zadanie 3.2.1

**Co zrobić:**

- Odkomentować bloki `// TODO: ETAP 3` we wszystkich handlerach
- Przekazać `user.id` do wszystkich wywołań serwisu

**Rezultat:** Wszystkie handlery używają locals.user.id (~15 LOC)

---

### **ETAP 3.6: Navigation + Cleanup (3 zadania)**

#### ✅ Zadanie 3.6.1: Utworzenie UserMenu

**Plik:** `src/components/auth/UserMenu.tsx` (nowy)
**Zależności:** Zadanie 3.3.3 (logout endpoint)

**Co zrobić:**

- Utworzyć plik `UserMenu.tsx`
- Props: `{ userEmail: string }`
- Implementacja z dropdown menu (shadcn/ui)
- Handler logout wywołuje POST /api/auth/logout
- Toast notification po wylogowaniu
- Przekierowanie do /login

**Rezultat:** UserMenu gotowy (~80 LOC)

---

#### ✅ Zadanie 3.6.2: Integracja UserMenu w Navigation

**Plik:** `src/components/Navigation.tsx` (modyfikacja lub nowy)
**Zależności:** Zadanie 3.6.1

**Co zrobić:**

- Jeśli Navigation nie istnieje - utworzyć
- Dodać UserMenu w prawym górnym rogu
- Pokazywać gdy user zalogowany
- Dla niezalogowanych: linki do /login i /register

**Rezultat:** Navigation z UserMenu działa (~20 LOC)

---

#### ✅ Zadanie 3.6.3: Usunięcie DEFAULT_USER_ID

**Plik:** `src/db/supabase.client.ts` (cleanup)
**Zależności:** Wszystkie zadania 3.5.x

**Co zrobić:**

- **USUNĄĆ** export `DEFAULT_USER_ID`
- Grep w projekcie: `DEFAULT_USER_ID`
- Jeśli znaleziono - naprawić przed usunięciem

**Rezultat:** DEFAULT_USER_ID nie istnieje (~1 LOC usunięta)

---

## 🎉 CHECKPOINT 3: Pełna autentykacja działa! ✅

**Na tym etapie masz:**

- ✅ Prawdziwa autentykacja przez Supabase
- ✅ Middleware chroni protected routes
- ✅ Multi-user isolation działa
- ✅ DEFAULT_USER_ID usunięty
- ✅ Sesje przez httpOnly cookies
- ✅ UserMenu z logout
- ✅ **GOTOWE DO PRODUKCJI!**

---

## 📋 ETAP 4: Reset hasła i usunięcie konta (opcjonalny) (8 zadań)

**Status:** ⏳ OPCJONALNY - do implementacji po ETAP 3

**Cel:** Dodać funkcjonalność resetu hasła i usunięcia konta zgodnie z auth-spec.md

---

### **ETAP 4.1: Reset hasła - Backend (2 zadania)**

#### ✅ Zadanie 4.1.1: POST /api/auth/reset-password

**Plik:** `src/pages/api/auth/reset-password.ts` (nowy)
**Zależności:** Zadanie 2.1.1 (auth.schema.ts), 3.1.2 (SSR client)

**Co zrobić:**

- Utworzyć plik `reset-password.ts`
- Dodać `export const prerender = false`
- Użyć `resetPasswordSchema` z auth.schema.ts (email)
- Wywołać `supabase.auth.resetPasswordForEmail(email)`
- **WAŻNE:** Zawsze zwracać sukces (bezpieczeństwo - nie ujawniać czy email istnieje)
- Response 200: `{ message: "If the email exists, a reset link has been sent" }`

**Zgodność:** auth-spec.md sekcja 3.2.4, auth-endpoint-plan.md sekcja 2.4

**Rezultat:** Endpoint reset-password działa (~40 LOC)

---

#### ✅ Zadanie 4.1.2: POST /api/auth/update-password

**Plik:** `src/pages/api/auth/update-password.ts` (nowy)
**Zależności:** Zadanie 2.1.1 (auth.schema.ts), 3.1.2 (SSR client)

**Co zrobić:**

- Utworzyć plik `update-password.ts`
- Dodać `export const prerender = false`
- Użyć `updatePasswordSchema` z auth.schema.ts (password)
- Token recovery z cookie (ustawiony przez /auth/callback)
- Wywołać `supabase.auth.updateUser({ password })`
- Obsługa błędów: invalid_token (401) jeśli token wygasł

**Zgodność:** auth-spec.md sekcja 3.2.5, auth-endpoint-plan.md sekcja 2.5

**Rezultat:** Endpoint update-password działa (~50 LOC)

---

### **ETAP 4.2: Reset hasła - Frontend (3 zadania)**

#### ✅ Zadanie 4.2.1: Komponent ResetPasswordForm.tsx

**Plik:** `src/components/auth/ResetPasswordForm.tsx` (nowy)
**Zależności:** Zadanie 4.1.1, 2.1.3 (Input component)

**Co zrobić:**

- Utworzyć plik `ResetPasswordForm.tsx`
- Formularz z polem email
- Wywołanie POST /api/auth/reset-password
- Komunikat sukcesu: "Jeśli konto istnieje, wysłaliśmy link do resetu hasła"
- Link powrotu do /login

**Zgodność:** auth-spec.md sekcja 2.3.2, 2.6.3

**Rezultat:** ResetPasswordForm gotowy (~80 LOC)

---

#### ✅ Zadanie 4.2.2: Komponent UpdatePasswordForm.tsx

**Plik:** `src/components/auth/UpdatePasswordForm.tsx` (nowy)
**Zależności:** Zadanie 4.1.2, 2.1.3 (Input component)

**Co zrobić:**

- Utworzyć plik `UpdatePasswordForm.tsx`
- Formularz z polami: nowe hasło, powtórz hasło
- Walidacja: hasła muszą być identyczne
- Walidacja: wymagania hasła (min 8, litera + cyfra)
- Wywołanie POST /api/auth/update-password
- Przekierowanie do /login po sukcesie
- Obsługa błędów: token wygasł

**Zgodność:** auth-spec.md sekcja 2.3.2, 2.6.4

**Rezultat:** UpdatePasswordForm gotowy (~100 LOC)

---

#### ✅ Zadanie 4.2.3: Strony reset-password.astro i auth/callback.astro

**Pliki:** `src/pages/reset-password.astro`, `src/pages/auth/callback.astro` (nowe)
**Zależności:** Zadanie 4.2.1, 4.2.2

**Co zrobić:**

- Utworzyć folder `src/pages/auth/` jeśli nie istnieje
- `/reset-password.astro`: Renderuje ResetPasswordForm (podobnie jak login.astro)
- `/auth/callback.astro`:
  - Obsługuje token recovery z query params (z emaila)
  - Weryfikuje token przez Supabase
  - Renderuje UpdatePasswordForm jeśli token valid
  - Pokazuje błąd jeśli token invalid/wygasł

**Zgodność:** auth-spec.md sekcja 2.1.1, 2.6.3, 2.6.4

**Rezultat:** Strony reset hasła działają (~50 LOC)

---

### **ETAP 4.3: Usunięcie konta (RODO) (3 zadania)**

#### ✅ Zadanie 4.3.1: DELETE /api/auth/account

**Plik:** `src/pages/api/auth/account.ts` (nowy)
**Zależności:** Zadanie 3.1.2 (SSR client), 3.2.1 (middleware)

**Co zrobić:**

- Utworzyć plik `account.ts`
- Dodać `export const prerender = false`
- Wymagana autentykacja (locals.user)
- Kaskadowe usunięcie w kolejności:
  1. Wszystkie fiszki użytkownika (`DELETE FROM flashcards WHERE user_id = ...`)
  2. Wszystkie rekordy generacji (`DELETE FROM generations WHERE user_id = ...`)
  3. Logi błędów (`DELETE FROM generation_error_logs WHERE user_id = ...`)
  4. Konto w Supabase Auth (`supabase.auth.admin.deleteUser(userId)` - wymaga service role key)
- Wylogowanie i przekierowanie do /login

**UWAGA:** Usunięcie konta w Supabase Auth wymaga `SUPABASE_SERVICE_ROLE_KEY` (tylko backend, nigdy w kliencie!)

**Zgodność:** auth-spec.md sekcja 4.5, auth-endpoint-plan.md sekcja 2.6

**Rezultat:** Endpoint delete account działa (~60 LOC)

---

#### ✅ Zadanie 4.3.2: UI dla usunięcia konta

**Plik:** `src/components/auth/DeleteAccountButton.tsx` (nowy) lub rozszerzenie UserMenu
**Zależności:** Zadanie 4.3.1

**Co zrobić:**

- Opcja 1: Dodać do UserMenu dropdown opcję "Usuń konto"
- Opcja 2: Utworzyć osobny komponent DeleteAccountButton
- Modal potwierdzenia przed usunięciem (shadcn/ui Dialog)
- Komunikat: "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna."
- Wywołanie DELETE /api/auth/account
- Toast notification po sukcesie
- Przekierowanie do /login

**Zgodność:** auth-spec.md sekcja 4.5.2

**Rezultat:** UI usunięcia konta gotowe (~50 LOC)

---

#### ✅ Zadanie 4.3.3: Aktualizacja schematów Zod

**Plik:** `src/lib/schemas/auth.schema.ts` (rozszerzenie)
**Zależności:** Zadanie 2.1.1

**Co zrobić:**

- Sprawdzić czy `resetPasswordSchema` istnieje (powinien być z Zadania 2.1.1)
- Sprawdzić czy `updatePasswordSchema` istnieje (powinien być z Zadania 2.1.1)
- Jeśli NIE: dodać zgodnie z auth-spec.md sekcja 3.3.1:

  ```typescript
  export const resetPasswordSchema = z.object({
    email: emailSchema,
  });

  export const updatePasswordSchema = z.object({
    password: passwordSchema,
  });
  ```

**Rezultat:** Wszystkie schematy auth gotowe

---

## 🎉 CHECKPOINT 4: Pełna funkcjonalność auth! ✅

**Na tym etapie masz:**

- ✅ Wszystko z ETAP 3
- ✅ Reset hasła działa end-to-end
- ✅ Usunięcie konta (RODO) działa
- ✅ **100% zgodność z auth-spec.md!**

---

## 📊 Podsumowanie

### Łączne statystyki:

- **ETAP 2:** 11 zadań, ~425 LOC, 2-3h
- **ETAP 3:** 15 zadań, ~425 LOC, 4-5h
- **ETAP 4:** 8 zadań, ~380 LOC, 3-4h (opcjonalny)
- **SUMA (ETAP 2-3):** 26 zadań, ~850 LOC, 6-8h
- **SUMA (ETAP 2-4):** 34 zadania, ~1230 LOC, 9-12h

### Pliki utworzone (ETAP 2-3) - 9 plików:

1. `src/lib/schemas/auth.schema.ts`
2. `src/pages/api/auth/register.ts`
3. `src/pages/api/auth/login.ts`
4. `src/pages/api/auth/logout.ts`
5. `src/components/auth/LoginForm.tsx`
6. `src/components/auth/RegisterForm.tsx`
7. `src/components/auth/UserMenu.tsx`
8. `src/pages/login.astro`
9. `src/pages/register.astro`

### Pliki utworzone (ETAP 4 - opcjonalny) - 7 plików:

10. `src/pages/api/auth/reset-password.ts`
11. `src/pages/api/auth/update-password.ts`
12. `src/pages/api/auth/account.ts`
13. `src/components/auth/ResetPasswordForm.tsx`
14. `src/components/auth/UpdatePasswordForm.tsx`
15. `src/pages/reset-password.astro`
16. `src/pages/auth/callback.astro`
17. `src/components/auth/DeleteAccountButton.tsx` (opcjonalnie - może być w UserMenu)

### Pliki zmodyfikowane (11):

1. `package.json`
2. `src/types.ts`
3. `src/db/supabase.client.ts`
4. `src/env.d.ts`
5. `src/middleware/index.ts`
6. `src/lib/generation.service.ts`
7. `src/pages/api/generations/index.ts`
8. `src/pages/api/generations/[id].ts`
9. `src/pages/api/flashcards/index.ts`
10. `src/pages/api/flashcards/[id].ts`
11. `src/components/Navigation.tsx`

---

## 📝 Changelog

| Data       | Wersja | Opis                                                       |
| ---------- | ------ | ---------------------------------------------------------- |
| 2026-01-28 | 1.0    | Utworzenie planu z rozdziałem ETAP 2 / ETAP 3              |
| 2026-01-28 | 1.1    | Dodano CHECKPOINT 2 dla testowania UI przed SSR            |
| 2026-01-28 | 1.2    | Dodano sekcję o brakujących elementach z auth-spec.md      |
| 2026-01-28 | 1.3    | Dodano ETAP 4 (opcjonalny): reset hasła i usunięcie konta  |
| 2026-01-28 | 1.4    | Ujednolicono nazwę funkcji SSR z komentarzem wyjaśniającym |

**GOTOWY DO IMPLEMENTACJI! 🚀**
