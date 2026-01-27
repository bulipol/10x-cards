# Plan implementacji widoku Moje Fiszki

## 1. Przegląd

Widok "Moje Fiszki" umożliwia zalogowanemu użytkownikowi przeglądanie, edycję oraz usuwanie zapisanych fiszek. Widok prezentuje listę fiszek z paginacją, pozwala na edycję treści fiszki w modalnym oknie dialogowym oraz usuwanie fiszek z potwierdzeniem operacji.

## 2. Routing widoku

Ścieżka: `/flashcards`

Widok będzie dostępny jako strona Astro z komponentem React renderowanym po stronie klienta (`client:load`).

## 3. Struktura komponentów

```
FlashcardsPage (Astro)
└── FlashcardsView (React - client:load)
    ├── FlashcardsHeader
    │   └── CreateFlashcardButton
    ├── FlashcardsEmptyState (warunkowy)
    ├── FlashcardsList
    │   └── FlashcardCard[]
    │       ├── FlashcardContent
    │       └── FlashcardActions
    ├── Pagination
    ├── EditFlashcardModal (Dialog)
    │   └── FlashcardForm
    ├── DeleteConfirmationDialog (AlertDialog)
    └── ErrorNotification
```

## 4. Szczegóły komponentów

### FlashcardsView
- **Opis:** Główny komponent kontenera zarządzający stanem widoku, pobieraniem danych i koordynacją interakcji między komponentami potomnymi.
- **Główne elementy:** `div` kontener zawierający FlashcardsHeader, FlashcardsList (lub EmptyState), Pagination, EditFlashcardModal, DeleteConfirmationDialog
- **Obsługiwane interakcje:**
  - Inicjalizacja pobierania fiszek przy montowaniu
  - Zmiana strony paginacji
  - Otwarcie/zamknięcie modala edycji
  - Otwarcie/zamknięcie dialogu usuwania
  - Obsługa sukcesu/błędu operacji API
- **Obsługiwana walidacja:** Brak bezpośredniej walidacji
- **Typy:** `FlashcardsViewState`, `FlashcardDto`, `PaginationDto`
- **Propsy:** Brak (komponent najwyższego poziomu)

### FlashcardsHeader
- **Opis:** Nagłówek widoku z tytułem i przyciskiem tworzenia nowej fiszki.
- **Główne elementy:** `header`, `h1`, `Button` (do tworzenia)
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku "Dodaj fiszkę" - otwiera modal edycji w trybie tworzenia
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak specyficznych
- **Propsy:** `onCreateClick: () => void`

### FlashcardsEmptyState
- **Opis:** Komunikat wyświetlany gdy użytkownik nie ma żadnych fiszek.
- **Główne elementy:** `div`, ikona, tekst informacyjny, przycisk CTA
- **Obsługiwane interakcje:**
  - Kliknięcie CTA - przekierowanie do generowania fiszek lub otwarcie formularza tworzenia
- **Obsługiwana walidacja:** Brak
- **Typy:** Brak specyficznych
- **Propsy:** `onCreateClick: () => void`

### FlashcardsList
- **Opis:** Lista fiszek wyświetlana w układzie siatki (grid).
- **Główne elementy:** `div` z klasami grid, mapowanie tablicy FlashcardCard
- **Obsługiwane interakcje:** Przekazywanie zdarzeń do komponentów potomnych
- **Obsługiwana walidacja:** Brak
- **Typy:** `FlashcardDto[]`
- **Propsy:**
  - `flashcards: FlashcardDto[]`
  - `onEdit: (flashcard: FlashcardDto) => void`
  - `onDelete: (flashcard: FlashcardDto) => void`

### FlashcardCard
- **Opis:** Pojedyncza karta fiszki wyświetlająca pytanie (front), odpowiedź (back) oraz przyciski akcji.
- **Główne elementy:** `div` karta, `p` dla front/back, `div` dla akcji, `Button` edycja, `Button` usuń
- **Obsługiwane interakcje:**
  - Kliknięcie karty lub przycisku edycji - wywołuje `onEdit`
  - Kliknięcie przycisku usuń - wywołuje `onDelete`
  - Nawigacja klawiaturą (Enter/Space na karcie)
