# Szczegółowa Analiza Rozbieżności - 2026-01-27

## SZCZEGÓŁOWA ANALIZA ROZBIEŻNOŚCI

### ✅ Problem 1: Rozbieżność ścieżek auth `/login` vs `/auth/login` - ROZWIĄZANY

#### Co jest aktualnie:
Dokumentacja projektu zawiera **dwie różne konwencje** dla ścieżek stron autentykacji:

**W `auth-spec.md` (sekcja 2.1.1):**
```
| Ścieżka         | Plik                        |
|-----------------|------------------------------|
| /login          | src/pages/login.astro        |
| /register       | src/pages/register.astro     |
| /reset-password | src/pages/reset-password.astro|
```

**W `.cursor/rules/supabase-auth.mdc` (linia 104-113):**
```typescript
const PUBLIC_PATHS = [
  "/auth/login",      // ← prefix /auth/
  "/auth/register",
  "/auth/reset-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];
```

#### Jak powinno być:
Należy wybrać **jedną spójną konwencję** i zaktualizować wszystkie dokumenty.

#### Rekomendacja:
Używać **`/login`, `/register`, `/reset-password`** (bez prefixu `/auth/`) ponieważ:
1. `auth-spec.md` jest głównym dokumentem specyfikacji
2. Prostsze URL-e są bardziej user-friendly
3. Prefix `/auth/` zostawić tylko dla `/auth/callback` (obsługa tokenów)

#### Co trzeba zrobić:
1. **Zaktualizować** `.cursor/rules/supabase-auth.mdc` - zmienić PUBLIC_PATHS na:
   ```typescript
   const PUBLIC_PATHS = [
     "/login",
     "/register",
     "/reset-password",
     "/api/auth/login",
     "/api/auth/register",
     "/api/auth/reset-password",
   ];
   ```
2. **Przy implementacji** tworzyć pliki zgodnie z `auth-spec.md`

---

### 🔴 Problem 2: Wymóg `@supabase/ssr` vs aktualnie używany `@supabase/supabase-js`

#### Co jest aktualnie:

**Plik `src/db/supabase.client.ts`:**
```typescript
import { createClient } from "@supabase/supabase-js";  // ← stary pakiet

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const DEFAULT_USER_ID = "e7069c0f-532f-46da-a609-ce9f26999ef5";  // ← hardcoded!
```

**Plik `src/middleware/index.ts`:**
```typescript
import { supabaseClient } from "../db/supabase.client";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;  // ← prosty klient bez obsługi cookies
  return next();
});
```

#### Problem:
- `@supabase/supabase-js` to klient **browser-side** bez obsługi SSR cookies
- Nie obsługuje JWT tokenów w cookies (httpOnly, secure)
- Brak automatycznego odświeżania sesji
- **Nie działa autentykacja server-side!**

#### Jak powinno być (wg `.cursor/rules/supabase-auth.mdc`):

**Instalacja:**
```bash
npm install @supabase/ssr @supabase/supabase-js
```

**Plik `src/db/supabase.client.ts`:**
```typescript
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

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
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options)
          );
        },
      },
    }
  );
};
```

**Plik `src/middleware/index.ts`:**
```typescript
import { createSupabaseServerInstance } from "../db/supabase.client";
import { defineMiddleware } from "astro:middleware";

const PUBLIC_PATHS = ["/login", "/register", "/reset-password", "/api/auth/login", "/api/auth/register"];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  // Pobierz użytkownika z sesji
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    locals.user = { email: user.email, id: user.id };
  } else if (!PUBLIC_PATHS.some(path => url.pathname.startsWith(path))) {
    return redirect("/login");
  }

  locals.supabase = supabase;
  return next();
});
```

#### Co trzeba zrobić:
1. **Zainstalować** pakiet `@supabase/ssr`
2. **Zmodyfikować** `src/db/supabase.client.ts` - dodać `createSupabaseServerInstance`
3. **Zmodyfikować** `src/middleware/index.ts` - dodać logikę auth
4. **Zaktualizować** `src/env.d.ts` - dodać typ `user` do `App.Locals`
5. **Usunąć** `DEFAULT_USER_ID` po wdrożeniu auth

