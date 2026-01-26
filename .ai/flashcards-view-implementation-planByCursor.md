# Plan implementacji widoku Moje Fiszki (Flashcards View)

## 1. Przegląd
Widok "Moje Fiszki" służy do przeglądania, edycji oraz usuwania fiszek zapisanych przez użytkownika. Umożliwia zarządzanie bazą wiedzy poprzez interfejs listy, z możliwością szybkiej edycji treści (inline) oraz bezpiecznego usuwania elementów.

## 2. Routing widoku
- **Ścieżka:** `/flashcards`
- **Dostęp:** Tylko dla zalogowanych użytkowników (Wymagana weryfikacja sesji po stronie serwera w Astro oraz tokena przy zapytaniach API).

## 3. Struktura komponentów
- `src/pages/flashcards.astro` (Strona Astro)
  - `Layout` (Główny layout aplikacji)
    - `FlashcardManager` (Główny kontener React - Client Island)
      - `SavedFlashcardList` (Lista fiszek)
        - `SavedFlashcardItem` (Pojedyncza fiszka z logiką edycji i usuwania)
          - `AlertDialog` (Komponent Shadcn do potwierdzenia usunięcia)

## 4. Szczegóły komponentów

### `FlashcardManager` (`src/components/FlashcardManager.tsx`)
- **Opis:** Komponent typu "Container". Odpowiada za pobranie danych z API, przechowywanie globalnego stanu listy fiszek oraz udostępnianie funkcji modyfikujących dane (odświeżenie listy po usunięciu/edycji).
- **Główne elementy:**
  - Hooki `useEffect` do pobierania danych.
  - Obsługa stanów ładowania (`SkeletonLoader`) i błędów (`ErrorNotification`).
  - Renderowanie `SavedFlashcardList`.
- **Obsługiwane interakcje:** Inicjalne pobranie danych.
- **Typy:** Zarządza listą `FlashcardDto[]`.

### `SavedFlashcardList` (`src/components/SavedFlashcardList.tsx`)
- **Opis:** Komponent prezentacyjny wyświetlający siatkę (grid) fiszek.
- **Główne elementy:** Grid container (CSS Grid/Flex).
- **Propsy:**
  - `flashcards`: `FlashcardDto[]`
  - `onUpdate`: `(id: number, data: FlashcardUpdateDto) => Promise<void>`
  - `onDelete`: `(id: number) => Promise<void>`

### `SavedFlashcardItem` (`src/components/SavedFlashcardItem.tsx`)
- **Opis:** Reprezentuje pojedynczą fiszkę. Posiada dwa tryby: wyświetlania i edycji.
- **Główne elementy:**
  - Tryb wyświetlania: Tekst (przód/tył), przyciski "Edytuj" i "Usuń".
  - Tryb edycji: `Textarea` dla przodu i tyłu, przyciski "Zapisz" i "Anuluj".
  - Modal usuwania: `AlertDialog` z Shadcn/ui.
- **Obsługiwane interakcje:**
  - Przełączanie trybu edycji.
  - Walidacja on-change (długość tekstu).
  - Wywołanie `onUpdate` przy zapisie.
  - Wywołanie `onDelete` po potwierdzeniu w modalu.
- **Obsługiwana walidacja:**
  - Front: max 200 znaków, niepusty.
  - Back: max 500 znaków, niepusty.

## 5. Typy

Wykorzystanie istniejących typów z `src/types.ts`:

- **FlashcardDto**: Główny model danych.
  ```typescript
  export type FlashcardDto = Pick<
    Flashcard,
    "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
  >;
  ```

- **FlashcardUpdateDto**: Model do edycji.
  ```typescript
  export type FlashcardUpdateDto = Partial<{
    front: string;
    back: string;
    source: "ai-full" | "ai-edited" | "manual";
    generation_id: number | null;
  }>;
  ```

## 6. Zarządzanie stanem

Stan będzie zarządzany lokalnie w komponencie `FlashcardManager` (dla listy) oraz `SavedFlashcardItem` (dla trybu edycji pojedynczego elementu).

- **`FlashcardManager`**:
  - `flashcards`: `FlashcardDto[]` - lista pobranych fiszek.
  - `isLoading`: `boolean` - status ładowania.
  - `error`: `string | null` - ewentualny błąd API.

