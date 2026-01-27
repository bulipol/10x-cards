# Plan Implementacji MVP - 10x-cards
**Data:** 2026-01-27
**Strategia:** Najpierw kompletna funkcjonalność z hardcoded user, potem auth, na końcu SSR

---

## Filozofia implementacji

**KLUCZOWA DECYZJA:**
Problemy 2 i 3 (SSR + usunięcie DEFAULT_USER_ID) **ODŁOŻONE** do końca, po zaimplementowaniu całej funkcjonalności biznesowej.

**Dlaczego?**
- Szybsze testowanie (nie trzeba się logować)
- Mniej zmiennych podczas debugowania
- Auth jako ostatnia warstwa security
- Wszystkie endpointy przetestowane przed integracją z prawdziwym auth

---

## ETAP 1: Kompletna funkcjonalność biznesowa (z DEFAULT_USER_ID)

Cel: Działająca aplikacja do nauki fiszek, gotowa do testowania

### 📊 Status ETAP 1

**Backend:**
- ✅ Zadanie 1.1.1: GET /api/flashcards - lista fiszek
- ✅ Zadanie 1.1.2: GET /api/flashcards/[id] - pojedyncza fiszka
- ✅ Zadanie 1.1.3: PUT /api/flashcards/[id] - edycja fiszki
- ✅ Zadanie 1.1.4: DELETE /api/flashcards/[id] - usuwanie fiszki

**Frontend:**
- ⏳ Zadanie 1.2.1: Widok /flashcards - lista fiszek
- ⏳ Zadanie 1.2.2: Modal edycji fiszki
- ⏳ Zadanie 1.2.3: Usuwanie fiszki z potwierdzeniem
- ⏳ Zadanie 1.2.4: Ręczne dodawanie fiszki

**Pozostałe:**
- ⏳ 1.3. Generations READ
- ⏳ 1.4. Sesja nauki
- ⏳ 1.5. Nawigacja

**Uwaga:** Auth checks zostały tymczasowo zakomentowane (tag `TODO: ETAP 3`) zgodnie z filozofią MVP. Wszystkie endpointy działają z `DEFAULT_USER_ID`.

---

### 1.1. Flashcards CRUD - Backend (Priorytet: KRYTYCZNY)

#### [x] Zadanie 1.1.1: GET /api/flashcards - lista fiszek
**Plik:** `src/pages/api/flashcards/index.ts` (rozszerzenie istniejącego)
**Zależności:** Brak (FlashcardService już istnieje)
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 2.1)

**Co zrobić:**
- Dodać metodę `getAll()` do `FlashcardService`
- Implementacja GET handler w `index.ts`
- Parametry query: `page`, `limit`, `sort`, `source`, `generation_id`
- Zwraca: `FlashcardsListResponseDto` z paginacją
- Walidacja: Zod schema
- Używa `DEFAULT_USER_ID` do filtrowania

**Rezultat:** Możliwość pobierania listy fiszek użytkownika

---

#### [x] Zadanie 1.1.2: GET /api/flashcards/[id] - pojedyncza fiszka
**Plik:** `src/pages/api/flashcards/[id].ts` (nowy)
**Zależności:** Zadanie 1.1.1
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 2.2)

**Co zrobić:**
- Dodać metodę `getById()` do `FlashcardService`
- Implementacja GET handler
- Walidacja: czy fiszka należy do użytkownika (DEFAULT_USER_ID)
- Zwraca 404 jeśli nie znaleziono
- Zwraca: `FlashcardDto`

**Rezultat:** Możliwość pobierania szczegółów pojedynczej fiszki

---

#### [x] Zadanie 1.1.3: PUT /api/flashcards/[id] - edycja fiszki
**Plik:** `src/pages/api/flashcards/[id].ts` (rozszerzenie)
**Zależności:** Zadanie 1.1.2
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 2.3)

**Co zrobić:**
- Dodać metodę `update()` do `FlashcardService`
- Implementacja PUT handler
- Walidacja: front ≤200, back ≤500 znaków
- Sprawdzenie czy fiszka należy do użytkownika
- Automatyczna aktualizacja `updated_at` (trigger DB)
- Zwraca: zaktualizowany `FlashcardDto`

