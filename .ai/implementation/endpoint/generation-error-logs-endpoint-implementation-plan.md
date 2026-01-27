# API Endpoint Implementation Plan: GET /generation-error-logs

## 1. Przegląd punktu końcowego

Endpoint służy do pobierania logów błędów generacji AI dla zalogowanego użytkownika. Umożliwia użytkownikom przeglądanie historii błędów, które wystąpiły podczas generowania fiszek przez AI.

- **GET `/api/generation-error-logs`** - Pobieranie listy logów błędów generacji dla zalogowanego użytkownika z obsługą paginacji

Endpoint wymaga uwierzytelnienia i korzysta z Row-Level Security (RLS) Supabase do automatycznego filtrowania danych po `user_id`.

---

## 2. Szczegóły żądania

### GET `/api/generation-error-logs`

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/generation-error-logs`
- **Parametry**:
  - Wymagane: brak
  - Opcjonalne:
    - `page` (number, default: 1) - numer strony
    - `limit` (number, default: 10, max: 100) - liczba rekordów na stronę
- **Request Body**: brak

---

## 3. Wykorzystywane typy

### Istniejące typy (src/types.ts)

```typescript
// Podstawowy typ z bazy danych
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// DTO dla logu błędu (już istnieje)
export type GenerationErrorLogDto = Pick<
  GenerationErrorLog,
  "id" | "error_code" | "error_message" | "model" | "source_text_hash" | "source_text_length" | "created_at" | "user_id"
>;

// DTO paginacji (już istnieje)
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}
```

### Nowe typy do dodania (src/types.ts)

```typescript
// Odpowiedź dla listy logów błędów
export interface GenerationErrorLogsListResponseDto {
  data: GenerationErrorLogDto[];
  pagination: PaginationDto;
}
```

---

## 4. Szczegóły odpowiedzi

### GET `/api/generation-error-logs` - Success (200)

```json
{
  "data": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "model": "gpt-4",
      "source_text_hash": "abc123...",
      "source_text_length": 2500,
      "error_code": "AI_SERVICE_ERROR",
      "error_message": "OpenRouter API returned 500: Internal server error",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

### Kody błędów

| Kod | Opis | Kiedy występuje |
|-----|------|-----------------|
| 400 | Bad Request | Nieprawidłowe parametry paginacji |
| 401 | Unauthorized | Brak sesji lub nieważny token |
| 500 | Internal Server Error | Błąd serwera lub bazy danych |

---

## 5. Przepływ danych

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja query params (Zod)
4. Handler -> GenerationErrorLogsService.getErrorLogs()
5. Service -> Supabase (SELECT z paginacją + COUNT)
6. Supabase -> RLS filtruje po user_id
7. Service -> Handler (dane + pagination)
8. Handler -> Response JSON (200)
```

---

## 6. Względy bezpieczeństwa

### Uwierzytelnianie
- Wymagana ważna sesja Supabase
- Sprawdzenie sesji przez `locals.user` (z middleware)
- Brak sesji -> 401 Unauthorized

### Autoryzacja
- RLS w Supabase automatycznie filtruje rekordy po `user_id = auth.uid()`
- Użytkownik nie może uzyskać dostępu do logów innych użytkowników
- Brak potrzeby implementacji ról admin (każdy użytkownik widzi tylko swoje logi)

### Walidacja danych wejściowych
- Parametr `page`: musi być liczba całkowita >= 1
- Parametr `limit`: musi być liczba całkowita od 1 do 100
- Użycie Zod do walidacji wszystkich parametrów

### Ochrona przed atakami
- Brak interpolacji parametrów w zapytaniach SQL (użycie Supabase SDK)
- Limit na `limit` parametr zapobiega DoS przez duże zapytania

---

## 7. Obsługa błędów

### Schemat błędu

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

### Scenariusze błędów

| Scenariusz | Kod | Odpowiedź |
|------------|-----|-----------|
| Brak sesji | 401 | `{ "error": "Unauthorized" }` |
| Nieprawidłowy `page` (< 1) | 400 | `{ "error": "Invalid page parameter", "details": "Page must be >= 1" }` |
| Nieprawidłowy `limit` (< 1 lub > 100) | 400 | `{ "error": "Invalid limit parameter", "details": "Limit must be between 1 and 100" }` |
| Błąd bazy danych | 500 | `{ "error": "Internal server error" }` |

---

## 8. Rozważania dotyczące wydajności

### Paginacja
- Użycie `LIMIT` i `OFFSET` w zapytaniach SQL
- Domyślny limit: 10 rekordów
- Maksymalny limit: 100 rekordów

### Optymalizacja zapytań
- Indeks na `user_id` w tabeli `generation_error_logs` (już istnieje wg db-plan.md)
- Sortowanie domyślne: `created_at DESC` (najnowsze błędy najpierw)

### Buforowanie
- Na tym etapie nie jest wymagane
- Logi błędów rzadko się zmieniają, więc można rozważyć cache w przyszłości

---

## 9. Etapy wdrożenia

### Krok 1: Dodanie nowych typów DTO

**Plik: `src/types.ts`**

Dodaj typ `GenerationErrorLogsListResponseDto`:

```typescript
// ------------------------------------------------------------------------------------------------
// 11. Generation Error Logs List Response DTO
//     Response structure for GET /generation-error-logs endpoint
// ------------------------------------------------------------------------------------------------
export interface GenerationErrorLogsListResponseDto {
  data: GenerationErrorLogDto[];
  pagination: PaginationDto;
}
```

### Krok 2: Utworzenie schematu walidacji Zod

**Plik: `src/lib/schemas/generation-error-logs.schema.ts`**

```typescript
import { z } from "zod";

export const errorLogsPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type ErrorLogsPaginationInput = z.infer<typeof errorLogsPaginationSchema>;
```

### Krok 3: Utworzenie serwisu GenerationErrorLogsService

**Plik: `src/lib/services/generation-error-logs.service.ts`**

```typescript
import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerationErrorLogDto } from "../../types";