- **Obsługiwana walidacja:** Brak
- **Typy:** `FlashcardDto`
- **Propsy:**
  - `flashcard: FlashcardDto`
  - `onEdit: () => void`
  - `onDelete: () => void`

### Pagination
- **Opis:** Kontrolki paginacji umożliwiające nawigację między stronami listy.
- **Główne elementy:** `nav`, przyciski Previous/Next, wyświetlanie aktualnej strony
- **Obsługiwane interakcje:**
  - Kliknięcie Previous - przejście do poprzedniej strony
  - Kliknięcie Next - przejście do następnej strony
- **Obsługiwana walidacja:** Brak
- **Typy:** `PaginationDto`
- **Propsy:**
  - `pagination: PaginationDto`
  - `onPageChange: (page: number) => void`
  - `isLoading: boolean`

### EditFlashcardModal
- **Opis:** Modalne okno dialogowe do edycji lub tworzenia fiszki. Używa komponentu Dialog z shadcn/ui.
- **Główne elementy:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, formularz z Textarea dla front/back, przyciski Cancel/Save
- **Obsługiwane interakcje:**
  - Zmiana wartości pól formularza
  - Kliknięcie Save - walidacja i zapisanie
  - Kliknięcie Cancel lub zamknięcie - anulowanie edycji
- **Obsługiwana walidacja:**
  - `front`: wymagane, maksymalnie 200 znaków
  - `back`: wymagane, maksymalnie 500 znaków
- **Typy:** `FlashcardDto | null`, `FlashcardFormData`
- **Propsy:**
  - `isOpen: boolean`
  - `flashcard: FlashcardDto | null` (null oznacza tryb tworzenia)
  - `onClose: () => void`
  - `onSave: (data: FlashcardFormData) => Promise<void>`
  - `isLoading: boolean`

### DeleteConfirmationDialog
- **Opis:** Dialog potwierdzenia usunięcia fiszki. Używa komponentu AlertDialog z shadcn/ui.
- **Główne elementy:** `AlertDialog`, `AlertDialogContent`, tekst potwierdzenia, przyciski Cancel/Delete
- **Obsługiwane interakcje:**
  - Kliknięcie Delete - potwierdza usunięcie
  - Kliknięcie Cancel - anuluje operację
- **Obsługiwana walidacja:** Brak
- **Typy:** `FlashcardDto | null`
- **Propsy:**
  - `isOpen: boolean`
  - `flashcard: FlashcardDto | null`
  - `onClose: () => void`
  - `onConfirm: () => Promise<void>`
  - `isLoading: boolean`

## 5. Typy

### Istniejące typy (z `src/types.ts`)
```typescript
// DTO fiszki zwracane przez API
type FlashcardDto = {
  id: number;
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: number | null;
  created_at: string;
  updated_at: string;
};

// DTO paginacji
interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

// Odpowiedź listy fiszek
interface FlashcardsListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}

// DTO aktualizacji fiszki
type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: number | null;
}>;
```

### Nowe typy do implementacji

```typescript
// Stan widoku FlashcardsView
interface FlashcardsViewState {
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  editingFlashcard: FlashcardDto | null;
  deletingFlashcard: FlashcardDto | null;
  isEditModalOpen: boolean;
  isDeleteDialogOpen: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}

// Dane formularza edycji/tworzenia fiszki
interface FlashcardFormData {
  front: string;
  back: string;
}

// DTO tworzenia pojedynczej fiszki (dla manualnego tworzenia)
interface CreateFlashcardDto {
  front: string;
  back: string;
  source: "manual";
  generation_id: null;
}

// Parametry zapytania GET /flashcards
interface FlashcardsQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}
```

## 6. Zarządzanie stanem

### Custom Hook: `useFlashcards`