---

### 🔴 Problem 3: Serwisy importują Supabase bezpośrednio zamiast z `context.locals`

#### Co jest aktualnie:

**Plik `src/lib/generation.service.ts` (linie 1-4, 130-140):**
```typescript
import { DEFAULT_USER_ID } from "../db/supabase.client";  // ← import hardcoded ID

// ... w metodzie saveGenerationMetadata:
const { data: generation, error } = await this.supabase
  .from("generations")
  .insert({
    user_id: DEFAULT_USER_ID,  // ← używa hardcoded ID zamiast prawdziwego user_id!
    // ...
  })
```

**Plik `src/lib/flashcard.service.ts`:**
```typescript
constructor(private readonly supabase: SupabaseClient) {}

async createBatch(userId: string, flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[]> {
  // userId jest przekazywany, ale...
}
```

**Plik `src/pages/api/flashcards.ts` (nie pokazany wcześniej, ale prawdopodobnie):**
```typescript
// Prawdopodobnie używa DEFAULT_USER_ID przy tworzeniu serwisu
```

#### Problem wg `.cursor/rules/backend.mdc`:
> "Use supabase from context.locals in Astro routes instead of importing supabaseClient directly"

Serwisy:
1. Przyjmują `SupabaseClient` w konstruktorze ✅ (dobrze)
2. **ALE** używają `DEFAULT_USER_ID` zamiast pobierania `user.id` z sesji ❌

#### Jak powinno być:

**Plik `src/pages/api/generations.ts`:**
```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  // Sprawdź czy użytkownik jest zalogowany
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const generationService = new GenerationService(locals.supabase, {
    apiKey: import.meta.env.OPENROUTER_API_KEY,
  });

  // Przekaż user.id do serwisu
  const result = await generationService.generateFlashcards(
    body.source_text,
    locals.user.id  // ← prawdziwy user_id z sesji!
  );
};
```

**Plik `src/lib/generation.service.ts`:**
```typescript
// USUNĄĆ import DEFAULT_USER_ID

async generateFlashcards(sourceText: string, userId: string): Promise<GenerationCreateResponseDto> {
  // ...
  const generationId = await this.saveGenerationMetadata({
    userId,  // ← przekazany z endpointa
    // ...
  });
}

private async saveGenerationMetadata(data: {
  userId: string;  // ← dodane
  // ...
}): Promise<number> {
  const { data: generation, error } = await this.supabase
    .from("generations")
    .insert({
      user_id: data.userId,  // ← z parametru zamiast DEFAULT_USER_ID
      // ...
    })
}
```

#### Co trzeba zrobić:
1. **Zmodyfikować** `GenerationService`:
   - Usunąć import `DEFAULT_USER_ID`
   - Dodać parametr `userId` do metody `generateFlashcards()`
   - Przekazywać `userId` do `saveGenerationMetadata()` i `logGenerationError()`

2. **Zmodyfikować** `FlashcardService`:
   - Już przyjmuje `userId` ✅
   - Upewnić się, że nie używa `DEFAULT_USER_ID` nigdzie

3. **Zmodyfikować** endpointy API:
   - Sprawdzać `locals.user` przed operacjami
   - Przekazywać `locals.user.id` do serwisów

4. **Usunąć** `DEFAULT_USER_ID` z `src/db/supabase.client.ts` po refaktorze

---

## PLAN NAPRAWY ROZBIEŻNOŚCI

### Kolejność wykonania:

