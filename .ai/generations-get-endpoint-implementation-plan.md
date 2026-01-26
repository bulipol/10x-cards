# API Endpoint Implementation Plan: GET /generations

## 1. Przegląd punktu koncowego

Ten plan obejmuje implementacje dwoch endpointow REST API:

1. **GET `/api/generations`** - Pobieranie listy rekordow generacji dla zalogowanego uzytkownika z obsluga paginacji
2. **GET `/api/generations/{id}`** - Pobieranie szczegolowych informacji o pojedynczej generacji wraz z powiazanymi fiszkami

Oba endpointy wymagaja uwierzytelnienia i korzystaja z Row-Level Security (RLS) Supabase do automatycznego filtrowania danych po `user_id`.

## 2. Szczegoly zadania

### GET `/api/generations`

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/generations`
- **Parametry**:
  - Wymagane: brak
  - Opcjonalne:
    - `page` (number, default: 1) - numer strony
    - `limit` (number, default: 10, max: 100) - liczba rekordow na strone
- **Request Body**: brak

### GET `/api/generations/{id}`

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/generations/[id]`
- **Parametry**:
  - Wymagane: `id` (path parameter) - identyfikator generacji (BIGINT)
  - Opcjonalne: brak
- **Request Body**: brak

## 3. Wykorzystywane typy

### Istniejace typy (src/types.ts)

```typescript
// Podstawowy typ generacji z bazy danych
export type Generation = Database["public"]["Tables"]["generations"]["Row"];

// DTO dla szczegolow generacji z fiszkami
export type GenerationDetailDto = Generation & {
  flashcards?: FlashcardDto[];
};

// DTO dla fiszki
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
```

### Nowe typy do dodania (src/types.ts)

```typescript
// DTO dla pojedynczej generacji w liscie (bez flashcards)
export type GenerationDto = Pick<
  Generation,
  | "id"
  | "model"
  | "generated_count"
  | "accepted_unedited_count"
  | "accepted_edited_count"
  | "source_text_hash"
  | "source_text_length"
  | "generation_duration"
  | "created_at"
  | "updated_at"
>;

// Odpowiedz dla listy generacji
export interface GenerationsListResponseDto {
  data: GenerationDto[];
  pagination: PaginationDto;
}
```

## 4. Szczegoly odpowiedzi

### GET `/api/generations` - Success (200)