**Lokalizacja:** `src/components/hooks/useFlashcards.ts` (zgodnie z konwencją projektu)

Hook zarządzający całym stanem widoku fiszek i komunikacją z API.

```typescript
interface UseFlashcardsReturn {
  // Stan
  flashcards: FlashcardDto[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  isDeleting: boolean;

  // Akcje (opakowane w useCallback dla optymalizacji)
  fetchFlashcards: (params?: FlashcardsQueryParams) => Promise<void>;
  createFlashcard: (data: FlashcardFormData) => Promise<void>;
  updateFlashcard: (id: number, data: FlashcardFormData) => Promise<void>;
  deleteFlashcard: (id: number) => Promise<void>;
  changePage: (page: number) => void;
  clearError: () => void;
}
```

**Odpowiedzialności hooka:**
- Pobieranie listy fiszek z paginacją
- Tworzenie nowej fiszki (manualne)
- Aktualizacja istniejącej fiszki
- Usuwanie fiszki
- Zarządzanie stanami ładowania i błędów
- Automatyczne odświeżanie listy po operacjach CRUD

**Optymalizacje React:**
- Użyj `useCallback` dla wszystkich funkcji przekazywanych do komponentów potomnych
- Użyj `useMemo` dla obliczania `hasNextPage` i `hasPreviousPage`
- Rozważ `useTransition` dla non-urgent state updates (np. zmiana strony)

**Stan początkowy:**
```typescript
const initialState: FlashcardsViewState = {
  flashcards: [],
  pagination: { page: 1, limit: 10, total: 0 },
  isLoading: true,
  error: null,
  editingFlashcard: null,
  deletingFlashcard: null,
  isEditModalOpen: false,
  isDeleteDialogOpen: false,
  isSaving: false,
  isDeleting: false,
};
```

## 7. Stylowanie (Tailwind)

### Klasy Tailwind dla głównych komponentów

**FlashcardsList:**
```
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

**FlashcardCard:**
```
border rounded-lg p-4 space-y-3 transition-colors bg-white hover:bg-accent/50
focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
```

**Pagination:**
```
flex items-center justify-between py-4
```

**EmptyState:**
```
flex flex-col items-center justify-center py-12 text-center
```

### Responsywność
- Mobile: 1 kolumna (`grid-cols-1`)
- Tablet: 2 kolumny (`md:grid-cols-2`)
- Desktop: 3 kolumny (`lg:grid-cols-3`)

### Dark mode
Używaj wariantu `dark:` dla alternatywnych stylów w trybie ciemnym:
```
bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700
```

## 8. Dostępność (ARIA)

### Wymagane atrybuty ARIA

**FlashcardsList:**
- `role="list"` na kontenerze
- `aria-label="Lista fiszek"`
- `aria-busy={isLoading}` podczas ładowania

**FlashcardCard:**
- `role="listitem"` na karcie
- `tabIndex={0}` dla nawigacji klawiaturą
- `aria-label="Fiszka: {front}"` dla screen readers
- `onKeyDown` obsługa Enter/Space

**EditFlashcardModal:**
- Dialog z shadcn/ui automatycznie obsługuje `aria-modal`, `role="dialog"`
- Dodaj `aria-labelledby` wskazujący na tytuł
- Dodaj `aria-describedby` dla opisu formularza

**DeleteConfirmationDialog:**
- AlertDialog z shadcn/ui automatycznie obsługuje odpowiednie role
- Użyj `aria-live="assertive"` dla komunikatu potwierdzenia

**Textarea w formularzu:**
- `aria-invalid={hasError}` gdy walidacja nie przeszła
- `aria-describedby` wskazujący na komunikat błędu i licznik znaków

**Komunikaty błędów:**
- `aria-live="polite"` dla ErrorNotification
- `role="alert"` dla krytycznych błędów

### Nawigacja klawiaturą
- **Tab**: przemieszczanie między elementami interaktywnymi
- **Enter/Space**: aktywacja kart i przycisków
- **Escape**: zamknięcie modala/dialogu
- **Arrow keys**: opcjonalna nawigacja w liście

## 9. Integracja API

### Uwaga dotycząca Supabase

W endpointach API **zawsze używaj** `locals.supabase` z kontekstu Astro zamiast importowania klienta bezpośrednio:

```typescript
// ✅ Poprawnie
export const GET: APIRoute = async ({ locals }) => {
  const flashcardService = new FlashcardService(locals.supabase);
  // ...
};

