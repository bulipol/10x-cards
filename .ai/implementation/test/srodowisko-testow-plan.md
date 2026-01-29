# Plan wdrożenia środowiska testów (Vitest + Playwright)

## Cel

Przygotowanie środowiska do testów jednostkowych (Vitest + React Testing Library) oraz testów E2E (Playwright), zgodnie z `.ai/coreDocumentation/tech-stack.md` oraz regułami `.cursor/rules/vitest-unit-testing.mdc` i `.cursor/rules/playwright-e2e-testing.mdc`.

---

## 1. Testy jednostkowe (Vitest)

### 1.1 Zależności do dodania (devDependencies)

| Pakiet                        | Wersja (proponowana) | Opis                                                     |
| ----------------------------- | -------------------- | -------------------------------------------------------- |
| `vitest`                      | ^2.0.x               | Framework testów, integracja z Vite/TypeScript           |
| `@vitejs/plugin-react`        | ^4.3.x               | Obsługa JSX/React w Vitest (spójność z Astro)            |
| `jsdom`                       | ^25.x                | Środowisko DOM dla testów komponentów React              |
| `@testing-library/react`      | ^16.x                | Renderowanie i interakcje na komponentach React          |
| `@testing-library/jest-dom`   | ^6.x                 | Dodatkowe matchery (toBeInTheDocument, toHaveValue itd.) |
| `@testing-library/user-event` | ^14.x                | Symulacja zdarzeń użytkownika (opcjonalnie, zalecane)    |

**Pytanie przed dodaniem:** Czy wersje mają być dokładnie takie (z `^`), czy wolisz konkretne numery wersji (np. ostatnie stabilne z npm)?

### 1.2 Pliki konfiguracyjne

- **`vitest.config.ts`** (w katalogu głównym projektu):
  - `environment: 'jsdom'` – testy komponentów
  - `setupFiles: ['./vitest.setup.ts']`
  - `globals: true` – opcjonalnie (describe, it, expect bez importu)
  - alias `@/*` → `./src/*` (spójnie z tsconfig)
  - `include`: `['tests/unit/**/*.{test,spec}.{ts,tsx}']` **(wybór: B – osobny katalog)**
  - opcjonalnie: `coverage` (provider v8, katalog `coverage/`)

- **`vitest.setup.ts`** (w katalogu głównym):
  - `import '@testing-library/jest-dom'` – rozszerzenie matcherów

### 1.3 Skrypty w `package.json`

- `"test": "vitest run"` – jednorazowe uruchomienie
- `"test:watch": "vitest"` lub `"test:watch": "vitest --watch"` – tryb watch
- `"test:ui": "vitest --ui"` – UI mode (opcjonalnie)
- `"test:coverage": "vitest run --coverage"` – raport pokrycia (opcjonalnie)

### 1.4 Lokalizacja testów jednostkowych

**Zdecydowano: B)** Osobny katalog: `tests/unit/**/*.{test,spec}.{ts,tsx}`

---

## 2. Testy E2E (Playwright)

### 2.1 Zależności do dodania (devDependencies)

| Pakiet             | Wersja (proponowana) | Opis                                                     |
| ------------------ | -------------------- | -------------------------------------------------------- |
| `@playwright/test` | ^1.49.x              | Framework E2E, w tym tylko Chromium (zgodnie z regułami) |

**Uwaga:** Instalator Playwright – dla „tylko Chromium” użyć `npx playwright install chromium`.

**Zdecydowano:** Konfiguracja wyłącznie Chromium (na razie bez Firefox/WebKit).

### 2.2 Pliki konfiguracyjne

- **`playwright.config.ts`** (w katalogu głównym):
  - **tylko Chromium** – jeden projekt (Chromium, Desktop Chrome)
  - `baseURL`: `http://localhost:3000` (zgodnie z `astro.config.mjs` – port 3000)
  - `testDir`: `tests/e2e`
  - `use`: np. `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'` (opcjonalnie)
  - Opcjonalnie: `webServer: { command: 'npm run dev', url: baseURL, reuseExistingServer: true }` – automatyczne uruchomienie dev servera przed testami (do decyzji w kroku 8)

### 2.3 Struktura katalogów (zgodnie z konwencją `tests/`)

E2E w `tests/e2e/` – spójnie z `tests/unit/` i z domyślną konwencją Playwright (`tests/`).

```
tests/
  unit/             # Vitest – testy jednostkowe
  e2e/              # Playwright – testy E2E
    page-objects/   # Page Object Model – klasy stron
    *.spec.ts       # pliki testów E2E (lub w podkatalogach, np. tests/e2e/auth/)
```