**Rezultat:** Możliwość edycji zapisanych fiszek

---

#### [x] Zadanie 1.1.4: DELETE /api/flashcards/[id] - usuwanie fiszki
**Plik:** `src/pages/api/flashcards/[id].ts` (rozszerzenie)
**Zależności:** Zadanie 1.1.2
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 2.4)

**Co zrobić:**
- Dodać metodę `delete()` do `FlashcardService`
- Implementacja DELETE handler
- Sprawdzenie czy fiszka należy do użytkownika
- Hard delete (na razie bez soft delete)
- Zwraca 204 No Content

**Rezultat:** Możliwość usuwania fiszek

---

### 1.2. Flashcards - Frontend (Priorytet: KRYTYCZNY)

#### [ ] Zadanie 1.2.1: Widok /flashcards - lista fiszek
**Plik:** `src/pages/flashcards.astro` (nowy)
**Zależności:** Zadanie 1.1.1
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 3)

**Co zrobić:**
- Utworzyć stronę `flashcards.astro`
- Komponent `FlashcardListView.tsx` (client:load)
- Fetch GET /api/flashcards przy montowaniu
- Wyświetlanie listy fiszek (front/back)
- Loading state (Skeleton)
- Error handling
- Na razie bez paginacji (wszystkie fiszki)

**Rezultat:** Użytkownik widzi swoje zapisane fiszki

---

#### [ ] Zadanie 1.2.2: Modal edycji fiszki
**Plik:** `src/components/FlashcardEditModal.tsx` (nowy)
**Zależności:** Zadanie 1.1.3, 1.2.1
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 4)

**Co zrobić:**
- Komponent `FlashcardEditModal.tsx`
- Formularz z polami front/back
- Walidacja client-side (front ≤200, back ≤500)
- Przycisk "Save" wywołuje PUT /api/flashcards/[id]
- Toast notification po sukcesie
- Refresh listy po edycji
- Możliwość zamknięcia (ESC, klik poza modal, przycisk X)

**Rezultat:** Użytkownik może edytować fiszki inline

---

#### [ ] Zadanie 1.2.3: Usuwanie fiszki z potwierdzeniem
**Plik:** `src/components/FlashcardListView.tsx` (rozszerzenie)
**Zależności:** Zadanie 1.1.4, 1.2.1
**Plan:** `.ai/flashcards-endpoint-implementation-plan.md` (sekcja 5)

**Co zrobić:**
- Przycisk "Delete" przy każdej fiszce
- Dialog potwierdzenia (shadcn/ui AlertDialog)
- Wywołanie DELETE /api/flashcards/[id]
- Toast notification po sukcesie
- Usunięcie fiszki z listy w state (bez pełnego refetch)

**Rezultat:** Użytkownik może usuwać fiszki

---

#### [ ] Zadanie 1.2.4: Ręczne dodawanie fiszki
**Plik:** `src/components/FlashcardListView.tsx` (rozszerzenie)
**Zależności:** Zadanie 1.2.2 (ten sam modal)

**Co zrobić:**
- Przycisk "Dodaj fiszkę" w widoku /flashcards
- Otwiera `FlashcardEditModal` z pustym formularzem
- Wywołanie POST /api/flashcards (istniejący endpoint)
- Body: `{ source: "manual", front: "...", back: "...", generation_id: null }`
- Dodanie nowej fiszki do listy w state

**Rezultat:** Użytkownik może tworzyć fiszki ręcznie

---

### 1.3. Generations READ (Priorytet: ŚREDNI)

#### [ ] Zadanie 1.3.1: GET /api/generations - lista generacji
**Plik:** `src/pages/api/generations/index.ts` (rozszerzenie istniejącego)
**Zależności:** Brak
**Plan:** `.ai/generations-get-endpoint-implementation-plan.md` (sekcja 2.1)

**Co zrobić:**
- Dodać metodę `getAll()` do `GenerationService`
- Implementacja GET handler w `index.ts`
- Parametry query: `page`, `limit`, `sort`
- Zwraca listę `GenerationDto[]` z paginacją
- Filtrowanie po `DEFAULT_USER_ID`
- Sortowanie domyślne: `created_at DESC`

