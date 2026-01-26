# API Endpoint Implementation Plan: Flashcards CRUD

## 1. Przegląd punktu końcowego

Ten plan obejmuje implementację czterech endpointów REST API do zarządzania fiszkami:

1. **GET `/api/flashcards`** - Pobieranie listy fiszek z paginacją, filtrowaniem i sortowaniem
2. **GET `/api/flashcards/{id}`** - Pobieranie pojedynczej fiszki
3. **PUT `/api/flashcards/{id}`** - Aktualizacja istniejącej fiszki
4. **DELETE `/api/flashcards/{id}`** - Usuwanie fiszki

Wszystkie endpointy wymagają uwierzytelnienia i korzystają z Row-Level Security (RLS) Supabase.

## 2. Szczegóły żądania

### GET `/api/flashcards`

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards`
- **Parametry**:
  - Wymagane: brak
  - Opcjonalne:
    - `page` (number, default: 1) - numer strony
    - `limit` (number, default: 10, max: 100) - liczba rekordów na stronę
    - `sort` (string, default: "created_at") - pole sortowania
    - `order` (string, default: "desc") - kierunek sortowania ("asc" | "desc")
    - `source` (string) - filtr po źródle ("ai-full" | "ai-edited" | "manual")
    - `generation_id` (number) - filtr po ID generacji
- **Request Body**: brak

### GET `/api/flashcards/{id}`

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/flashcards/[id]`
- **Parametry**:
  - Wymagane: `id` (path parameter) - identyfikator fiszki (BIGINT)
  - Opcjonalne: brak
- **Request Body**: brak

### PUT `/api/flashcards/{id}`

- **Metoda HTTP**: PUT
- **Struktura URL**: `/api/flashcards/[id]`
- **Parametry**:
  - Wymagane: `id` (path parameter) - identyfikator fiszki (BIGINT)
  - Opcjonalne: brak
- **Request Body**:
  ```json
  {
    "front": "Updated question (max 200 chars)",
    "back": "Updated answer (max 500 chars)",
    "source": "ai-edited",
    "generation_id": 123
  }
  ```
  Wszystkie pola są opcjonalne (partial update).

### DELETE `/api/flashcards/{id}`

- **Metoda HTTP**: DELETE
- **Struktura URL**: `/api/flashcards/[id]`
- **Parametry**:
  - Wymagane: `id` (path parameter) - identyfikator fiszki (BIGINT)
  - Opcjonalne: brak
- **Request Body**: brak

## 3. Wykorzystywane typy

### Istniejące typy (src/types.ts)

```typescript
// Podstawowy typ fiszki z bazy danych
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];

// DTO dla fiszki zwracanej przez API
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

// DTO paginacji
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// Odpowiedź dla listy fiszek
export interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

// DTO aktualizacji fiszki
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: number | null;
}>;

// Typ źródła
export type Source = "ai-full" | "ai-edited" | "manual";
```

### Nowe typy do dodania (src/types.ts)

```typescript
// Parametry query dla listy fiszek
export interface FlashcardsQueryParams {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  source?: Source;
  generation_id?: number;
}
```

## 4. Szczegóły odpowiedzi

### GET `/api/flashcards` - Success (200)

