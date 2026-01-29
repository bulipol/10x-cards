# Od czego zacząć testy jednostkowe – propozycja

## Rekomendacja: walidacja auth (schematy Zod)

**Start:** testy dla [src/lib/schemas/auth.schema.ts](src/lib/schemas/auth.schema.ts) – **jedna cała funkcjonalność** (walidacja danych logowania i rejestracji).

### Dlaczego akurat to

| Kryterium                | Auth schemas                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Jedna funkcjonalność** | Tak – cały obszar „walidacja danych auth” (login + register). Odpowiada V-01 i V-02 z [plan-testow.md](.ai/implementation/test/plan-testow.md). |
| **Bez mocków**           | Tak – tylko Zod, brak Supabase/OpenRouter/fetch.                                                                                                |
| **Proste testy**         | Tak – `schema.safeParse(input)` + asercje na `success` / `error.issues` lub `flatten()`.                                                        |
| **Niewielki zakres**     | Tak – jeden plik źródłowy, 4 eksporty (email, password, loginSchema, registerSchema), ok. 10–15 przypadków.                                     |
| **Zgodność z planem**    | Faza 1 w plan-testow.md: „1–2 testy przykładowe (np. schemat Zod)”.                                                                             |

### Zakres testów (propozycja)

**1. loginSchema** (plan V-01)

- Poprawne dane (email + niepuste hasło) → `success: true`.
- Brak / pusty email → błąd walidacji (np. „Invalid email format” lub wymagane pole).
- Niepoprawny format email (np. `"not-an-email"`) → błąd.
- Email dłuższy niż 255 znaków → błąd („Email is too long”).
- Puste hasło → błąd („Password is required”).

**2. registerSchema** (plan V-02)

- Poprawne dane (email + hasło min 8 znaków, litera, cyfra) → `success: true`.
- Hasło krótsze niż 8 znaków → błąd („Password must be at least 8 characters”).
- Hasło bez litery → błąd („Password must contain at least one letter”).
- Hasło bez cyfry → błąd („Password must contain at least one digit”).
- Hasło dłuższe niż 72 znaki → błąd („Password is too long”).
- Te same przypadki emaila co przy login (wymagany, format, max 255).

Struktura: jeden plik `tests/unit/schemas/auth.schema.test.ts`, bloki `describe("loginSchema")` i `describe("registerSchema")`, w każdym teście układ Arrange–Act–Assert (zgodnie z [vitest-unit-testing.mdc](.cursor/rules/vitest-unit-testing.mdc)).

### Implementacja (kroki)

1. **Utworzyć katalog** `tests/unit/schemas/` (jeśli nie ma).
2. **Dodać plik** `tests/unit/schemas/auth.schema.test.ts`:
   - import `loginSchema`, `registerSchema` z `@/lib/schemas/auth.schema`;
   - w testach używać `.safeParse()` i sprawdzać `result.success` oraz przy błędzie `result.error.flatten()` lub `result.error.issues` (np. aby sprawdzić oczekiwane komunikaty).
3. **Uruchomić** `npm run test` i upewnić się, że wszystkie testy przechodzą.

Żadnych zmian w `auth.schema.ts` ani w konfiguracji Vitest – tylko nowy plik testowy.

### Alternatywa (jeszcze mniejszy start)

Jeśli chcesz **minimalnie mniejszy** pierwszy krok: ten sam typ testów, ale tylko dla [src/lib/schemas/generations.schema.ts](src/lib/schemas/generations.schema.ts) – `generationsPaginationSchema` (page, limit, domyślne wartości) i `generationIdSchema` (id dodatnie). Nadal jedna funkcjonalność (walidacja parametrów generacji), mniej przypadków niż auth.

---

## Podsumowanie

- **Rekomendowany pierwszy zakres:** testy jednostkowe dla **auth.schema.ts** (loginSchema + registerSchema) w `tests/unit/schemas/auth.schema.test.ts`.
- **Dlaczego sensowne:** jedna cała funkcjonalność, brak zależności zewnętrznych, mały i czytelny zakres, zgodność z planem testów i regułami Vitest.
- **Kolejny krok (później):** np. schematy Zod dla flashcards lub generations, potem serwisy z mockami (FlashcardService.validateGenerationIds, GenerationService).

---

## Zrealizowane kolejne kroki

### 1a. generations.schema (V-05)

**Plik testowy:** `tests/unit/schemas/generations.schema.test.ts`

**Zakres:** `generationsPaginationSchema` – domyślne wartości (page=1, limit=10), poprawne page/limit, koercja string→number, odrzucenie page&lt;1, limit&lt;1, limit&gt;100. `generationIdSchema` – poprawny id dodatni, koercja, odrzucenie 0 i ujemnego.

**Wynik:** 10 testów, wszystkie przechodzą. `npm run test` – 24 testy łącznie (example + auth.schema + generations.schema).

### 1b. flashcards.schema (V-03, V-04)

**Plik testowy:** `tests/unit/schemas/flashcards.schema.test.ts`

**Zakres:** `flashcardsQuerySchema` – domyślne (page, limit, sort, order), poprawne i opcjonalne source/generation_id, koercja, odrzucenie page&lt;1, limit&lt;1, limit&gt;100, nieprawidłowy sort/order. `flashcardIdSchema` – id dodatnie, koercja, odrzucenie 0 i ujemnego. `flashcardUpdateSchema` – refine „at least one field”, front/back max 200/500, source enum, generation_id number lub null.

**Check po 1b:** `npm run test` – 46 testów, wszystkie przechodzą.

### 2a. FlashcardService.validateGenerationIds (SVC-03)

**Plik testowy:** `tests/unit/services/flashcard.service.test.ts`

**Zakres:** Pusta lista → nie wywołuje Supabase. Wszystkie ID istnieją (mock zwraca count === length) → brak błędu. Deduplikacja ID przed zapytaniem. Część ID nie istnieje (count &lt; length) → rzuca `DatabaseError` z kodem `INVALID_GENERATION_ID`.

**Wynik:** 4 testy, mock Supabase (from/select/in), 50 testów łącznie po 2a.

---

## Przegląd (Review)

**Data:** 2025-01-29

**Wykonane zmiany:**

1. Utworzono katalog `tests/unit/schemas/`.
2. Dodano plik `tests/unit/schemas/auth.schema.test.ts` z testami dla `loginSchema` i `registerSchema`:
   - **loginSchema:** 5 testów – poprawne dane, pusty email, niepoprawny format email, email > 255 znaków, puste hasło.
   - **registerSchema:** 8 testów – poprawne dane, hasło < 8 znaków, hasło bez litery, bez cyfry, > 72 znaki, oraz przypadki emaila (pusty, zły format, > 255 znaków).
3. W testach używane jest `safeParse()` oraz asercje na `result.success` i `getFirstMessage(result)` (pierwszy komunikat z `error.issues`). Dla emaila dłuższego niż 255 znaków Zod zwraca „Invalid email format” (walidacja `.email()` przed `.max(255)`), więc asercja sprawdza dopasowanie do `/Invalid email format|Email is too long/`.

**Uruchomienie:** `npm run test` – 14 testów (w tym 1 z example.test.ts), wszystkie przechodzą. Żadnych zmian w `auth.schema.ts` ani w konfiguracji Vitest.