W `tests/e2e/page-objects/` można dodać np.:

- `BasePage.ts` – klasa bazowa z `page`, `baseURL`, wspólnymi metodami
- `LoginPage.ts` – strona /login, selektory `data-testid` (gdy je dodamy)

Na start: katalogi + minimalna klasa bazowa lub pusty plik `.gitkeep`, żeby struktura była widoczna.

### 2.4 Skrypty w `package.json`

- `"test:e2e": "playwright test"` – uruchomienie testów E2E
- `"test:e2e:ui": "playwright test --ui"` – UI mode (opcjonalnie)

**Pytanie:** Czy E2E mają automatycznie uruchamiać `npm run dev` (webServer w config), czy zakładamy, że dev server jest już włączony przed `npm run test:e2e`?

---

## 3. Inne zmiany

### 3.1 `.gitignore`

Dodać (żeby nie commitować artefaktów):

- `coverage/` – raporty pokrycia Vitest
- `test-results/` – wyniki Playwright
- `playwright-report/` – raport HTML Playwright
- `blob-report/` – opcjonalnie (Playwright blob reporter)

### 3.2 Typy TypeScript

- W **`src/env.d.ts`** (lub osobnym pliku dla testów):  
  `/// <reference types="vitest/globals" />` – tylko jeśli w vitest.config ustawione `globals: true`, żeby TypeScript rozpoznawał `describe`, `it`, `expect` bez importu.
- Dla Playwright typy są w pakiecie `@playwright/test` – nie trzeba nic dopisywać w env.d dla E2E.

### 3.3 ESLint (opcjonalnie)

- Dodać `eslint-plugin-vitest` i/lub rozszerzyć env o `vitest/globals`, żeby ESLint nie zgłaszał nieznanych zmiennych w plikach testowych. Można zrobić w osobnym kroku po uruchomieniu testów.

---

## 4. Kolejność kroków wdrożenia (z pytaniami przed każdym)

| Krok | Działanie                                                                                                   | Status       |
| ---- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| 1    | Dodać do `package.json` devDependencies: Vitest + RTL + jsdom + plugin React                                | Wykonano     |
| 2    | Uruchomić `npm install`                                                                                     | Do wykonania |
| 3    | Utworzyć `vitest.setup.ts` i `vitest.config.ts` (include: `tests/unit/**`)                                  | Wykonano     |
| 4    | Dodać skrypty `test`, `test:watch`, `test:ui`, `test:coverage`, `test:e2e`, `test:e2e:ui` do `package.json` | Wykonano     |
| 5    | Dodać do `package.json` devDependencies: `@playwright/test`                                                 | Wykonano     |
| 6    | Uruchomić `npm install` (po dodaniu Playwright)                                                             | Do wykonania |
| 7    | Uruchomić `npx playwright install chromium` (pobranie binariów Chromium)                                    | Do wykonania |
| 8    | Utworzyć `playwright.config.ts` (Chromium, baseURL 3000, testDir: tests/e2e)                                | Wykonano     |
| 9    | Utworzyć katalogi `tests/e2e/` i `tests/e2e/page-objects/` + BasePage.ts                                    | Wykonano     |
| 10   | Zaktualizować `.gitignore` (coverage, test-results, playwright-report, blob-report)                         | Wykonano     |
| 11   | Dodać referencję typów Vitest (`vitest-env.d.ts`)                                                           | Wykonano     |
| 12   | Przykładowy test jednostkowy `tests/unit/example.test.ts`                                                   | Wykonano     |

---

## 5. Podsumowanie

- **Vitest:** devDependencies (vitest, @vitejs/plugin-react, jsdom, @testing-library/react, @testing-library/jest-dom, opcjonalnie user-event) + `vitest.config.ts` + `vitest.setup.ts` + skrypty test / test:watch / test:coverage.
- **Playwright:** devDependencies (@playwright/test) + `playwright.config.ts` **(tylko Chromium)** + katalogi `tests/e2e/`, `tests/e2e/page-objects/` + skrypty test:e2e.
- **Inne:** .gitignore, ewentualnie env.d dla typów Vitest.

Przed wykonaniem kroków 1–12 będę pytać o potwierdzenie każdego kroku. Możesz też od razu odpowiedzieć na pytania z tabeli (wersje, A/B testów, Chromium, webServer, przykładowe testy) – wtedy kolejne wdrożenie pójdzie bez ponownych pytań w tych kwestiach.