```json
{
  "data": [
    {
      "id": 1,
      "front": "What is TypeScript?",
      "back": "A typed superset of JavaScript",
      "source": "manual",
      "generation_id": null,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### GET `/api/flashcards/{id}` - Success (200)

```json
{
  "id": 1,
  "front": "What is TypeScript?",
  "back": "A typed superset of JavaScript",
  "source": "manual",
  "generation_id": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### PUT `/api/flashcards/{id}` - Success (200)

```json
{
  "id": 1,
  "front": "Updated question",
  "back": "Updated answer",
  "source": "ai-edited",
  "generation_id": 123,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### DELETE `/api/flashcards/{id}` - Success (204)

Brak treści odpowiedzi (No Content).

### Kody błędów

| Kod | Opis | Kiedy występuje |
|-----|------|-----------------|
| 400 | Bad Request | Nieprawidłowe parametry lub dane wejściowe |
| 401 | Unauthorized | Brak sesji lub nieważny token |
| 404 | Not Found | Fiszka o podanym ID nie istnieje |
| 500 | Internal Server Error | Błąd serwera lub bazy danych |

## 5. Przepływ danych

### GET `/api/flashcards`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja query params (Zod)
4. Handler -> FlashcardsService.getFlashcards()
5. Service: Budowanie query z filtrami i sortowaniem
6. Service -> Supabase (SELECT z paginacją + COUNT)
7. Supabase -> RLS filtruje po user_id
8. Service -> Handler (dane + pagination)
9. Handler -> Response JSON (200)
```

### GET `/api/flashcards/{id}`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja path param (Zod)
4. Handler -> FlashcardsService.getFlashcardById()
5. Service -> Supabase (SELECT WHERE id = ?)
6. Supabase -> RLS filtruje po user_id
7. Service -> Handler (dane lub null)
8. Handler: if null -> 404, else -> Response JSON (200)
```

### PUT `/api/flashcards/{id}`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja path param + body (Zod)
4. Handler -> FlashcardsService.updateFlashcard()
5. Service: Sprawdzenie czy fiszka istnieje
6. Service -> Supabase (UPDATE WHERE id = ?)
7. Supabase -> RLS weryfikuje user_id
8. Service -> Handler (zaktualizowana fiszka lub null)
9. Handler: if null -> 404, else -> Response JSON (200)
```

### DELETE `/api/flashcards/{id}`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja path param (Zod)
4. Handler -> FlashcardsService.deleteFlashcard()
5. Service -> Supabase (DELETE WHERE id = ?)
6. Supabase -> RLS weryfikuje user_id
7. Service -> Handler (liczba usuniętych rekordów)
8. Handler: if 0 -> 404, else -> Response (204 No Content)
```

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- Wymagana ważna sesja Supabase
- Sprawdzenie sesji przez `context.locals.supabase.auth.getUser()`
- Brak sesji -> 401 Unauthorized

### Autoryzacja
- RLS w Supabase automatycznie filtruje rekordy po `user_id = auth.uid()`
- Użytkownik nie może uzyskać dostępu do fiszek innych użytkowników
- Operacje UPDATE/DELETE zwrócą 404 dla fiszek należących do innych użytkowników

### Walidacja danych wejściowych
- **Paginacja**: `page` >= 1, `limit` od 1 do 100
- **Sortowanie**: whitelist dozwolonych pól (`created_at`, `updated_at`, `front`, `back`)
- **Order**: tylko "asc" lub "desc"
- **ID**: liczba całkowita > 0
- **front**: max 200 znaków
- **back**: max 500 znaków
- **source**: enum ("ai-full", "ai-edited", "manual")
- **generation_id**: liczba całkowita > 0 lub null

### Ochrona przed atakami
- Whitelist pól sortowania zapobiega SQL injection
- Użycie Supabase SDK eliminuje ryzyko SQL injection
- Limit na parametr `limit` zapobiega DoS

## 7. Obsługa błędów

### Schemat błędu

```typescript
interface ErrorResponse {
  error: string;
  details?: string | Record<string, string[]>;
}
```

### Scenariusze błędów

| Endpoint | Scenariusz | Kod | Odpowiedź |
|----------|------------|-----|-----------|
| Wszystkie | Brak sesji | 401 | `{ "error": "Unauthorized" }` |
| GET list | Nieprawidłowy `page` | 400 | `{ "error": "Invalid page parameter" }` |
| GET list | Nieprawidłowy `limit` | 400 | `{ "error": "Invalid limit parameter" }` |
| GET list | Nieprawidłowe pole `sort` | 400 | `{ "error": "Invalid sort field" }` |
| GET list | Nieprawidłowy `order` | 400 | `{ "error": "Invalid order parameter" }` |
| GET list | Nieprawidłowy `source` filter | 400 | `{ "error": "Invalid source filter" }` |
| GET/PUT/DELETE | Nieprawidłowy format `id` | 400 | `{ "error": "Invalid id parameter" }` |
| GET/PUT/DELETE | Fiszka nie znaleziona | 404 | `{ "error": "Flashcard not found" }` |
| PUT | `front` przekracza 200 znaków | 400 | `{ "error": "Validation failed", "details": {...} }` |
| PUT | `back` przekracza 500 znaków | 400 | `{ "error": "Validation failed", "details": {...} }` |
| PUT | Nieprawidłowy `source` | 400 | `{ "error": "Validation failed", "details": {...} }` |
| PUT | Pusty request body | 400 | `{ "error": "Request body is required" }` |
| Wszystkie | Błąd bazy danych | 500 | `{ "error": "Internal server error" }` |

## 8. Rozważania dotyczące wydajności

### Paginacja
- Użycie `LIMIT` i `OFFSET` w zapytaniach SQL
- Domyślny limit: 10 rekordów
- Maksymalny limit: 100 rekordów

### Indeksy (już istniejące wg db-plan.md)
- Indeks na `user_id` w tabeli flashcards
- Indeks na `generation_id` w tabeli flashcards

### Optymalizacja zapytań
- Dla listy: osobne zapytanie COUNT dla total (może być kosztowne przy dużych zbiorach)
- Rozważenie cache'owania count dla często używanych filtrów

### Sortowanie
- Domyślne sortowanie po `created_at DESC` (najnowsze pierwsze)
- Sortowanie po polach z indeksami jest preferowane

## 9. Etapy wdrożenia

### Krok 1: Utworzenie schematów walidacji Zod

Plik: `src/lib/schemas/flashcards.schema.ts`

```typescript
import { z } from "zod";

// Dozwolone pola sortowania
const ALLOWED_SORT_FIELDS = ["created_at", "updated_at", "front", "back"] as const;

// Schema paginacji i filtrów dla GET /flashcards
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(ALLOWED_SORT_FIELDS).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  generation_id: z.coerce.number().int().positive().optional(),
});

