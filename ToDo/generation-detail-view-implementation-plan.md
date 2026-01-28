# Plan Implementacji: Widok Szczegółów Generacji /generations/[id]

**Data rozpoczęcia:** 2026-01-28
**Zadanie:** Dodanie możliwości przeglądania szczegółów generacji z listą fiszek
**Status:** 🔄 W TRAKCIE PLANOWANIA

---

## Kontekst

**Backend już gotowy:**

- ✅ GET /api/generations/[id] - szczegóły generacji + fiszki (GenerationDetailDto)

**Problem:**

- Użytkownik nie może kliknąć w generację na stronie /generations i przejść do szczegółów
- Brak strony /generations/[id] z listą fiszek z danej generacji

**Cel:**
Stworzyć widok szczegółów generacji, gdzie użytkownik może zobaczyć:

- Metadane generacji (data, model, statystyki)
- Listę wszystkich fiszek z tej generacji

---

## Zakres implementacji

**MVP:**

1. Hook `useGeneration(id)` - pobieranie szczegółów pojedynczej generacji
2. Komponent `GenerationDetailView` - wyświetlanie szczegółów + lista fiszek
3. Strona `/generations/[id].astro` - route dla szczegółów generacji
4. Link w `GenerationCard` - kliknięcie prowadzi do `/generations/[id]`
5. Loading state, error state, empty state (gdy brak fiszek)
6. Przycisk "Back" do powrotu do listy generacji

**CZEGO NIE ROBIMY (na razie):**

- Edycja/usuwanie fiszek z widoku szczegółów (można to zrobić z /flashcards)
- Filtrowanie/sortowanie fiszek w widoku szczegółów
- Paginacja fiszek (zakładamy że jedna generacja ma max ~50 fiszek)

---

## Lista zadań (do odhaczenia)

### Zadanie 1: Hook useGeneration

**Plik:** `src/components/hooks/useGeneration.ts` (nowy)
**Status:** ⏳ PENDING

**Do zrealizowania:**

- Stworzyć hook `useGeneration(id: number)` (wzorowany na useGenerations)
- State: generation, isLoading, error
- Metoda: `loadGeneration(id: number)` - fetch GET /api/generations/[id]
- Error handling z toast notifications
- Typ zwracany: GenerationDetailDto | null

**Rezultat:** Hook do zarządzania stanem szczegółów generacji (~40 LOC)

---

### Zadanie 2: Komponent GenerationDetailView

**Plik:** `src/components/GenerationDetailView.tsx` (nowy)
**Status:** ⏳ PENDING

**Do zrealizowania:**

- Główny komponent widoku szczegółów (wzorowany na GenerationsView)
- useGeneration hook
- useEffect do ładowania generacji po mount
- 4 stany:
  - Loading: SkeletonLoader
  - Error: ErrorNotification
  - Not Found: Komunikat + link do /generations
  - Success: Metadane generacji + lista fiszek
- Header z:
  - Tytułem "Generation Details"
  - Przyciskiem "Back" → /generations
  - Statystykami generacji (reuse z GenerationCard)
- Lista fiszek: użyć istniejącego komponentu FlashcardsList (tylko read-only, bez onEdit/onDelete)
- Empty state gdy brak fiszek

**Rezultat:** Kompletny widok szczegółów generacji (~100 LOC)

---

### Zadanie 3: Strona generations/[id].astro

**Plik:** `src/pages/generations/[id].astro` (nowy)
**Status:** ⏳ PENDING

**Do zrealizowania:**

- Strona Astro dla route /generations/[id]
- Import Layout i GenerationDetailView
- Przekazanie id z params do komponentu
- Title: "Generation Details - 10xCards"
- Container z padding (mx-auto px-4 py-8)

**Rezultat:** Strona dostępna pod /generations/[id] (~15 LOC)

---

### Zadanie 4: Link w GenerationCard

**Plik:** `src/components/GenerationCard.tsx` (modyfikacja)
**Status:** ⏳ PENDING

**Do zrealizowania:**

- Opakować Card w link (użyć Next.js Link lub zwykłego <a>)
- Link prowadzi do `/generations/${generation.id}`
- Zachować obecny styling (Card powinien być klikalny)
- Dodać hover effect (cursor-pointer, subtle shadow)

**Rezultat:** Klikalne karty generacji (+5 LOC)

---

## Podsumowanie plików

| Plik                                      | Akcja       | LOC (szacowane) | Status |
| ----------------------------------------- | ----------- | --------------- | ------ |
| `src/components/hooks/useGeneration.ts`   | Nowy        | 40              | ⏳     |
| `src/components/GenerationDetailView.tsx` | Nowy        | 100             | ⏳     |
| `src/pages/generations/[id].astro`        | Nowy        | 15              | ⏳     |
| `src/components/GenerationCard.tsx`       | Modyfikacja | +5              | ⏳     |

**Łącznie:** 3 nowe pliki + 1 modyfikacja, **~160 LOC**

---

## Wzorce i konwencje (zgodne z codebase)

**Hook pattern:**

- useState dla state management
- fetch z async/await
- toast z sonner dla notifications
- Error handling try/catch
- Zwracanie obiektu z state + metody

**Component pattern:**

- TypeScript z interface dla props
- shadcn/ui dla komponentów (Card, Button, Badge)
- Tailwind CSS dla stylingu
- Lucide React dla ikon

**Astro pattern:**

- Import Layout
- client:load dla React components
- Container + padding dla spacing
- Dynamic routes z [id]

---

## Testy (po implementacji)

**Checklist do ręcznego przetestowania:**

1. [ ] Kliknięcie w kartę generacji prowadzi do /generations/[id]
2. [ ] Strona /generations/[id] się ładuje
3. [ ] Loading state pojawia się na start
4. [ ] Szczegóły generacji się wyświetlają (metadane)
5. [ ] Lista fiszek się wyświetla (jeśli są)
6. [ ] Empty state gdy brak fiszek
7. [ ] Error state gdy generacja nie istnieje (404)
8. [ ] Przycisk "Back" prowadzi do /generations
9. [ ] Responsive - wygląda dobrze na mobile i desktop
10. [ ] Hover effect na kartach generacji działa

---

## Notatki implementacyjne

**Reuse komponentów:**

- FlashcardsList - użyć bez onEdit/onDelete (tylko wyświetlanie)
- GenerationCard - można wyświetlić metadane w podobnym formacie
- SkeletonLoader, ErrorNotification - reuse istniejących

**Routing:**

- Astro dynamic routes: `[id].astro` w folderze `generations/`
- Param dostępny jako `Astro.params.id`

**Link w GenerationCard:**

- Można użyć zwykłego `<a href>` lub Astro `<a>`
- Opakować cały Card w link
- Dodać `cursor-pointer` i hover effects

---

## Status: PLAN GOTOWY DO IMPLEMENTACJI

**Następny krok:** Czekanie na akceptację planu przez użytkownika