| # | Zadanie | Pliki do zmiany | Zależności |
|---|---------|-----------------|------------|
| R1 | Zainstalować `@supabase/ssr` | package.json | - |
| R2 | Zaktualizować supabase.client.ts | src/db/supabase.client.ts | R1 |
| R3 | Zaktualizować middleware | src/middleware/index.ts | R2 |
| R4 | Zaktualizować env.d.ts | src/env.d.ts | R3 |
| R5 | Refaktor GenerationService | src/lib/generation.service.ts | R3 |
| R6 | Refaktor endpointu generations | src/pages/api/generations.ts | R5 |
| R7 | Refaktor endpointu flashcards | src/pages/api/flashcards.ts | R3 |
| R8 | Usunąć DEFAULT_USER_ID | src/db/supabase.client.ts | R5, R6, R7 |
| R9 | Zaktualizować supabase-auth.mdc | .cursor/rules/supabase-auth.mdc | - |

**Uwaga:** Zadania R1-R8 są częścią FAZY 1 (Autentykacja) i muszą być wykonane łącznie.

---

## DECYZJA: Konwencja ścieżek auth

Pliki wskazują różne konwencje:
- `auth-spec.md`: `/login`, `/register`, `/reset-password`
- `supabase-auth.mdc`: `/auth/login`, `/auth/register`, `/auth/reset-password`

**DECYZJA:** Używać `/login`, `/register` (jak w auth-spec.md) dla prostszych URL.

**Uzasadnienie:**
1. `auth-spec.md` jest główną specyfikacją projektu
2. Prostsze URL-e (bez prefixu)
3. `/auth/callback` pozostaje dla obsługi tokenów recovery

---

## STATUS NAPRAWY - 2026-01-27

### ✅ Problem 1 - ROZWIĄZANY
**Data:** 2026-01-27
**Plik zmieniony:** `.cursor/rules/supabase-auth.mdc`
**Zmiany:**
- Zaktualizowano PUBLIC_PATHS: `/auth/login` → `/login`, `/auth/register` → `/register`, `/auth/reset-password` → `/reset-password`
- Zaktualizowano redirect URL: `return redirect("/auth/login")` → `return redirect("/login")`

**Szczegóły:** Zobacz [fix-auth-paths-plan.md](fix-auth-paths-plan.md)

### 🟡 Problem 2 - ODŁOŻONY DO ETAPU 3
Wymiana `@supabase/supabase-js` na `@supabase/ssr` dla prawidłowej obsługi server-side auth.

**DECYZJA:** Implementacja po zakończeniu ETAPU 1 (funkcjonalność biznesowa) i ETAPU 2 (auth UI).

**Uzasadnienie:**
- Łatwiejsze testowanie z hardcoded user
- Wszystkie endpointy najpierw przetestowane
- Auth jako ostatnia warstwa security

### 🟡 Problem 3 - ODŁOŻONY DO ETAPU 3
Refaktor serwisów aby używały `locals.user.id` zamiast `DEFAULT_USER_ID`.

**DECYZJA:** Implementacja razem z Problemem 2 w ETAPIE 3.

**Uzasadnienie:**
- Problem 3 wymaga rozwiązania Problemu 2 (SSR dostarcza `locals.user`)
- Na razie `DEFAULT_USER_ID` ułatwia rozwój i testowanie
- Po zaimplementowaniu auth UI będzie można bezpiecznie podmienić

---

## NOWA STRATEGIA IMPLEMENTACJI

Zobacz szczegółowy plan: [mvp-implementation-plan-2026-01-27.md](mvp-implementation-plan-2026-01-27.md)

**ETAP 1:** Kompletna funkcjonalność biznesowa (z DEFAULT_USER_ID)
- Flashcards CRUD + UI
- Generations READ
- Sesja nauki
- Nawigacja
→ **Rezultat:** Działająca aplikacja gotowa do testowania

**ETAP 2:** Auth UI + endpoints
- Strony login/register
- Auth API endpoints
→ **Rezultat:** Możliwość logowania/rejestracji

**ETAP 3:** SSR + refaktor (Problemy 2 i 3)
- @supabase/ssr
- Middleware auth check
- Usunięcie DEFAULT_USER_ID
→ **Rezultat:** Produkcyjne MVP z prawdziwą autentykacją