**Rezultat:** Możliwość pobierania historii generacji

---

#### [ ] Zadanie 1.3.2: GET /api/generations/[id] - szczegóły generacji
**Plik:** `src/pages/api/generations/[id].ts` (nowy)
**Zależności:** Zadanie 1.3.1
**Plan:** `.ai/generations-get-endpoint-implementation-plan.md` (sekcja 2.2)

**Co zrobić:**
- Dodać metodę `getById()` do `GenerationService`
- Implementacja GET handler
- Join z tabelą `flashcards` - pobiera powiązane fiszki
- Zwraca: `GenerationDetailDto` (generation + flashcards[])
- Walidacja: czy generacja należy do użytkownika

**Rezultat:** Możliwość przeglądania szczegółów generacji

---

#### [ ] Zadanie 1.3.3: (OPCJONALNE) Widok /generations - historia
**Plik:** `src/pages/generations.astro` (nowy)
**Zależności:** Zadanie 1.3.1, 1.3.2

**Co zrobić:**
- Strona z listą generacji
- Dla każdej generacji:
  - Data utworzenia
  - Liczba wygenerowanych fiszek
  - Status (success/error)
  - Przycisk "Zobacz szczegóły" → link do /generations/[id]
- Opcjonalnie: podstrona z szczegółami

**Rezultat:** Użytkownik widzi historię co generował

**UWAGA:** To zadanie można pominąć jeśli chcemy szybciej MVP. Historia jest dostępna przez API.

---

### 1.4. Sesja nauki (Priorytet: KRYTYCZNY!)

#### [ ] Zadanie 1.4.1: Widok /session - podstawowa sesja nauki
**Plik:** `src/pages/session.astro` (nowy)
**Zależności:** Zadanie 1.1.1 (potrzebujemy GET /flashcards)
**Plan:** Brak, ale inspiracja z `analizaWorkDone.md` (sekcja 2.1)

**Co zrobić:**
- Strona `session.astro`
- Komponent `StudySessionView.tsx` (client:load)
- Fetch GET /api/flashcards (wszystkie fiszki użytkownika)
- **Prosty algorytm:** losowy wybór fiszek
- Stan sesji:
  - `currentIndex` - aktualna fiszka
  - `showAnswer` - czy pokazać back
  - `completed` - liczba przejrzanych fiszek
- UI:
  - Wyświetlanie front fiszki
  - Przycisk "Pokaż odpowiedź" → pokazuje back
  - Przycisk "Następna fiszka" → losuje kolejną
  - Licznik postępu "5 / 20"
- **Bez zapisywania postępów** (na razie)

**Rezultat:** Użytkownik może się uczyć z fiszek!

**UWAGA:** To najbardziej wartościowe zadanie dla użytkownika końcowego!

---

#### [ ] Zadanie 1.4.2: (OPCJONALNE) Algorytm powtórek
**Zależności:** Zadanie 1.4.1
**Plan:** Do przemyślenia - wymaga migracji DB

**Co zrobić:**
- Dodać kolumny do tabeli `flashcards`:
  - `last_reviewed` (timestamp)
  - `next_review` (timestamp)
  - `ease_factor` (float)
  - `repetitions` (int)
- Implementacja algorytmu SM-2 (Spaced Repetition)
- Sortowanie fiszek po `next_review`
- Przyciski oceny: "Łatwe", "Średnie", "Trudne", "Zapomniane"

**Rezultat:** Inteligentne powtórki z algorytmem

**UWAGA:** To można dodać później. Na MVP wystarczy losowy wybór.

---

### 1.5. Nawigacja (Priorytet: WYSOKI)

#### [ ] Zadanie 1.5.1: Komponent Navigation
**Plik:** `src/components/Navigation.tsx` (nowy)
**Zależności:** Brak

**Co zrobić:**
- Komponent `Navigation.tsx`
- Logo/nazwa aplikacji "10x Cards"
- Linki:
  - "Generate" → /generate
  - "Moje Fiszki" → /flashcards
  - "Sesja nauki" → /session
- Responsive:
  - Desktop: poziome menu
  - Mobile: hamburger menu