```json
{
  "data": [
    {
      "id": 1,
      "model": "gpt-4",
      "generated_count": 10,
      "accepted_unedited_count": 5,
      "accepted_edited_count": 3,
      "source_text_hash": "abc123...",
      "source_text_length": 2500,
      "generation_duration": 1500,
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

### GET `/api/generations/{id}` - Success (200)

```json
{
  "id": 1,
  "user_id": "uuid-here",
  "model": "gpt-4",
  "generated_count": 10,
  "accepted_unedited_count": 5,
  "accepted_edited_count": 3,
  "source_text_hash": "abc123...",
  "source_text_length": 2500,
  "generation_duration": 1500,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "flashcards": [
    {
      "id": 1,
      "front": "Question?",
      "back": "Answer",
      "source": "ai-full",
      "generation_id": 1,
      "created_at": "2024-01-15T10:31:00Z",
      "updated_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

### Kody bledow

| Kod | Opis | Kiedy wystepuje |
|-----|------|-----------------|
| 400 | Bad Request | Nieprawidlowe parametry paginacji lub format ID |
| 401 | Unauthorized | Brak sesji lub niewazny token |
| 404 | Not Found | Generacja o podanym ID nie istnieje |
| 500 | Internal Server Error | Blad serwera lub bazy danych |

## 5. Przeplyw danych

### GET `/api/generations`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja query params (Zod)
4. Handler -> GenerationsService.getGenerations()
5. Service -> Supabase (SELECT z paginacja + COUNT)
6. Supabase -> RLS filtruje po user_id
7. Service -> Handler (dane + pagination)
8. Handler -> Response JSON (200)
```

### GET `/api/generations/{id}`

```
1. Request -> Middleware (auth check)
2. Middleware -> API Route Handler
3. Handler: Walidacja path param (Zod)
4. Handler -> GenerationsService.getGenerationById()
5. Service -> Supabase (SELECT generation + JOIN flashcards)
6. Supabase -> RLS filtruje po user_id
7. Service -> Handler (dane lub null)
8. Handler: if null -> 404, else -> Response JSON (200)
```

## 6. Wzgledy bezpieczenstwa

### Uwierzytelnianie
- Wymagana wazna sesja Supabase
- Sprawdzenie sesji przez `context.locals.supabase.auth.getUser()`
- Brak sesji -> 401 Unauthorized

### Autoryzacja
- RLS w Supabase automatycznie filtruje rekordy po `user_id = auth.uid()`
- Uzytkownik nie moze uzyskac dostepu do generacji innych uzytkownikow

### Walidacja danych wejsciowych
- Parametr `page`: musi byc liczba calkowita >= 1
- Parametr `limit`: musi byc liczba calkowita od 1 do 100
- Parametr `id`: musi byc liczba calkowita > 0
- Uzycie Zod do walidacji wszystkich parametrow

### Ochrona przed atakami
- Brak interpolacji parametrow w zapytaniach SQL (uzycie Supabase SDK)
- Limit na `limit` parametr zapobiega DoS przez duze zapytania

## 7. Obsluga bledow

### Schemat bledu

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
}
```

### Scenariusze bledow

| Scenariusz | Kod | Odpowiedz |
|------------|-----|-----------|
| Brak sesji | 401 | `{ "error": "Unauthorized" }` |
| Nieprawidlowy `page` (< 1) | 400 | `{ "error": "Invalid page parameter", "details": "Page must be >= 1" }` |
| Nieprawidlowy `limit` (< 1 lub > 100) | 400 | `{ "error": "Invalid limit parameter", "details": "Limit must be between 1 and 100" }` |
| Nieprawidlowy `id` format | 400 | `{ "error": "Invalid id parameter", "details": "ID must be a positive integer" }` |
| Generacja nie znaleziona | 404 | `{ "error": "Generation not found" }` |
| Blad bazy danych | 500 | `{ "error": "Internal server error" }` |

## 8. Rozwa-zania dotyczace wydajnosci

### Paginacja
- Uzycie `LIMIT` i `OFFSET` w zapytaniach SQL
- Domyslny limit: 10 rekordow
- Maksymalny limit: 100 rekordow

### Optymalizacja zapytan
- Indeks na `user_id` w tabeli `generations` (juz istnieje wg db-plan.md)
- Indeks na `generation_id` w tabeli `flashcards` (juz istnieje)
- Dla GET by ID: jedno zapytanie z JOIN zamiast dwoch oddzielnych

### Buforowanie
- Na tym etapie nie jest wymagane
- W przyszlosci mozna rozwazyc cache na poziomie CDN dla czesto pobieranych danych

## 9. Etapy wdrozenia

### Krok 1: Dodanie nowych typow DTO

Plik: `src/types.ts`

Dodaj typy `GenerationDto` i `GenerationsListResponseDto`.

### Krok 2: Utworzenie schematow walidacji Zod

Plik: `src/lib/schemas/generations.schema.ts`

```typescript
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const generationIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

### Krok 3: Utworzenie serwisu generacji

Plik: `src/lib/services/generations.service.ts`

Metody:
- `getGenerations(supabase, pagination): Promise<{ data: GenerationDto[], total: number }>`
- `getGenerationById(supabase, id): Promise<GenerationDetailDto | null>`

### Krok 4: Implementacja endpointu GET /api/generations

Plik: `src/pages/api/generations/index.ts`

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals, request }) => {
  // 1. Sprawdz auth
  // 2. Waliduj query params
  // 3. Wywolaj service
  // 4. Zwroc odpowiedz
};
```

### Krok 5: Implementacja endpointu GET /api/generations/[id]

Plik: `src/pages/api/generations/[id].ts`

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals, params }) => {
  // 1. Sprawdz auth
  // 2. Waliduj path param
  // 3. Wywolaj service
  // 4. Sprawdz czy znaleziono
  // 5. Zwroc odpowiedz lub 404
};
```

### Krok 6: Testy manualne

1. Test bez autoryzacji -> oczekiwany 401
2. Test z autoryzacja, bez parametrow -> oczekiwana lista z domyslna paginacja
3. Test z parametrami paginacji -> oczekiwana poprawna paginacja
4. Test z nieprawidlowymi parametrami -> oczekiwany 400
5. Test GET by ID z istniejacym ID -> oczekiwane dane z fiszkami
6. Test GET by ID z nieistniejacym ID -> oczekiwany 404

---

## Podsumowanie plikow do utworzenia/modyfikacji

| Plik | Akcja |
|------|-------|
| `src/types.ts` | Modyfikacja - dodanie nowych typow |
| `src/lib/schemas/generations.schema.ts` | Utworzenie |
| `src/lib/services/generations.service.ts` | Utworzenie |
| `src/pages/api/generations/index.ts` | Utworzenie |
| `src/pages/api/generations/[id].ts` | Utworzenie |
