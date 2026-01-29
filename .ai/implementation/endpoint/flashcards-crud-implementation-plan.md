# Plan Implementacji: Flashcards CRUD Endpoints (GET, PUT, DELETE)

## Stan końcowy
- ✅ POST `/api/flashcards` - już był zaimplementowany
- ✅ GET `/api/flashcards` - zaimplementowany (Iteracja 3)
- ✅ GET `/api/flashcards/{id}` - zaimplementowany (Iteracja 4)
- ✅ PUT `/api/flashcards/{id}` - zaimplementowany (Iteracja 4)
- ✅ DELETE `/api/flashcards/{id}` - zaimplementowany (Iteracja 4)
- ✅ FlashcardService rozszerzony o 4 nowe metody

## Lista zadań

### Etap 1: Przygotowanie typów i schematów (3 zadania)

- [x] **Zadanie 1.1**: Dodać typ `FlashcardsQueryParams` do `src/types.ts`
  - Dodać interfejs opisujący parametry query dla listy fiszek
  - Parametry: page, limit, sort, order, source?, generation_id?

- [x] **Zadanie 1.2**: Utworzyć folder i plik schematów walidacji
  - Utworzyć folder `src/lib/schemas/`
  - Utworzyć plik `src/lib/schemas/flashcards.schema.ts`

- [x] **Zadanie 1.3**: Zdefiniować schematy Zod w `flashcards.schema.ts`
  - `flashcardsQuerySchema` - dla GET /flashcards (query params)
  - `flashcardIdSchema` - dla walidacji path param ID
  - `flashcardUpdateSchema` - dla PUT /flashcards/{id} (request body)

### Etap 2: Rozszerzenie FlashcardService (4 zadania)

- [x] **Zadanie 2.1**: Dodać metodę `getFlashcards()` do FlashcardService
  - Implementacja zapytania z filtrowaniem, sortowaniem i paginacją
  - Zwraca `{ data: FlashcardDto[], total: number }`

- [x] **Zadanie 2.2**: Dodać metodę `getFlashcardById()` do FlashcardService
  - Implementacja zapytania SELECT WHERE id
  - Zwraca `FlashcardDto | null`

- [x] **Zadanie 2.3**: Dodać metodę `updateFlashcard()` do FlashcardService
  - Implementacja UPDATE z partial update
  - Zwraca `FlashcardDto | null`

- [x] **Zadanie 2.4**: Dodać metodę `deleteFlashcard()` do FlashcardService
  - Implementacja DELETE
  - Zwraca `boolean` (true jeśli usunięto)

### Etap 3: Implementacja endpointu GET /api/flashcards (1 zadanie)

- [x] **Zadanie 3.1**: Dodać handler GET do `src/pages/api/flashcards/index.ts`
  - Sprawdzenie auth (locals.supabase.auth.getUser())
  - Walidacja query params (flashcardsQuerySchema)
  - Wywołanie FlashcardService.getFlashcards()
  - Zwrócenie odpowiedzi z paginacją

### Etap 4: Implementacja endpointów na /api/flashcards/[id] (4 zadania)

- [x] **Zadanie 4.1**: Utworzyć plik `src/pages/api/flashcards/[id].ts`
  - Dodać `export const prerender = false`
  - Utworzyć szkielet dla GET, PUT, DELETE

- [x] **Zadanie 4.2**: Implementować handler GET w `[id].ts`
  - Auth check
  - Walidacja ID
  - Wywołanie FlashcardService.getFlashcardById()
  - Zwrócenie 200 lub 404

- [x] **Zadanie 4.3**: Implementować handler PUT w `[id].ts`
  - Auth check
  - Walidacja ID i body
  - Wywołanie FlashcardService.updateFlashcard()
  - Zwrócenie 200 lub 404