- Active state dla aktualnej strony (highlight)
- Placeholder dla przycisku "Logout" (nieaktywny, do ETAPU 2)

**Rezultat:** Łatwe przechodzenie między widokami

---

#### [ ] Zadanie 1.5.2: Integracja Navigation w Layout
**Plik:** `src/layouts/Layout.astro` (rozszerzenie)
**Zależności:** Zadanie 1.5.1

**Co zrobić:**
- Dodać `<Navigation client:load />` do Layout.astro
- Umieścić nad główną treścią
- Styling: sticky top-0 lub fixed

**Rezultat:** Navigation widoczne na każdej stronie

---

## CHECKPOINT 1: Działająca aplikacja bez auth ✅

**Na tym etapie masz:**
- ✅ Generowanie fiszek przez AI
- ✅ Zarządzanie fiszkami (lista, edycja, usuwanie, ręczne dodawanie)
- ✅ Historia generacji (API, opcjonalnie UI)
- ✅ Sesja nauki (główna funkcjonalność!)
- ✅ Nawigacja
- ✅ Wszystko działa z `DEFAULT_USER_ID`

**To jest KOMPLETNA DZIAŁAJĄCA APLIKACJA gotowa do testowania!**

---

## ETAP 2: Autentykacja - UI i Endpoints

Cel: Dodać ekrany logowania/rejestracji

### 2.1. Auth Endpoints (Priorytet: KRYTYCZNY)

#### [ ] Zadanie 2.1.1: POST /api/auth/register
**Plik:** `src/pages/api/auth/register.ts` (nowy)
**Zależności:** Brak
**Plan:** `.ai/auth-endpoint-implementation-plan.md` (sekcja 2.1)

**Co zrobić:**
- Endpoint POST /api/auth/register
- Body: `{ email, password }`
- Walidacja: Zod schema (email format, password min 8 znaków)
- Wywołanie `supabaseClient.auth.signUp()`
- Zwraca: `{ user }` lub error
- **UWAGA:** Używamy obecnego `supabaseClient` (bez SSR, na razie)

**Rezultat:** Możliwość rejestracji nowego użytkownika

---

#### [ ] Zadanie 2.1.2: POST /api/auth/login
**Plik:** `src/pages/api/auth/login.ts` (nowy)
**Zależności:** Brak
**Plan:** `.ai/auth-endpoint-implementation-plan.md` (sekcja 2.2)

**Co zrobić:**
- Endpoint POST /api/auth/login
- Body: `{ email, password }`
- Wywołanie `supabaseClient.auth.signInWithPassword()`
- Zwraca: `{ user, session }` lub error
- Ustawienie session (na razie prosty sposób)

**Rezultat:** Możliwość logowania

---

#### [ ] Zadanie 2.1.3: POST /api/auth/logout
**Plik:** `src/pages/api/auth/logout.ts` (nowy)
**Zależności:** Brak
**Plan:** `.ai/auth-endpoint-implementation-plan.md` (sekcja 2.3)

**Co zrobić:**
- Endpoint POST /api/auth/logout
- Wywołanie `supabaseClient.auth.signOut()`
- Czyszczenie session
- Zwraca 200 OK

**Rezultat:** Możliwość wylogowania

---

### 2.2. Auth UI (Priorytet: KRYTYCZNY)

#### [ ] Zadanie 2.2.1: Strona /login
**Plik:** `src/pages/login.astro` (nowy)
**Zależności:** Zadanie 2.1.2
**Plan:** `.ai/auth-spec.md` (sekcja 2.1.1)

**Co zrobić:**
- Strona `login.astro`
- Komponent `LoginForm.tsx` (client:load)
- Formularz: email, password
- Walidacja client-side
- Wywołanie POST /api/auth/login
- Przekierowanie na /generate po sukcesie
- Link "Nie masz konta? Zarejestruj się" → /register
- Error handling (toast)

**Rezultat:** Użytkownik może się zalogować

---

#### [ ] Zadanie 2.2.2: Strona /register
**Plik:** `src/pages/register.astro` (nowy)
**Zależności:** Zadanie 2.1.1
**Plan:** `.ai/auth-spec.md` (sekcja 2.1.1)