// ❌ Niepoprawnie
import { supabaseClient } from "@/db/supabase.client";
```

### Endpointy do zaimplementowania (backend)

#### GET `/api/flashcards`
- **Żądanie:** Query params - `page`, `limit`, `sort`, `order`
- **Odpowiedź:** `FlashcardsListResponseDto`
- **Błędy:** 401 (nieautoryzowany), 500 (błąd serwera)

#### GET `/api/flashcards/[id]`
- **Żądanie:** Path param - `id`
- **Odpowiedź:** `FlashcardDto`
- **Błędy:** 401, 404 (nie znaleziono), 500

#### PUT `/api/flashcards/[id]`
- **Żądanie:** Path param - `id`, Body - `FlashcardUpdateDto`
- **Odpowiedź:** `FlashcardDto`
- **Błędy:** 400 (nieprawidłowe dane), 401, 404, 500

#### DELETE `/api/flashcards/[id]`
- **Żądanie:** Path param - `id`
- **Odpowiedź:** `{ success: true }`
- **Błędy:** 401, 404, 500

### Wywołania API z frontendu

```typescript
// Pobranie listy fiszek
const fetchFlashcards = async (params: FlashcardsQueryParams) => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  const response = await fetch(`/api/flashcards?${searchParams}`);
  if (!response.ok) throw new Error("Failed to fetch flashcards");
  return response.json() as Promise<FlashcardsListResponseDto>;
};

// Utworzenie fiszki
const createFlashcard = async (data: CreateFlashcardDto) => {
  const response = await fetch("/api/flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flashcards: [data] }),
  });
  if (!response.ok) throw new Error("Failed to create flashcard");
  return response.json();
};

// Aktualizacja fiszki
const updateFlashcard = async (id: number, data: FlashcardUpdateDto) => {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update flashcard");
  return response.json() as Promise<FlashcardDto>;
};