// Schema dla path param ID
export const flashcardIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Schema dla body PUT /flashcards/{id}
export const flashcardUpdateSchema = z.object({
  front: z.string().max(200).optional(),
  back: z.string().max(500).optional(),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  generation_id: z.number().int().positive().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
});
```

### Krok 2: Utworzenie serwisu flashcards

Plik: `src/lib/services/flashcards.service.ts`

```typescript
import type { SupabaseClient } from "@/db/supabase.client";
import type { FlashcardDto, FlashcardsQueryParams, FlashcardUpdateDto } from "@/types";

export async function getFlashcards(
  supabase: SupabaseClient,
  params: FlashcardsQueryParams
): Promise<{ data: FlashcardDto[]; total: number }> {
  // Implementacja z filtrowaniem, sortowaniem, paginacją
}

export async function getFlashcardById(
  supabase: SupabaseClient,
  id: number
): Promise<FlashcardDto | null> {
  // Implementacja
}

export async function updateFlashcard(
  supabase: SupabaseClient,
  id: number,
  data: FlashcardUpdateDto
): Promise<FlashcardDto | null> {
  // Implementacja
}

export async function deleteFlashcard(
  supabase: SupabaseClient,
  id: number
): Promise<boolean> {
  // Implementacja - zwraca true jeśli usunięto
}
```

### Krok 3: Implementacja endpointu GET /api/flashcards

Plik: `src/pages/api/flashcards/index.ts`

```typescript
import type { APIRoute } from "astro";
import { flashcardsQuerySchema } from "@/lib/schemas/flashcards.schema";
import { getFlashcards } from "@/lib/services/flashcards.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  // 1. Sprawdź auth
  const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Waliduj query params
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);
  const validationResult = flashcardsQuerySchema.safeParse(queryParams);

  if (!validationResult.success) {
    return new Response(JSON.stringify({
      error: "Validation failed",
      details: validationResult.error.flatten().fieldErrors
    }), { status: 400 });
  }

  // 3. Wywołaj service
  const { data, total } = await getFlashcards(locals.supabase, validationResult.data);

  // 4. Zwróć odpowiedź
  return new Response(JSON.stringify({
    data,
    pagination: {
      page: validationResult.data.page,
      limit: validationResult.data.limit,
      total
    }
  }), { status: 200 });
};
```

### Krok 4: Implementacja endpointu GET/PUT/DELETE /api/flashcards/[id]

Plik: `src/pages/api/flashcards/[id].ts`

```typescript
import type { APIRoute } from "astro";
import { flashcardIdSchema, flashcardUpdateSchema } from "@/lib/schemas/flashcards.schema";
import { getFlashcardById, updateFlashcard, deleteFlashcard } from "@/lib/services/flashcards.service";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  // 1. Auth check
  // 2. Validate ID
  // 3. Call service
  // 4. Return 200 or 404
};

export const PUT: APIRoute = async ({ locals, params, request }) => {
  // 1. Auth check
  // 2. Validate ID
  // 3. Parse and validate body
  // 4. Call service
  // 5. Return 200 or 404
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  // 1. Auth check
  // 2. Validate ID
  // 3. Call service
  // 4. Return 204 or 404
};
```

### Krok 5: Dodanie typu FlashcardsQueryParams do types.ts

Plik: `src/types.ts` - dodać nowy typ.

### Krok 6: Testy manualne

1. **GET /flashcards**:
   - Test bez autoryzacji -> 401
   - Test z domyślnymi parametrami -> lista z paginacją
   - Test z różnymi parametrami sortowania
   - Test z filtrami source i generation_id
   - Test z nieprawidłowymi parametrami -> 400

2. **GET /flashcards/{id}**:
   - Test bez autoryzacji -> 401
   - Test z istniejącym ID -> 200 z danymi
   - Test z nieistniejącym ID -> 404
   - Test z nieprawidłowym ID -> 400

3. **PUT /flashcards/{id}**:
   - Test bez autoryzacji -> 401
   - Test aktualizacji pojedynczego pola -> 200
   - Test aktualizacji wielu pól -> 200
   - Test z nieistniejącym ID -> 404
   - Test z pustym body -> 400
   - Test z przekroczeniem limitów znaków -> 400

4. **DELETE /flashcards/{id}**:
   - Test bez autoryzacji -> 401
   - Test usunięcia istniejącej fiszki -> 204
   - Test usunięcia nieistniejącej fiszki -> 404

---

## Podsumowanie plików do utworzenia/modyfikacji

| Plik | Akcja |
|------|-------|
| `src/types.ts` | Modyfikacja - dodanie `FlashcardsQueryParams` |
| `src/lib/schemas/flashcards.schema.ts` | Utworzenie |
| `src/lib/services/flashcards.service.ts` | Utworzenie |
| `src/pages/api/flashcards/index.ts` | Utworzenie |
| `src/pages/api/flashcards/[id].ts` | Utworzenie |