- **`SavedFlashcardItem`**:
  - `isEditing`: `boolean` - czy fiszka jest w trybie edycji.
  - `editedFront`: `string` - tymczasowa wartość przodu.
  - `editedBack`: `string` - tymczasowa wartość tyłu.
  - `isDeleting`: `boolean` - status operacji usuwania (loading state na przycisku).
  - `isSaving`: `boolean` - status operacji zapisywania.

## 7. Integracja API

Należy rozszerzyć obecne API o brakujące metody.

1.  **GET `/api/flashcards`** (`src/pages/api/flashcards.ts`)
    -   **Żądanie:** Brak body. Wymagany header Authorization (obsługiwane przez `locals.supabase`).
    -   **Odpowiedź:** `{ data: FlashcardDto[], pagination: ... }`

2.  **PUT `/api/flashcards/[id]`** (`src/pages/api/flashcards/[id].ts` - **do utworzenia**)
    -   **Parametr:** `id` (z URL).
    -   **Body:** `FlashcardUpdateDto`.
    -   **Odpowiedź:** Zaktualizowany obiekt `FlashcardDto`.

3.  **DELETE `/api/flashcards/[id]`** (`src/pages/api/flashcards/[id].ts` - **do utworzenia**)
    -   **Parametr:** `id` (z URL).
    -   **Odpowiedź:** Status 200/204.

## 8. Interakcje użytkownika

1.  **Wyświetlanie listy:** Użytkownik wchodzi na stronę, widzi spinner, a następnie listę swoich fiszek.
2.  **Edycja:**
    -   Użytkownik klika ikonę ołówka.
    -   Pola tekstowe zamieniają się w `Textarea`.
    -   Użytkownik wprowadza zmiany.
    -   Kliknięcie "Zapisz" -> walidacja -> wysyłka do API -> toast sukcesu -> powrót do widoku.
    -   Kliknięcie "Anuluj" -> przywrócenie oryginalnych wartości -> powrót do widoku.
3.  **Usuwanie:**
    -   Użytkownik klika ikonę kosza.
    -   Pojawia się `AlertDialog` z pytaniem "Czy na pewno usunąć?".
    -   Potwierdzenie -> wysyłka do API -> usunięcie elementu z listy lokalnej -> toast sukcesu.

## 9. Warunki i walidacja

- **Autentykacja:** Wymagana dla wszystkich operacji.
- **Walidacja danych (Edycja):**
  - Pola nie mogą być puste (trim).
  - Limity znaków (200 front, 500 back).
  - Przycisk "Zapisz" powinien być zablokowany (disabled), jeśli warunki nie są spełnione.
- **Weryfikacja własności:** API musi sprawdzać, czy edytowana/usuwana fiszka należy do zalogowanego użytkownika (Row Level Security w Supabase to zapewnia, ale endpoint API musi to respektować).

## 10. Obsługa błędów

- **Błąd pobierania listy:** Wyświetlenie komponentu `ErrorNotification` z opcją "Spróbuj ponownie".
- **Błąd zapisu/usuwania:** Wyświetlenie toastu (`sonner`) z komunikatem błędu. Zmiany nie są aplikowane do lokalnego stanu (lub są wycofywane).
- **Walidacja formularza:** Wyświetlenie licznika znaków (np. "150/200") zmieniającego kolor na czerwony przy przekroczeniu limitu (chociaż input powinien blokować wpisywanie).

## 11. Kroki implementacji

1.  **Backend - API List:** Rozszerz `src/pages/api/flashcards.ts` o obsługę metody `GET`.
2.  **Backend - API Item:** Utwórz plik `src/pages/api/flashcards/[id].ts` i zaimplementuj metody `PUT` oraz `DELETE`.
3.  **Frontend - Item Component:** Stwórz `src/components/SavedFlashcardItem.tsx` z logiką edycji i modalem usuwania.
4.  **Frontend - List Component:** Stwórz `src/components/SavedFlashcardList.tsx`.
5.  **Frontend - Manager:** Stwórz `src/components/FlashcardManager.tsx` implementujący pobieranie danych i logikę biznesową.
6.  **Frontend - Page:** Utwórz stronę `src/pages/flashcards.astro`, zabezpiecz ją i osadź w niej `FlashcardManager`.
7.  **Weryfikacja:** Przetestuj interakcje edycji i usuwania, upewnij się, że zmiany są odzwierciedlone w bazie danych.