// Usunięcie fiszki
const deleteFlashcard = async (id: number) => {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete flashcard");
};
```

## 10. Interakcje użytkownika

### Przeglądanie listy fiszek
1. Użytkownik wchodzi na `/flashcards`
2. System wyświetla skeleton loader podczas ładowania
3. Po załadowaniu wyświetla się lista fiszek (lub empty state)
4. Każda fiszka pokazuje pytanie (front) i odpowiedź (back)

### Nawigacja między stronami
1. Użytkownik klika "Następna" lub "Poprzednia"
2. System pobiera odpowiednią stronę danych
3. Lista aktualizuje się z nowymi fiszkami

### Edycja fiszki
1. Użytkownik klika na fiszkę lub przycisk "Edytuj"
2. Otwiera się modal z formularzem wypełnionym danymi fiszki
3. Użytkownik modyfikuje treść (front/back)
4. Użytkownik klika "Zapisz"
5. System waliduje dane i wysyła żądanie PUT
6. Po sukcesie modal się zamyka, lista się odświeża, pojawia się toast sukcesu

### Tworzenie nowej fiszki
1. Użytkownik klika "Dodaj fiszkę"
2. Otwiera się pusty modal formularza
3. Użytkownik wpisuje treść (front/back)
4. Użytkownik klika "Zapisz"
5. System waliduje dane i wysyła żądanie POST
6. Po sukcesie modal się zamyka, lista się odświeża, pojawia się toast sukcesu

### Usuwanie fiszki
1. Użytkownik klika przycisk "Usuń" przy fiszce
2. Otwiera się dialog potwierdzenia
3. Użytkownik klika "Usuń" w dialogu
4. System wysyła żądanie DELETE
5. Po sukcesie dialog się zamyka, lista się odświeża, pojawia się toast sukcesu

### Obsługa klawiatury
- Tab: nawigacja między elementami
- Enter/Space: aktywacja przycisków i kart
- Escape: zamknięcie modala/dialogu

## 11. Warunki i walidacja

### Walidacja formularza edycji/tworzenia

| Pole | Warunek | Komunikat błędu |
|------|---------|-----------------|
| `front` | Wymagane, niepuste | "Pytanie jest wymagane" |
| `front` | Maksymalnie 200 znaków | "Pytanie może mieć maksymalnie 200 znaków" |
| `back` | Wymagane, niepuste | "Odpowiedź jest wymagana" |
| `back` | Maksymalnie 500 znaków | "Odpowiedź może mieć maksymalnie 500 znaków" |

### Warunki włączenia/wyłączenia przycisków

| Przycisk | Warunek aktywności |
|----------|-------------------|
| "Zapisz" (modal) | `front.trim().length > 0 && front.length <= 200 && back.trim().length > 0 && back.length <= 500 && !isSaving` |
| "Usuń" (dialog) | `!isDeleting` |
| "Poprzednia" | `pagination.page > 1 && !isLoading` |
| "Następna" | `pagination.page * pagination.limit < pagination.total && !isLoading` |

### Wyświetlanie liczników znaków

W polach textarea wyświetlany jest licznik w formacie `{current}/{max}`:
- Front: `{front.length}/200`
- Back: `{back.length}/500`

Licznik zmienia kolor na czerwony gdy limit jest przekroczony.

## 12. Autoryzacja i bezpieczeństwo

### Wymagania bezpieczeństwa (US-009)

Zgodnie z PRD, tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.

### Sprawdzanie autoryzacji

**Na poziomie strony Astro (`src/pages/flashcards.astro`):**
```astro
---
const session = await Astro.locals.supabase.auth.getSession();