**Co zrobić:**
- Strona `register.astro`
- Komponent `RegisterForm.tsx` (client:load)
- Formularz: email, password, confirm password
- Walidacja client-side (hasła muszą się zgadzać)
- Wywołanie POST /api/auth/register
- Komunikat "Sprawdź email" po sukcesie
- Link "Masz już konto? Zaloguj się" → /login

**Rezultat:** Użytkownik może się zarejestrować

---

#### [ ] Zadanie 2.2.3: Przycisk Logout w Navigation
**Plik:** `src/components/Navigation.tsx` (rozszerzenie)
**Zależności:** Zadanie 2.1.3, 1.5.1

**Co zrobić:**
- Aktywować przycisk "Logout"
- Wywołanie POST /api/auth/logout
- Przekierowanie na /login po wylogowaniu
- Pokazywać tylko gdy użytkownik zalogowany

**Rezultat:** Użytkownik może się wylogować

---

## CHECKPOINT 2: Aplikacja z auth UI ✅

**Na tym etapie masz:**
- ✅ Wszystko z CHECKPOINT 1
- ✅ Ekrany logowania/rejestracji
- ✅ Możliwość wylogowania
- ⚠️ **ALE:** Nadal używa `DEFAULT_USER_ID` w endpointach!
- ⚠️ **ALE:** Sesje nie są sprawdzane (każdy widzi te same dane)

**To przygotowanie pod ETAP 3.**

---

## ETAP 3: SSR + Refaktor (Problemy 2 i 3)

Cel: Prawdziwa autentykacja server-side, usunięcie DEFAULT_USER_ID

### 3.1. Instalacja @supabase/ssr

#### [ ] Zadanie 3.1.1: Instalacja pakietu
**Zależności:** Brak

**Co zrobić:**
```bash
npm install @supabase/ssr
```

**Rezultat:** Pakiet zainstalowany

---

### 3.2. Refaktor Supabase Client

#### [ ] Zadanie 3.2.1: Zaktualizować supabase.client.ts
**Plik:** `src/db/supabase.client.ts` (rozszerzenie)
**Zależności:** Zadanie 3.1.1
**Plan:** Problem 2 w `rozbieznosci-analiza-2026-01-27.md`

**Co zrobić:**
- Dodać `createSupabaseServerInstance()` zgodnie z `.cursor/rules/supabase-auth.mdc`
- **NIE USUWAĆ** starego `supabaseClient` (na razie)
- Dodać `cookieOptions`
- Dodać `parseCookieHeader()` helper
- Eksportować obie wersje klienta

**Rezultat:** SSR-ready Supabase client dostępny

---

### 3.3. Middleware z Auth Check

#### [ ] Zadanie 3.3.1: Zaktualizować middleware
**Plik:** `src/middleware/index.ts` (rozszerzenie)
**Zależności:** Zadanie 3.2.1
**Plan:** Problem 2 w `rozbieznosci-analiza-2026-01-27.md`

**Co zrobić:**
- Użyć `createSupabaseServerInstance()`
- Dodać `await supabase.auth.getUser()`
- Ustawić `locals.user` jeśli zalogowany
- Przekierować na `/login` jeśli nie zalogowany (poza PUBLIC_PATHS)
- PUBLIC_PATHS: `/login`, `/register`, `/reset-password`, `/api/auth/*`

**Rezultat:** Middleware sprawdza sesję przy każdym request

---

#### [ ] Zadanie 3.3.2: Zaktualizować env.d.ts
**Plik:** `src/env.d.ts` (rozszerzenie)
**Zależności:** Zadanie 3.3.1

**Co zrobić:**
- Dodać typ `user` do `App.Locals`:
```typescript
namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user?: {
      id: string;
      email: string;
    };
  }
}
```

**Rezultat:** TypeScript wie o `locals.user`

---

### 3.4. Refaktor Endpointów i Serwisów (Problem 3)

#### [ ] Zadanie 3.4.1: Refaktor GenerationService
**Plik:** `src/lib/generation.service.ts` (refaktor)
**Zależności:** Zadanie 3.3.2
**Plan:** Problem 3 w `rozbieznosci-analiza-2026-01-27.md`

