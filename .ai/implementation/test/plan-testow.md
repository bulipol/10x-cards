# Plan testów – 10xCards

## 1. Wprowadzenie i cele testowania

**10xCards** to aplikacja webowa do automatycznego generowania fiszek z wykorzystaniem AI (OpenRouter). Główne cele testowania:

- **Jakość funkcjonalna** – potwierdzenie, że wszystkie funkcje (auth, generowanie, fiszki, nauka) działają zgodnie z wymaganiami.
- **Bezpieczeństwo i izolacja danych** – użytkownik widzi i modyfikuje tylko swoje dane; middleware i API poprawnie egzekwują autentykację.
- **Stabilność integracji** – poprawne działanie z Supabase (baza, auth) oraz OpenRouter (AI).
- **Doświadczenie użytkownika** – formularze, walidacja, komunikaty błędów i stany ładowania działają poprawnie.

Cele testów są spójne ze stosem technologicznym (Astro 5, React 19, Supabase, OpenRouter) oraz z priorytetami projektu (auth, CRUD fiszek, generowanie, sesja nauki).

---

## 2. Zakres testów

### W zakresie

| Obszar                   | Opis                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Autentykacja**         | Logowanie, rejestracja, wylogowanie, ochrona ścieżek (middleware), sesja użytkownika.                                                                                                       |
| **API – Auth**           | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout` – walidacja wejścia, kody odpowiedzi, błędy.                                                                     |
| **API – Generations**    | `POST /api/generations` (generowanie), `GET /api/generations` (lista z paginacją), `GET /api/generations/[id]` – autoryzacja, walidacja, błędy.                                             |
| **API – Flashcards**     | `GET/POST /api/flashcards`, `GET/PUT/DELETE /api/flashcards/[id]` – CRUD, paginacja, filtrowanie, sortowanie, izolacja po `user_id`.                                                        |
| **Serwisy**              | `FlashcardService` (createBatch, getFlashcards, getFlashcardById, update, delete, validateGenerationIds), `GenerationService` (getAll, getById, generateFlashcards – z mockiem OpenRouter). |
| **Walidacja (Zod)**      | Schematy: `auth.schema`, `flashcards.schema`, `generations.schema` – poprawność reguł i komunikatów.                                                                                        |
| **Komponenty React**     | Formularze (LoginForm, RegisterForm), widoki (FlashcardsView, GenerationsView, GenerationDetailView, StudySessionView), komponenty UI (Pagination, modale, przyciski).                      |
| **Ścieżki i middleware** | Dostęp do stron chronionych bez logowania → przekierowanie na `/login`; ścieżki publiczne (`/login`, `/register`, `/api/auth/*`) dostępne bez sesji.                                        |

### Poza zakresem (w tym dokumencie)

- Testy wydajnościowe/obciążeniowe (można dodać w kolejnej iteracji).
- Testy bezpieczeństwa penetracyjne.
- Testy ręczne eksploracyjne (wymagają osobnej procedury).

---

## 3. Typy testów do przeprowadzenia

| Typ                          | Narzędzia (rekomendowane)      | Zakres                                                                                                          |
| ---------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **Testy jednostkowe**        | Vitest                         | Serwisy (z mockami Supabase/OpenRouter), funkcje pomocnicze, parsowanie/walidacja (Zod).                        |
| **Testy komponentów React**  | Vitest + React Testing Library | Formularze auth, listy, paginacja, modale, obsługa błędów i stanów ładowania.                                   |
| **Testy API (integracyjne)** | Vitest (lub Playwright)        | Wywołania HTTP do endpointów Astro z mockiem Supabase; walidacja statusów, nagłówków i treści JSON.             |
| **Testy E2E**                | Playwright                     | Pełne scenariusze: rejestracja → logowanie → generowanie → zapis fiszek → nauka; ścieżki chronione i publiczne. |

Projekt obecnie nie ma w `package.json` zależności do Vitest ani Playwright; plan zakłada ich dodanie zgodnie z regułami `.cursor/rules` (Vitest, React Testing Library, Playwright).

---

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja

| ID      | Scenariusz                              | Kroki                                                                                   | Oczekiwany wynik                                   |
| ------- | --------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| AUTH-01 | Logowanie – poprawne dane               | Wysłanie POST `/api/auth/login` z poprawnym email i hasłem                              | 200, JSON z `user.id`, `user.email`                |
| AUTH-02 | Logowanie – błędne hasło                | POST z poprawnym email, błędne hasło                                                    | 401, `invalid_credentials`                         |
| AUTH-03 | Logowanie – walidacja                   | POST z pustym email / niepoprawnym formatem email / za krótkim hasłem                   | 400, `validation_error`, szczegóły Zod             |
| AUTH-04 | Rejestracja – poprawne dane             | POST `/api/auth/register` z poprawnym email i hasłem (Zod: min 8 znaków, litera, cyfra) | 201 lub 200, sukces                                |
| AUTH-05 | Rejestracja – email zajęty              | POST z emailem już istniejącym                                                          | 400/409, komunikat o zajętym emailu                |
| AUTH-06 | Middleware – strona chroniona bez sesji | GET np. `/generate` bez ciasteczka sesji                                                | 302 na `/login`                                    |
| AUTH-07 | Middleware – strona publiczna           | GET `/login`, `/register` bez sesji                                                     | 200, strona się ładuje                             |
| AUTH-08 | Wylogowanie                             | POST `/api/auth/logout` z sesją, następnie request do chronionej strony                 | Sesja zakończona, dalszy request → 302 na `/login` |

### 4.2 Generowanie fiszek (AI)

| ID     | Scenariusz                                  | Kroki                                                                             | Oczekiwany wynik                                                  |
| ------ | ------------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| GEN-01 | Generowanie – poprawny tekst                | POST `/api/generations` z `source_text` 1000–10000 znaków (zalogowany użytkownik) | 201, `generation_id`, `flashcards_proposals[]`, `generated_count` |
| GEN-02 | Generowanie – tekst za krótki               | POST z `source_text` &lt; 1000 znaków                                             | 400, błąd walidacji                                               |
| GEN-03 | Generowanie – brak autoryzacji              | POST bez sesji                                                                    | 401                                                               |
| GEN-04 | Lista generacji                             | GET `/api/generations?page=1&limit=10`                                            | 200, `data[]`, `pagination: { page, limit, total }`               |
| GEN-05 | Lista generacji – nieprawidłowa paginacja   | GET z `page=0` lub `limit=0`                                                      | 400                                                               |
| GEN-06 | Szczegóły generacji                         | GET `/api/generations/[id]` (właściciel)                                          | 200, obiekt generacji z `flashcards`                              |
| GEN-07 | Szczegóły generacji – cudza / nieistniejąca | GET z ID innego użytkownika lub nieistniejącym ID                                 | 404 lub 403                                                       |

### 4.3 Fiszki (CRUD)

| ID    | Scenariusz                                       | Kroki                                                                                                   | Oczekiwany wynik                        |
| ----- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| FC-01 | Lista fiszek                                     | GET `/api/flashcards?page=1&limit=10&sort=created_at&order=desc`                                        | 200, `data[]`, `pagination`             |
| FC-02 | Lista – filtrowanie po `source`, `generation_id` | GET z `source=ai-full`, `generation_id=123`                                                             | 200, tylko pasujące fiszki              |
| FC-03 | Utworzenie batch                                 | POST `/api/flashcards` z tablicą `flashcards` (front, back, source, generation_id zgodnie ze schematem) | 201, `flashcards[]` z ID                |
| FC-04 | Utworzenie – błędny `generation_id`              | POST z nieistniejącym `generation_id`                                                                   | 400, DatabaseError / invalid generation |
| FC-05 | Pobranie fiszki                                  | GET `/api/flashcards/[id]` (właściciel)                                                                 | 200, obiekt fiszki                      |
| FC-06 | Pobranie – cudza / brak                          | GET z ID innego użytkownika lub nieistniejącym                                                          | 404                                     |
| FC-07 | Aktualizacja                                     | PUT `/api/flashcards/[id]` z częściowym body (np. front, back)                                          | 200, zaktualizowana fiszka              |
| FC-08 | Usunięcie                                        | DELETE `/api/flashcards/[id]`                                                                           | 204                                     |
| FC-09 | Izolacja użytkownika                             | Operacje na ID fiszki innego użytkownika                                                                | 404 (nie 200)                           |

### 4.4 Serwisy (logika biznesowa)

| ID     | Obszar                                 | Co testować                                                                                                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| SVC-01 | FlashcardService.createBatch           | Wstawienie wielu fiszek, aktualizacja `accepted_unedited_count` / `accepted_edited_count` w `generations`                                        |
| SVC-02 | FlashcardService.getFlashcards         | Paginacja, sortowanie, filtry – poprawność zapytań i wyniku                                                                                      |
| SVC-03 | FlashcardService.validateGenerationIds | Nieistniejące ID → DatabaseError; pusta lista → brak błędu                                                                                       |
| SVC-04 | GenerationService.getAll               | Filtr `accepted_* > 0`, sort po `created_at desc`, paginacja                                                                                     |
| SVC-05 | GenerationService.generateFlashcards   | Z mockiem OpenRouter: hash tekstu, zapis metadanych w `generations`, zwrot `generation_id` i propozycji; błąd AI → log w `generation_error_logs` |

### 4.5 Komponenty UI

| ID    | Komponent / ekran                             | Co testować                                                                                              |
| ----- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| UI-01 | LoginForm                                     | Submit z poprawnymi/niepoprawnymi danymi, wyświetlanie błędu, przekierowanie po sukcesie, stan ładowania |
| UI-02 | RegisterForm                                  | Walidacja (email, hasło), komunikat o zajętym emailu, sukces                                             |
| UI-03 | FlashcardsView / GenerationsView              | Ładowanie listy, paginacja, pusty stan, błąd sieci                                                       |
| UI-04 | GenerationDetailView                          | Wyświetlanie generacji i fiszek, akcje (zapisz wybrane)                                                  |
| UI-05 | StudySessionView                              | Nawigacja między kartami, odsłanianie odpowiedzi, postęp                                                 |
| UI-06 | Pagination                                    | Przyciski next/prev, numer strony, brak next przy ostatniej stronie                                      |
| UI-07 | EditFlashcardModal / DeleteConfirmationDialog | Otwarcie, zamknięcie, potwierdzenie, anulowanie                                                          |

### 4.6 Walidacja (Zod)

| ID   | Schemat                               | Przykłady testów                                                                        |
| ---- | ------------------------------------- | --------------------------------------------------------------------------------------- |
| V-01 | auth: loginSchema                     | email wymagany i format; hasło wymagane                                                 |
| V-02 | auth: registerSchema                  | hasło: min 8, litera, cyfra; email jak wyżej                                            |
| V-03 | flashcards: flashcardsQuerySchema     | page, limit, sort, order, source, generation_id – granice i wartości nieprawidłowe      |
| V-04 | flashcards: create (flashcardSchema)  | source + generation_id (manual→null, ai-full/ai-edited→number); max długości front/back |
| V-05 | generations: generateFlashcardsSchema | source_text 1000–10000 znaków                                                           |

---

## 5. Środowisko testowe

- **Jednostkowe / komponentowe / API (Vitest):** Node 20+ (zgodnie z `.nvmrc`), środowisko testowe bez zewnętrznych usług; Supabase i OpenRouter – mockowane.
- **E2E (Playwright):** Przeglądarka (Chromium), lokalna instancja aplikacji (`astro dev` lub `astro preview`). Baza testowa: osobna baza Supabase (np. projekt testowy) lub kontenery z testową bazą, aby nie modyfikować danych deweloperskich.
- **Zmienne środowiskowe:** W testach używać `.env.test` lub zmiennych w `vitest.config` / `playwright.config` (np. `OPENROUTER_API_KEY` mockowany lub pusty w jednostkowych).

---

## 6. Narzędzia do testowania

| Cel                                  | Narzędzie                                      | Uwagi                                                                                                                             |
| ------------------------------------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Framework testów jednostkowych i API | **Vitest**                                     | Zgodne z `.cursor/rules/vitest-unit-testing.mdc`, dobra integracja z TypeScript i Vite/Astro.                                     |
| Testy komponentów React              | **React Testing Library**                      | Renderowanie, zdarzenia użytkownika, dostępność; unikać testów opartych na implementacji.                                         |
| Testy E2E                            | **Playwright**                                 | Zgodne z `.cursor/rules/playwright-e2e-testing.mdc`; Chromium; `data-testid` do selektorów; API Request dla weryfikacji backendu. |
| Mockowanie                           | `vi.mock()`, `vi.fn()` (Vitest)                | Supabase client, OpenRouter (fetch/HTTP), `import.meta.env`.                                                                      |
| Asercje                              | `expect` (Vitest), `@testing-library/jest-dom` | Rozszerzenie matcherów dla DOM.                                                                                                   |
| Pokrycie kodu                        | Vitest `coverage` (v8 lub istanbul)            | Progi opcjonalne; priorytet: serwisy, API, formularze.                                                                            |

Proponowana struktura katalogów:

- `src/**/*.test.ts` / `*.test.tsx` – testy jednostkowe obok kodu lub
- `tests/unit/` – serwisy, schematy;
- `tests/components/` – komponenty React;
- `tests/api/` – handlery API (jeśli wywoływane przez Vitest);
- `e2e/` – testy Playwright, `e2e/page-objects/` – modele stron.

---

## 7. Harmonogram testów

Proponowana kolejność wdrożenia:

| Faza                  | Zakres                                                                                                               | Szacowany wysiłek |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **1. Infrastruktura** | Dodanie Vitest + React Testing Library, konfiguracja, 1–2 testy przykładowe (np. schemat Zod, jedna funkcja z utils) | 0,5–1 dzień       |
| **2. Serwisy**        | FlashcardService, GenerationService (z mockami Supabase/OpenRouter)                                                  | 1–2 dni           |
| **3. API**            | Endpointy auth, generations, flashcards – testy integracyjne z mockowanym Supabase                                   | 1–2 dni           |
| **4. Komponenty**     | LoginForm, RegisterForm, Pagination, potem widoki list i szczegółów                                                  | 1–2 dni           |
| **5. E2E**            | Konfiguracja Playwright, 2–3 krytyczne ścieżki (logowanie, generowanie + zapis, nauka)                               | 1–2 dni           |
| **6. CI**             | Uruchamianie testów w GitHub Actions (Vitest, opcjonalnie Playwright)                                                | 0,5 dnia          |

Łącznie: ok. 5–10 dni roboczych w zależności od docelowego pokrycia i zespołu.

---

## 8. Kryteria akceptacji testów

- Wszystkie zaplanowane testy automatyczne (jednostkowe, komponentowe, API) są zielone w lokalnym uruchomieniu i w CI.
- Krytyczne ścieżki E2E (logowanie, generowanie, zapis fiszek, nauka) przechodzą na środowisku testowym.
- Każdy nowy endpoint lub istotna zmiana w serwisie/komponencie mają odpowiadające im testy (regresja).
- Błędy walidacji (Zod) i błędy biznesowe (np. 401, 404, invalid generation_id) są jawnie sprawdzane w testach.
- Testy nie zależą od zewnętrznych usług (Supabase/OpenRouter) w trybie jednostkowym – używane są mocki.
- Nazwy testów i asercje są na tyle czytelne, aby failure jednoznacznie wskazywał na źródło problemu.

---

## 9. Role i odpowiedzialności w procesie testowania

| Rola                       | Odpowiedzialność                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Deweloper**              | Pisanie i utrzymanie testów jednostkowych oraz testów komponentów dla własnego kodu; uruchamianie testów przed PR. |
| **QA (jeśli w zespole)**   | Projektowanie scenariuszy E2E, utrzymanie suite E2E, raportowanie błędów, weryfikacja kryteriów akceptacji.        |
| **Tech lead / maintainer** | Przegląd planu testów, ustalenie progów pokrycia (opcjonalnie), konfiguracja CI i środowisk testowych.             |
| **Product**                | Definiowanie krytycznych ścieżek użytkownika do priorytetyzacji testów E2E.                                        |

W małym zespole jedna osoba może łączyć powyższe role; ważne, aby „testy są częścią definition of done” było ustalone w procesie.

---

## 10. Procedury raportowania błędów

- **Źródło:** testy automatyczne (failure), testy E2E, testy ręczne, zgłoszenia użytkowników.
- **Format zgłoszenia (minimalny):** tytuł, kroki do reprodukcji, oczekiwany vs aktualny wynik, środowisko (przeglądarka, OS, wersja aplikacji), załączniki (logi, zrzuty ekranu, export z Playwright).
- **Priorytetyzacja:** krytyczne (blokuje główne ścieżki, np. logowanie, zapis fiszek), wysokie (błąd w drugorzędnej funkcji), średnie/niskie (kosmetyka, edge case).
- **Śledzenie:** w repozytorium GitHub – Issues z etykietami np. `bug`, `test-failure`, `e2e`; powiązanie z PR, jeśli błąd wykryty w review lub CI.
- **Regresja:** po naprawie błędu dodać test (jednostkowy lub E2E), który nie pozwoli na ponowne wprowadzenie tego samego błędu.

---

## Przegląd (Review)

**Podsumowanie:** Plan testów obejmuje wprowadzenie i cele, zakres (w tym i poza), typy testów (jednostkowe, komponentowe, API, E2E), szczegółowe scenariusze dla autentykacji, generowania, CRUD fiszek, serwisów, komponentów UI i walidacji Zod. Uwzględniono środowisko, narzędzia (Vitest, RTL, Playwright), harmonogram wdrożenia, kryteria akceptacji, role oraz procedury raportowania błędów.

**Dostosowanie do projektu:** Plan opiera się na analizie kodu (`src/pages/api`, `src/lib`, `src/components`, `src/middleware`) oraz na dokumentacji stosu (`.ai/coreDocumentation/tech-stack.md`) i jest spójny z regułami testowania w `.cursor/rules` (Vitest, Playwright).

**Uwagi:** W `package.json` brak obecnie Vitest i Playwright – ich dodanie jest pierwszym krokiem realizacji planu. Testy integracji z OpenRouter należy wykonywać przez mocki lub osobne, opcjonalne suite z kluczem testowym, aby uniknąć kosztów i niestabilności w CI.
