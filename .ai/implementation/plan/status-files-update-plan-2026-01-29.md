# Plan aktualizacji plików z .ai/implementation/status/

**Data:** 2026-01-29  
**Cel:** Zgodność dokumentów statusu z aktualną implementacją

---

## 1. Weryfikacja stanu implementacji (wykonane 2026-01-29)

### API Endpoints – stan faktyczny

| Endpoint                | Metoda           | Plik                                 | Status |
| ----------------------- | ---------------- | ------------------------------------ | ------ |
| `/api/auth/register`    | POST             | `src/pages/api/auth/register.ts`     | ✅     |
| `/api/auth/login`       | POST             | `src/pages/api/auth/login.ts`        | ✅     |
| `/api/auth/logout`      | POST             | `src/pages/api/auth/logout.ts`       | ✅     |
| `/api/flashcards`       | GET, POST        | `src/pages/api/flashcards/index.ts`  | ✅     |
| `/api/flashcards/[id]`  | GET, PUT, DELETE | `src/pages/api/flashcards/[id].ts`   | ✅     |
| `/api/generations`      | GET, POST        | `src/pages/api/generations/index.ts` | ✅     |
| `/api/generations/[id]` | GET              | `src/pages/api/generations/[id].ts`  | ✅     |

**Razem: 11 endpointów zaimplementowanych.**

### Serwisy

- **FlashcardService:** `createBatch`, `getFlashcards`, `getFlashcardById`, `updateFlashcard`, `deleteFlashcard`, `validateGenerationIds` – pełny CRUD ✅
- **GenerationService:** pełna implementacja (w tym GET) ✅
- **OpenRouterService:** pełna implementacja ✅

### Strony (pages)

- `index.astro`, `generate.astro`, `flashcards.astro`, `login.astro`, `register.astro`, `study.astro`, `generations.astro`, `generations/[id].astro` ✅

### Komponenty

- Auth: `LoginForm.tsx`, `RegisterForm.tsx`, `UserMenu.tsx` ✅
- Flashcards: `FlashcardsView.tsx`, `EditFlashcardModal.tsx`, `DeleteConfirmationDialog.tsx`, `FlashcardsList.tsx`, itd. ✅
- Generations: `GenerationsView.tsx`, `GenerationDetailView.tsx`, `GenerationCard.tsx`, itd. ✅
- Study: `StudySessionView.tsx`, `StudyCard.tsx`, itd. ✅
- `Navigation.tsx` ✅

---

## 2. Ocena aktualności plików statusu

| Plik                                      | Data w dokumencie | Aktualny? | Uwagi                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ----------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **analizaWorkDone.md**                    | 2026-01-24        | ❌ NIE    | Mówi o 2/10 endpointów, 2/6 widoków, ~45% MVP. Nie uwzględnia CRUD flashcards, generations GET, auth, /flashcards, /study, /generations, /login, /register.                                                                                                  |
| **endpoints-todo.md**                     | 2026-01-29        | ✅ TAK    | 11 endpointów, 4 do zrobienia, ETAP 1 i 2 zakończone – zgodne z kodem.                                                                                                                                                                                       |
| **projectStatus-2026-01-27.md**           | 2026-01-27        | ❌ NIE    | ~45% MVP, 2/10 endpointów, 2/6 widoków; tabele i fazy nie odzwierciedlają obecnego stanu (auth i CRUD zrobione).                                                                                                                                             |
| **mvp-implementation-plan-2026-01-27.md** | 2026-01-27        | ❌ Wymaga | Link do `ToDo/mvp-plan-update-2026-01-29.md` nieaktualny (ToDo usunięty). Nazwy w planie: FlashcardListView, FlashcardEditModal, getAll/getById – w kodzie: FlashcardsView, EditFlashcardModal, getFlashcards/getFlashcardById. Brak „Ostatnia weryfikacja”. |
| **endpoints-todo.md**                     | 2026-01-29        | ❌ Wymaga | Treść stanu OK; brak wpisu „weryfikacja względem kodu”; spójność z pozostałymi plikami statusu (wspólna data weryfikacji, ewentualnie odnośniki do analizaWorkDone/projectStatus).                                                                           |

---

## 3. Lista zadań (todo)