**Co zrobić:**
- **USUNĄĆ** import `DEFAULT_USER_ID`
- Dodać parametr `userId: string` do metody `generateFlashcards()`
- Przekazywać `userId` do:
  - `saveGenerationMetadata()`
  - `logGenerationError()`
- Wszystkie inserty do DB używają `userId` z parametru

**Rezultat:** GenerationService nie używa hardcode

---

#### [ ] Zadanie 3.4.2: Refaktor POST /api/generations
**Plik:** `src/pages/api/generations.ts` (refaktor)
**Zależności:** Zadanie 3.4.1

**Co zrobić:**
- Sprawdzać `locals.user` na początku
- Jeśli brak: `return new Response({ error: "Unauthorized" }, { status: 401 })`
- Przekazywać `locals.user.id` do `generationService.generateFlashcards()`
- Używać `locals.supabase` zamiast importowanego klienta

**Rezultat:** Endpoint używa prawdziwego user_id z sesji

---

#### [ ] Zadanie 3.4.3: Refaktor FlashcardService
**Plik:** `src/lib/flashcard.service.ts` (weryfikacja)
**Zależności:** Zadanie 3.3.2

**Co zrobić:**
- Sprawdzić czy nie używa `DEFAULT_USER_ID` nigdzie
- Wszystkie metody już przyjmują `userId` jako parametr ✅
- Upewnić się, że wszystkie query używają `userId` z parametru

**Rezultat:** FlashcardService czysty

---

#### [ ] Zadanie 3.4.4: Refaktor wszystkich endpointów flashcards
**Pliki:**
- `src/pages/api/flashcards/index.ts`
- `src/pages/api/flashcards/[id].ts`
**Zależności:** Zadanie 3.4.3

**Co zrobić:**
- Każdy endpoint sprawdza `locals.user`
- Przekazuje `locals.user.id` do serwisów
- Używa `locals.supabase`
- Zwraca 401 jeśli nie zalogowany

**Rezultat:** Wszystkie endpointy flashcards używają prawdziwego user_id

---

#### [ ] Zadanie 3.4.5: Refaktor wszystkich endpointów generations
**Pliki:**
- `src/pages/api/generations/index.ts`
- `src/pages/api/generations/[id].ts`
**Zależności:** Zadanie 3.4.1

**Co zrobić:**
- To samo co 3.4.4, ale dla generations
- Sprawdzać `locals.user`
- Przekazywać `locals.user.id`

**Rezultat:** Wszystkie endpointy generations używają prawdziwego user_id

---

### 3.5. Usunięcie DEFAULT_USER_ID

#### [ ] Zadanie 3.5.1: Usunąć DEFAULT_USER_ID
**Plik:** `src/db/supabase.client.ts` (cleanup)
**Zależności:** Wszystkie zadania 3.4.x

**Co zrobić:**
- Usunąć export `DEFAULT_USER_ID`
- Szukać w całym projekcie czy nie jest używany nigdzie
- Jeśli znaleziono - naprawić przed usunięciem

**Rezultat:** Brak hardcoded user_id w projekcie

---

#### [ ] Zadanie 3.5.2: (OPCJONALNE) Usunąć stary supabaseClient
**Plik:** `src/db/supabase.client.ts` (cleanup)
**Zależności:** Zadanie 3.5.1

**Co zrobić:**
- Jeśli wszystkie endpointy używają `locals.supabase`
- Można usunąć eksport starego `supabaseClient`
- **OSTROŻNIE:** Może być używany w komponentach client-side!

**Rezultat:** Tylko SSR client w użyciu

---

### 3.6. Refaktor Auth Endpoints na SSR

#### [ ] Zadanie 3.6.1: Zaktualizować auth endpoints
**Pliki:**
- `src/pages/api/auth/register.ts`
- `src/pages/api/auth/login.ts`
- `src/pages/api/auth/logout.ts`
**Zależności:** Zadanie 3.2.1

**Co zrobić:**
- Użyć `createSupabaseServerInstance({ cookies, headers })` zamiast `supabaseClient`
- Cookies będą automatycznie ustawiane przez SSR client
- Zgodnie z przykładami w `.cursor/rules/supabase-auth.mdc`