export class GenerationErrorLogsService {
  constructor(private supabase: SupabaseClient) {}

  async getErrorLogs(
    pagination: { page: number; limit: number }
  ): Promise<{ data: GenerationErrorLogDto[]; total: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await this.supabase
      .from("generation_error_logs")
      .select("*", { count: "exact", head: true });

    if (countError) {
      throw new Error(`Database error: ${countError.message}`);
    }

    // Get paginated data
    const { data, error } = await this.supabase
      .from("generation_error_logs")
      .select("id, error_code, error_message, model, source_text_hash, source_text_length, created_at, user_id")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      data: data ?? [],
      total: count ?? 0,
    };
  }
}
```

### Krok 4: Implementacja endpointu GET /api/generation-error-logs

**Plik: `src/pages/api/generation-error-logs.ts`**

```typescript
import type { APIRoute } from "astro";
import { errorLogsPaginationSchema } from "../../lib/schemas/generation-error-logs.schema";
import { GenerationErrorLogsService } from "../../lib/services/generation-error-logs.service";
import type { GenerationErrorLogsListResponseDto } from "../../types";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  // 1. Check authentication
  if (!locals.user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 2. Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    };

    const validationResult = errorLogsPaginationSchema.safeParse(queryParams);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new Response(
        JSON.stringify({
          error: `Invalid ${firstError.path[0]} parameter`,
          details: firstError.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { page, limit } = validationResult.data;

    // 3. Fetch data using service
    const service = new GenerationErrorLogsService(locals.supabase);
    const { data, total } = await service.getErrorLogs({ page, limit });

    // 4. Build response
    const response: GenerationErrorLogsListResponseDto = {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching generation error logs:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

### Krok 5: Testy manualne

1. **Test bez autoryzacji** -> oczekiwany 401
2. **Test z autoryzacją, bez parametrów** -> oczekiwana lista z domyślną paginacją
3. **Test z parametrami paginacji** (`?page=2&limit=5`) -> oczekiwana poprawna paginacja
4. **Test z nieprawidłowymi parametrami** (`?page=-1`) -> oczekiwany 400
5. **Test z pustą listą** (nowy użytkownik) -> oczekiwana pusta tablica `data: []`

---

## 10. Podsumowanie plików do utworzenia/modyfikacji

| Plik | Akcja |
|------|-------|
| `src/types.ts` | Modyfikacja - dodanie `GenerationErrorLogsListResponseDto` |
| `src/lib/schemas/generation-error-logs.schema.ts` | Utworzenie |
| `src/lib/services/generation-error-logs.service.ts` | Utworzenie |
| `src/pages/api/generation-error-logs.ts` | Utworzenie |

---

## 11. Zależności

### Wymagane przed implementacją:
- Middleware z obsługą autoryzacji (`locals.user` musi być dostępne)
- Pakiet `zod` zainstalowany
- RLS włączone na tabeli `generation_error_logs`

### Powiązane plany:
- [auth-endpoint-implementation-plan.md](./auth-endpoint-implementation-plan.md) - middleware i autoryzacja
- [generations-get-endpoint-implementation-plan.md](./generations-get-endpoint-implementation-plan.md) - podobny wzorzec implementacji

---

## 12. Changelog

| Data | Wersja | Opis |
|------|--------|------|
| 2026-01-26 | 1.0 | Utworzenie planu implementacji |
