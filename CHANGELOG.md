# Changelog

Wszystkie istotne zmiany w projekcie 10x-cards będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/).

## [0.3.0] - 2026-01-27

### Dodane
- **Widok zarządzania fiszkami** (`/flashcards`):
  - Pełny CRUD: tworzenie, edycja, usuwanie fiszek
  - Paginacja (10 fiszek na stronę)
  - Sortowanie według daty utworzenia (najnowsze pierwsze)
  - Responsywny design (mobile, tablet, desktop)

- **Komponenty React** (src/components/):
  - `FlashcardsView.tsx` - główny orchestrator (157 LOC)
  - `FlashcardCard.tsx` - karta pojedynczej fiszki z badge source (67 LOC)
  - `FlashcardsList.tsx` - responsive grid layout (19 LOC)
  - `EditFlashcardModal.tsx` - modal tworzenia/edycji z walidacją (124 LOC)
  - `DeleteConfirmationDialog.tsx` - potwierdzenie usunięcia (53 LOC)
  - `FlashcardsEmptyState.tsx` - empty state z CTA button (22 LOC)
  - `Pagination.tsx` - paginacja Previous/Next (49 LOC)
  - `useFlashcards.ts` - custom hook zarządzający stanem (120 LOC)

- **UI Components shadcn/ui**:
  - Dialog - dla modala edycji/tworzenia fiszek
  - AlertDialog - dla potwierdzenia usunięcia

- **API Endpoints** (src/pages/api/flashcards/):
  - `GET /api/flashcards` - lista z paginacją, sortowaniem, filtrowaniem
  - `POST /api/flashcards` - bulk create fiszek
  - `GET /api/flashcards/[id]` - pobieranie pojedynczej fiszki
  - `PUT /api/flashcards/[id]` - aktualizacja fiszki
  - `DELETE /api/flashcards/[id]` - usunięcie fiszki

- **FlashcardService rozszerzony** (src/lib/flashcard.service.ts):
  - `getFlashcards()` - pobieranie z paginacją, sortowaniem, filtrowaniem
  - `getFlashcardById()` - pobieranie pojedynczej fiszki
  - `updateFlashcard()` - aktualizacja fiszki
  - `deleteFlashcard()` - usunięcie fiszki

- **Walidacja Zod** (src/lib/schemas/):
  - `flashcards.schema.ts` - schematy dla query params, create, update, delete
  - Character limits: front 200, back 500 znaków

- **Typy TypeScript** (src/types.ts):
  - `FlashcardsQueryParams` - parametry zapytania (page, limit, sort, order, source, generation_id)
  - `FlashcardUpdateDto` - DTO aktualizacji fiszki
  - `FlashcardsListResponseDto` - response z paginacją

- **Dokumentacja** (ToDo/):
  - `flashcards-view-implementation-progress.md` - szczegółowy tracking implementacji przez 6 iteracji

### Zmienione
- `package.json`:
  - Wersja 0.2.0 → 0.3.0
  - Dodano @radix-ui/react-dialog@^1.1.15
  - Dodano @radix-ui/react-alert-dialog@^1.1.15
- `.env.example`: Aktualizacja zmiennych środowiskowych
- `astro.config.mjs`: Aktualizacja konfiguracji

### Usunięte
- **Legacy planning documents** z `.ai/` (16 plików):
  - Przeniesiono do `.ai/implementation/` dla archiwum
  - Utworzono `.ai/coreDocumentation/` dla aktywnej dokumentacji
  - Usunięto zduplikowane plany (Claude vs Cursor)

### Szczegóły techniczne
- **Łącznie:** ~620 linii kodu (bez UI libraries)
- **Toast notifications** z sonner dla wszystkich operacji CRUD
- **Smart pagination:** automatyczne przejście do poprzedniej strony przy usunięciu ostatniego elementu
- **Source tracking:** manual, ai-full, ai-edited (z automatyczną zmianą ai-full → ai-edited przy edycji)
- **Error handling:** try/catch z re-throw dla wszystkich API calls
- **Loading states:** spinners i skeleton loader dla wszystkich operacji asynchronicznych
- **Responsive grid:** 1 kolumna (mobile), 2 kolumny (tablet), 3 kolumny (desktop)

---

## [0.2.0] - 2026-01-26

### Dodane
- **Plany implementacji API** (.ai/):
  - Plan implementacji endpointów autentykacji (`auth-endpoint-implementation-plan.md`)
    - 6 endpointów: register, login, logout, reset-password, update-password, DELETE account
    - Integracja @supabase/ssr dla SSR
    - Middleware z zarządzaniem sesją
    - Schematy walidacji Zod
  - Plan implementacji logów błędów (`generation-error-logs-endpoint-implementation-plan.md`)
    - GET /api/generation-error-logs z paginacją
    - Service layer i walidacja

- **Tracking endpointów** (ToDo/):
  - Zaktualizowano `endpoints-todo.md`: 13/13 planów gotowych do implementacji
  - Status: WSZYSTKIE PLANY KOMPLETNE

### Szczegóły techniczne
- Wszystkie plany zgodne z istniejącymi wzorcami projektu
- Uwzględniono bezpieczeństwo, walidację, obsługę błędów
- Scenariusze testów manualnych dla każdego endpointu

---

## [0.1.0] - 2026-01-26

### Dodane
- **Dokumentacja AI** (.ai/):
  - Specyfikacja architektury modułu autentykacji (`auth-spec.md`)
  - Plany implementacji widoku fiszek (wersje Claude i Cursor)
  - Diagramy architektoniczne (auth, UI)

- **Reguły Cursor IDE** (.cursor/rules/):
  - Konfiguracja Docker (`docker.mdc`)
  - GitHub Actions (`github-action.mdc`)
  - Diagramy Mermaid (auth, journey, UI)
  - Testowanie E2E Playwright (`playwright-e2e-testing.mdc`)
  - Autentykacja Supabase (`supabase-auth.mdc`)
  - Plan testów (`test-plan.mdc`)
  - Testy jednostkowe Vitest (`vitest-unit-testing.mdc`)

- **Prompty 10xdevs** (10xdevs-prompts/):
  - Moduł M1: Workflow i techniki AI
  - Moduł M2: Bootstrap projektu
  - Moduł M3: Produkcyjne przygotowanie
  - Moduł M4: Legacy code
  - Moduł M5: Innowacje (MCP)

- **Konfiguracja**:
  - Plik `.cursorignore`
  - Zmienne środowiskowe E2E w `.env.example` (E2E_USERNAME, E2E_PASSWORD, E2E_USERNAME_ID)

- **Analiza projektu** (ToDo/):
  - Szczegółowa analiza implementacji vs plany (`analizaWorkDone.md`)

### Zmienione
- `src/middleware/index.ts`: Dodano komentarz przygotowujący do implementacji PUBLIC_PATHS dla autentykacji

---

## [0.0.1] - 2026-01-24 (Initial Commit)

### Dodane
- Podstawowa struktura projektu Astro 5 + React 19
- Integracja z Supabase (PostgreSQL)
- Integracja z OpenRouter (GPT-4o-mini)
- Widok generowania fiszek (`/generate`)
- API endpoints: POST /api/flashcards, POST /api/generations
- Komponenty UI z shadcn/ui
- System typów TypeScript
- Walidacja Zod