- [x] **Zadanie 1:** Zaktualizować `analizaWorkDone.md`
  - Zmienić datę analizy na 2026-01-29.
  - Sekcja API: zmienić „2/10” na „11/15” (lub przyjąć inny mianownik zgodny z api-plan) i oznaczyć jako zaimplementowane: GET/POST flashcards, GET/PUT/DELETE [id], GET/POST generations, GET [id], POST auth/register, POST auth/login, POST auth/logout.
  - Sekcja „Braki”: usunąć lub przekreślić endpointy i widoki już zaimplementowane (GET/PUT/DELETE flashcards, GET generations, auth, /flashcards, /login, /register, /session → /study, /generations).
  - Sekcja FlashcardService: zaznaczyć, że są `getFlashcards`, `getFlashcardById`, `updateFlashcard`, `deleteFlashcard` (nazwy metod z kodu).
  - Sekcja widoki/strony: oznaczyć jako zaimplementowane: /flashcards, /login, /register, /study (session), /generations, /generations/[id], Navigation, UserMenu.
  - Zaktualizować tabele procentowe (API, widoki, user stories) i „Ogólny postęp” (~45% → ok. 80–85% dla zakresu ETAP 1+2).
  - Zaktualizować sekcje „Co działa”, „Krytyczne braki”, „Plan dalszych prac” tak, aby odpowiadały obecnemu stanowi (RLS/DEFAULT_USER_ID, ETAP 3 SSR, reset hasła, error logs – do zrobienia).
  - Dodać na końcu sekcję **Review (aktualizacja 2026-01-29)** z krótkim podsumowaniem zmian.

- [x] **Zadanie 2:** Zaktualizować `projectStatus-2026-01-27.md`
  - Opcja A: Zmienić nazwę na `projectStatus-2026-01-29.md` i zaktualizować całą treść.
  - Opcja B: Zostawić nazwę, dodać na górze datę „Ostatnia aktualizacja: 2026-01-29” i zaktualizować treść.
  - Zaktualizować „Podsumowanie wykonawcze”: stan ~45% → odzwierciedlający ETAP 1+2 (np. ~80–85% dla tego zakresu); „2 z 10 endpointów” → 11 z 15 (lub zgodnie z przyjętą konwencją); „2 z 6 widoków” → 6+ widoków (/, /generate, /flashcards, /login, /register, /study, /generations, /generations/[id]).
  - Tabela endpointów: dodać wszystkie 11 zaimplementowanych, usunąć lub przenieść do „Do zrobienia” tylko brakujące (reset hasła, delete account, error logs).
  - Sekcja „Co jest zaimplementowane”: API (11), serwisy (FlashcardService pełny CRUD), UI (wszystkie wymienione wyżej strony i komponenty), User Stories (zaktualizować listę US-001–US-009 zgodnie z implementacją).
  - Sekcja „Co zostało do zrobienia”: zostawić ETAP 3 (SSR, locals.user), ETAP 4 (reset hasła, delete account, error logs); usunąć lub skrócić fazy już zrealizowane (auth, flashcards CRUD, generations READ, nawigacja, sesja nauki).
  - Dodać sekcję **Review (aktualizacja 2026-01-29)**.

- [x] **Zadanie 3:** Zaktualizować `mvp-implementation-plan-2026-01-27.md`
  - Dodać na górze (po dacie): **Ostatnia weryfikacja względem kodu:** 2026-01-29.
  - Poprawić zepsuty link: `ToDo/mvp-plan-update-2026-01-29.md` → `.ai/implementation/plan/status-files-update-plan-2026-01-29.md`.
  - W sekcji Review na końcu: dodać notatkę o zgodności nazw z kodem (EditFlashcardModal, FlashcardsView; getFlashcards, getFlashcardById) – bez przepisywania całego planu, krótka adnotacja.
  - Changelog: wpis 2026-01-29 – weryfikacja względem kodu, poprawka linku do planu aktualizacji.

- [x] **Zadanie 4:** Zaktualizować `endpoints-todo.md`
  - Dodać w Review (lub osobna linia pod „Ostatnia aktualizacja”): **Weryfikacja względem kodu:** 2026-01-29 – lista 11 endpointów i ścieżki plików zweryfikowane.
  - Changelog: wpis 2026-01-29 – weryfikacja stanu względem kodu (przegląd `src/pages/api/`).
  - Opcjonalnie: w „Stan obecny” krótka wzmianka, że stan jest zsynchronizowany z analizaWorkDone/projectStatus po ich aktualizacji (albo po prostu data weryfikacji).

---

## 4. Zasady aktualizacji

- Ograniczać zmiany do minimum: tylko te sekcje, które są niezgodne z kodem.
- Zachować strukturę dokumentów (nagłówki, tabele) dla spójności.
- W każdym zaktualizowanym pliku dodać sekcję **Review (aktualizacja 2026-01-29)** z 2–3 zdaniami podsumowania.
- Nie zmieniać nazw plików historycznych (np. projectStatus-2026-01-27.md), chyba że użytkownik wyraźnie chce nową wersję z datą 2026-01-29.

---

## 5. Review (planu)

**Podsumowanie:** W folderze `.ai/implementation/status/` wszystkie cztery pliki wymagają aktualizacji. `analizaWorkDone.md` i `projectStatus-2026-01-27.md` – treść mocno nieaktualna (2/10 endpointów, ~45% MVP). `mvp-implementation-plan-2026-01-27.md` – poprawka linku (ToDo → .ai/implementation/plan), data weryfikacji, adnotacja o nazwach w kodzie. `endpoints-todo.md` – doprecyzowanie weryfikacji względem kodu i wpis w Changelogu. Powyższe todo można odhaczać w miarę wykonania aktualizacji.