- [x] **Zadanie 4.4**: Implementować handler DELETE w `[id].ts`
  - Auth check
  - Walidacja ID
  - Wywołanie FlashcardService.deleteFlashcard()
  - Zwrócenie 204 lub 404

## Podział na iteracje

### Iteracja 1 (pierwsze 3 kroki do wykonania):
1. ✅ Zadanie 1.1 - Dodać typ FlashcardsQueryParams
2. ✅ Zadanie 1.2 - Utworzyć folder schemas
3. ✅ Zadanie 1.3 - Zdefiniować schematy Zod

**STOP** - czekam na feedback

### Iteracja 2 (kolejne 3 kroki):
4. ✅ Zadanie 2.1 - Dodać getFlashcards()
5. ✅ Zadanie 2.2 - Dodać getFlashcardById()
6. ✅ Zadanie 2.3 - Dodać updateFlashcard()

**STOP** - czekam na feedback

### Iteracja 3 (kolejne 3 kroki):
7. ✅ Zadanie 2.4 - Dodać deleteFlashcard()
8. ✅ Zadanie 3.1 - Handler GET /api/flashcards
9. ✅ Zadanie 4.1 - Utworzyć [id].ts

**STOP** - czekam na feedback

### Iteracja 4 (ostatnie 3 kroki):
10. ✅ Zadanie 4.2 - Handler GET /api/flashcards/[id]
11. ✅ Zadanie 4.3 - Handler PUT /api/flashcards/[id]
12. ✅ Zadanie 4.4 - Handler DELETE /api/flashcards/[id]

**ZAKOŃCZONE** ✅

## Zasady implementacji

1. **Prostota**: Każda zmiana ma być jak najprostsza, minimalna liczba linii kodu
2. **Bezpieczeństwo**: Wszystkie endpointy wymagają auth, RLS automatycznie filtruje po user_id
3. **Walidacja**: Używać Zod dla wszystkich input
4. **Obsługa błędów**: Jasne komunikaty błędów, odpowiednie kody HTTP
5. **Early returns**: Obsługa błędów na początku funkcji
6. **Type safety**: Używać typów z src/types.ts i src/db/database.types.ts

## Podsumowanie zmian

### Pliki utworzone:
1. **src/types.ts** - dodano interfejs `FlashcardsQueryParams` (7 linii)
2. **src/lib/schemas/flashcards.schema.ts** - nowy plik z 3 schematami walidacji Zod (~40 linii)
3. **src/pages/api/flashcards/index.ts** - przeorganizowano i dodano handler GET (~180 linii total)
4. **src/pages/api/flashcards/[id].ts** - nowy plik z 3 handlerami (GET, PUT, DELETE) (~220 linii)

### Pliki zmodyfikowane:
1. **src/lib/flashcard.service.ts** - dodano 4 nowe metody:
   - `getFlashcards()` - lista z paginacją, filtrowaniem, sortowaniem
   - `getFlashcardById()` - pobieranie pojedynczej fiszki
   - `updateFlashcard()` - aktualizacja fiszki (partial update)
   - `deleteFlashcard()` - usuwanie fiszki
   - Dodano ~90 linii kodu

### Statystyki:
- **Łącznie dodano:** ~540 linii kodu
- **Nowe endpointy:** 4 (GET lista, GET po id, PUT, DELETE)
- **Nowe metody w serwisie:** 4
- **Nowe schematy walidacji:** 3
- **Czas realizacji:** 4 iteracje (zgodnie z planem)

### Funkcjonalności:
✅ Kompletny CRUD dla flashcards
✅ Paginacja, sortowanie i filtrowanie dla listy
✅ Walidacja wszystkich inputów przez Zod
✅ Autoryzacja dla wszystkich endpointów
✅ RLS automatycznie filtruje po user_id
✅ Proper error handling (400, 401, 404, 500)
✅ Type safety na każdym poziomie
✅ Early returns pattern

## Changelog

### [2026-01-27] - Tymczasowe wyłączenie auth (MVP ETAP 1)