**Rezultat:** Auth używa SSR cookies (httpOnly, secure)

---

## CHECKPOINT 3: PRODUKCYJNE MVP ✅

**Na tym etapie masz:**
- ✅ Wszystko z CHECKPOINT 1 i 2
- ✅ Prawdziwa autentykacja server-side
- ✅ Każdy użytkownik widzi tylko swoje dane
- ✅ Secure cookies (httpOnly)
- ✅ Middleware sprawdza sesję
- ✅ Brak hardcoded user_id
- ✅ **GOTOWE DO PRODUKCJI!**

---

## ETAP 4: Opcjonalne ulepszenia (NICE TO HAVE)

Te można dodać później, po uruchomieniu MVP.

### [ ] 4.1. Paginacja w /flashcards
- Obecnie: pobiera wszystkie fiszki
- Ulepszenie: dodać paginację (page, limit)

### [ ] 4.2. Filtry w /flashcards
- Filtrowanie po `source` (ai-full, ai-edited, manual)
- Filtrowanie po `generation_id`

### [ ] 4.3. Strona /reset-password
- Endpoint POST /api/auth/reset-password
- Endpoint POST /api/auth/update-password
- Strona /auth/callback (obsługa recovery token)

### [ ] 4.4. Algorytm powtórek w sesji nauki
- SM-2 algorithm
- Migracja DB (dodanie kolumn)
- Przyciski oceny trudności

### [ ] 4.5. Widok /generations - historia
- Lista wszystkich generacji
- Szczegóły każdej generacji

### [ ] 4.6. Statystyki użytkownika
- Liczba fiszek
- Liczba generacji
- Wykres postępów

### [ ] 4.7. Admin panel - error logs
- GET /api/generation-error-logs
- Tylko dla adminów

---

## Podsumowanie Timeline

| Etap | Liczba zadań | Szacowany czas | Priorytet |
|------|--------------|----------------|-----------|
| **ETAP 1** | 14 zadań | 15-20h | 🔴 KRYTYCZNY |
| **ETAP 2** | 6 zadań | 5-7h | 🔴 KRYTYCZNY |
| **ETAP 3** | 12 zadań | 6-8h | 🔴 KRYTYCZNY |
| **ETAP 4** | 7 zadań | ? | 🟢 OPCJONALNY |
| **SUMA MVP** | **32 zadania** | **26-35h** | - |

---

## Zasady wykonywania zadań

1. **Jedno zadanie na raz** - nie przeskakuj
2. **Testuj po każdym zadaniu** - upewnij się że działa przed kolejnym
3. **Commit po każdym zadaniu** - łatwy rollback
4. **Prostota** - minimalna implementacja, bez over-engineeringu
5. **Zgodność z planami** - trzymaj się `.ai/*.md`

---

## Kolejność zalecana

**Jeśli chcesz najszybciej zobaczyć wartość:**
1. Start: ETAP 1 (Zadania 1.1-1.2) - zarządzanie fiszkami
2. Potem: Zadanie 1.4.1 - sesja nauki ← **NAJWIĘKSZA WARTOŚĆ**
3. Potem: Zadanie 1.5 - nawigacja
4. Dopiero potem: ETAP 2 i 3

**Jeśli chcesz metodycznie:**
- ETAP 1 → ETAP 2 → ETAP 3 (kolejno)

---

## Status: GOTOWE DO ROZPOCZĘCIA

Plan jest kompletny. Zaznacz checkboxy w miarę wykonywania zadań.

**Pytanie:** Od którego zadania chcesz zacząć?

Rekomendacja: **Zadanie 1.1.1** (GET /api/flashcards)

---

## Changelog

| Data | Zmiana |
|------|--------|
| 2026-01-27 | Utworzenie planu MVP z podziałem na 3 etapy |
| 2026-01-27 | Decyzja: SSR (Problemy 2 i 3) odłożone do ETAPU 3 |
| 2026-01-27 | ✅ Ukończono zadania 1.1.1-1.1.4 (Flashcards CRUD Backend) |
| 2026-01-27 | Auth checks tymczasowo zakomentowane (zgodnie z filozofią ETAP 1) |