if (!session.data.session) {
  return Astro.redirect('/login');
}
---
```

**Na poziomie API (każdy endpoint):**
```typescript
export const GET: APIRoute = async ({ locals }) => {
  const { data: { user } } = await locals.supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Użyj user.id zamiast DEFAULT_USER_ID
  const flashcardService = new FlashcardService(locals.supabase);
  // ...
};
```

### Row-Level Security (RLS)

Baza danych Supabase powinna mieć włączone RLS dla tabeli `flashcards`:
- Użytkownik może SELECT/INSERT/UPDATE/DELETE tylko rekordy gdzie `user_id = auth.uid()`

## 13. Obsługa błędów

### Scenariusze błędów

| Scenariusz | Obsługa |
|------------|---------|
| Błąd pobierania listy | Wyświetl komunikat błędu z przyciskiem "Spróbuj ponownie" |
| Błąd tworzenia fiszki | Toast z komunikatem błędu, modal pozostaje otwarty |
| Błąd edycji fiszki | Toast z komunikatem błędu, modal pozostaje otwarty |
| Błąd usuwania fiszki | Toast z komunikatem błędu, dialog pozostaje otwarty |
| Błąd 401 (nieautoryzowany) | Przekierowanie na stronę logowania |
| Błąd 404 (nie znaleziono) | Toast "Fiszka nie została znaleziona", odśwież listę |
| Błąd sieciowy | Toast "Błąd połączenia. Sprawdź połączenie internetowe" |
| Błąd walidacji (400) | Wyświetl szczegóły błędów walidacji z API |

### Komponent ErrorNotification

Wykorzystaj istniejący komponent `ErrorNotification` do wyświetlania błędów krytycznych (np. błąd ładowania listy).

### Toasty

Wykorzystaj istniejący `Toaster` (sonner) do wyświetlania:
- Sukces: "Fiszka została zapisana", "Fiszka została usunięta"
- Błąd: komunikaty błędów operacji CRUD

## 14. Kroki implementacji

### Faza 1: Backend - Endpointy API

1. **Rozszerzenie FlashcardService** (`src/lib/flashcard.service.ts`)
   - Dodaj metodę `getList(userId, params)` - pobieranie listy z paginacją
   - Dodaj metodę `getById(userId, id)` - pobieranie pojedynczej fiszki
   - Dodaj metodę `update(userId, id, data)` - aktualizacja fiszki
   - Dodaj metodę `delete(userId, id)` - usunięcie fiszki

2. **Endpoint GET /api/flashcards** (`src/pages/api/flashcards.ts`)
   - Dodaj handler GET do istniejącego pliku
   - Walidacja query params (page, limit, sort, order)
   - Wywołanie serwisu i zwrócenie wyników z paginacją

3. **Endpoint GET/PUT/DELETE /api/flashcards/[id]** (`src/pages/api/flashcards/[id].ts`)
   - Stwórz nowy plik z dynamicznym routingiem
   - Implementuj handlery GET, PUT, DELETE
   - Walidacja danych wejściowych (Zod)
   - Obsługa błędów

### Faza 2: Komponenty UI

4. **Instalacja komponentów shadcn/ui**
   - Zainstaluj Dialog: `npx shadcn@latest add dialog`
   - Zainstaluj AlertDialog: `npx shadcn@latest add alert-dialog`
   - Zainstaluj Card (opcjonalnie): `npx shadcn@latest add card`

5. **Komponent FlashcardCard** (`src/components/flashcards/FlashcardCard.tsx`)
   - Implementuj wyświetlanie fiszki
   - Dodaj przyciski edycji i usuwania
   - Obsłuż dostępność (role, aria-labels, obsługa klawiatury)

6. **Komponent FlashcardsList** (`src/components/flashcards/FlashcardsList.tsx`)
   - Implementuj layout siatki
   - Mapuj fiszki do FlashcardCard

7. **Komponent Pagination** (`src/components/flashcards/Pagination.tsx`)
   - Implementuj przyciski Previous/Next
   - Wyświetl informację o aktualnej stronie

8. **Komponent EditFlashcardModal** (`src/components/flashcards/EditFlashcardModal.tsx`)
   - Użyj Dialog z shadcn/ui
   - Implementuj formularz z polami front/back
   - Dodaj walidację i liczniki znaków
   - Obsłuż stany ładowania

9. **Komponent DeleteConfirmationDialog** (`src/components/flashcards/DeleteConfirmationDialog.tsx`)
   - Użyj AlertDialog z shadcn/ui
   - Implementuj tekst potwierdzenia
   - Obsłuż stany ładowania

10. **Komponent FlashcardsEmptyState** (`src/components/flashcards/FlashcardsEmptyState.tsx`)
    - Implementuj komunikat i CTA

### Faza 3: Logika stanu i integracja

11. **Custom hook useFlashcards** (`src/components/hooks/useFlashcards.ts`)
    - Implementuj zarządzanie stanem
    - Implementuj wywołania API
    - Implementuj obsługę błędów
    - Użyj `useCallback` dla funkcji przekazywanych do dzieci
    - Użyj `useMemo` dla wartości pochodnych (hasNextPage, hasPreviousPage)

12. **Komponent FlashcardsView** (`src/components/flashcards/FlashcardsView.tsx`)
    - Połącz wszystkie komponenty
    - Użyj hooka useFlashcards
    - Zarządzaj otwieraniem/zamykaniem modali

### Faza 4: Strona i finalizacja

13. **Strona Astro** (`src/pages/flashcards.astro`)
    - Stwórz stronę z Layout
    - Dodaj FlashcardsView z client:load

14. **Testy i poprawki**
    - Przetestuj wszystkie interakcje użytkownika
    - Sprawdź obsługę błędów
    - Zweryfikuj dostępność (keyboard navigation, screen readers)
    - Sprawdź responsywność na różnych urządzeniach