#### Modified
- Zakomentowano auth checks we wszystkich nowo zaimplementowanych endpointach zgodnie z filozofią MVP ETAP 1:
  - `src/pages/api/flashcards/index.ts` GET - auth check zakomentowany z tagiem `TODO: ETAP 3`
  - `src/pages/api/flashcards/[id].ts` GET - auth check zakomentowany z tagiem `TODO: ETAP 3`
  - `src/pages/api/flashcards/[id].ts` PUT - auth check zakomentowany z tagiem `TODO: ETAP 3`
  - `src/pages/api/flashcards/[id].ts` DELETE - auth check zakomentowany z tagiem `TODO: ETAP 3`

#### Rationale
Zgodnie z planem MVP (`ToDo/mvp-implementation-plan-2026-01-27.md`), auth powinien być zaimplementowany dopiero w ETAPIE 3. ETAP 1 zakłada pracę z `DEFAULT_USER_ID` dla łatwiejszego testowania funkcjonalności biznesowej przed dodaniem warstwy autoryzacji.

#### Easy Rollback for ETAP 3
Wszystkie zakomentowane bloki auth mają tag `// TODO: ETAP 3 - Odkomentować auth check`. Przywrócenie auth w ETAPIE 3 będzie trywialne - wystarczy wyszukać ten tag i odkomentować wszystkie bloki.

---

### [2026-01-27] - Flashcards CRUD Implementation

#### Added
- Dodano typ `FlashcardsQueryParams` do `src/types.ts` dla parametrów query listy fiszek
- Utworzono folder `src/lib/schemas/` dla schematów walidacji
- Dodano `src/lib/schemas/flashcards.schema.ts` z 3 schematami Zod:
  - `flashcardsQuerySchema` - walidacja query params (page, limit, sort, order, source, generation_id)
  - `flashcardIdSchema` - walidacja ID w path params
  - `flashcardUpdateSchema` - walidacja partial update (front, back, source, generation_id)

#### Extended
- Rozszerzono `FlashcardService` o 4 nowe metody:
  - `getFlashcards(params)` - pobieranie listy z paginacją, filtrowaniem po source/generation_id, sortowaniem
  - `getFlashcardById(id)` - pobieranie pojedynczej fiszki, zwraca null gdy nie znaleziono
  - `updateFlashcard(id, updateData)` - partial update fiszki, zwraca null gdy nie znaleziono
  - `deleteFlashcard(id)` - usuwanie fiszki, zwraca boolean (true = usunięto, false = nie znaleziono)

#### Created
- Utworzono `src/pages/api/flashcards/index.ts` (przeniesiono z flashcards.ts):
  - Handler GET - lista fiszek z paginacją i filtrowaniem
  - Handler POST - tworzenie fiszek (już istniał)
- Utworzono `src/pages/api/flashcards/[id].ts` z 3 handlerami:
  - GET - pobieranie pojedynczej fiszki (200 lub 404)
  - PUT - aktualizacja fiszki z partial update (200 lub 404)
  - DELETE - usuwanie fiszki (204 lub 404)

#### Security
- Wszystkie nowe endpointy wymagają autoryzacji (401 gdy brak sesji)
- RLS w Supabase automatycznie filtruje rekordy po user_id
- Użytkownik nie może uzyskać dostępu do fiszek innych użytkowników

#### Validation
- Whitelist pól sortowania zapobiega SQL injection
- Limity paginacji (1-100) zapobiegają DoS
- Limity długości tekstu (front: 200, back: 500 znaków)
- Walidacja typów wszystkich parametrów przez Zod

#### Technical
- Użycie early returns pattern dla obsługi błędów
- Pełna type safety (TypeScript + Zod)
- Proper HTTP status codes (200, 204, 400, 401, 404, 500)
- Konsekwentna struktura error responses
- Logging błędów przez console.error
