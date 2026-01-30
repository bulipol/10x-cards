# Plan: minimalny setup CI/CD (testy + build produkcyjny)

## Kontekst

- **Tech stack**: Astro 5, React 19, Vitest (unit), Playwright (E2E), GitHub Actions (z `.ai/coreDocumentation/tech-stack.md`).
- **Branch**: `master` (zweryfikowane: `git branch -a`).
- **Istniejący workflow**: `.github/workflows/test.yml` – joby `unit` i `e2e`; trigger `push`/`pull_request` na `master` i `main`.

## Cele

1. Potwierdzać działanie **testów** (unit + E2E) oraz **buildu produkcyjnego** (`npm run build`).
2. Uruchamiać pipeline **ręcznie** (`workflow_dispatch`) oraz **po aktualizacji mastera** (`push` na `master`).

## Zasady (github-action.mdc)

- `npm ci` do instalacji zależności.
- `env:` i secrets na poziomie jobów, nie globalnie.
- Node z `.nvmrc`; weryfikacja wersji actions po wdrożeniu.

## Todo

- [x] Dodać trigger `workflow_dispatch` (uruchomienie manualne).
- [x] Ograniczyć trigger `push`/`pull_request` do gałęzi `master`.
- [x] Dodać job `build`: checkout → setup Node → `npm ci` → `npm run build`, z `env` (secrets) potrzebnym do buildu (SUPABASE_URL, SUPABASE_KEY, ewent. OPENROUTER_API_KEY).
- [x] Zweryfikować wersje actions (checkout@v4, setup-node@v4, upload-artifact@v4).
- [x] Dodać sekcję Review na końcu tego pliku.

## Uwagi

- Build Astro (output: server) używa `import.meta.env` (SUPABASE_URL, SUPABASE_KEY, OPENROUTER_API_KEY) – w CI trzeba ustawić te zmienne w secrets repozytorium, żeby build się nie wywalał.
- E2E już korzysta z secrets (SUPABASE_URL, SUPABASE_KEY, E2E_TEST_USER_*).

---

## Review (po wdrożeniu)

### Podsumowanie zmian

1. **Plik `.github/workflows/test.yml`**
   - **Triggery**: dodano `workflow_dispatch` (uruchomienie ręczne z zakładki Actions). `push` i `pull_request` ograniczone do gałęzi `master` (usunięto `main`).
   - **Nowy job `build`**: uruchamia `npm run build` (Astro production build). Używa `npm ci`, Node z `.nvmrc`, cache npm. Zmienne `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY` przekazywane z secrets repozytorium (potrzebne przy buildzie, bo kod używa `import.meta.env`).

2. **Plik `tasks/cicd-minimal-setup.md`**
   - Plan z listą zadań i sekcją Review.

### Wymagane secrets w repozytorium

- **Unit / Build**: `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY` (dla joba `build`).
- **E2E**: `SUPABASE_URL`, `SUPABASE_KEY`, `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`.

Bez ustawionych `SUPABASE_*` i `OPENROUTER_API_KEY` job `build` może się nie udać (Astro wstawia te wartości w czasie buildu).

### Wersje actions

Użyte wersje: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4` – aktualne major dla oficjalnych actions GitHub. Zgodne z regułami z `github-action.mdc` (env na poziomie jobów, `npm ci`, Node z `.nvmrc`).
