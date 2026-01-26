# Changelog

Wszystkie istotne zmiany w projekcie 10x-cards będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.1.0/).

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
