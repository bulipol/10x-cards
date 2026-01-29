# Endpointy API - Lista do implementacji

**Ostatnia aktualizacja:** 2026-01-29  
**Weryfikacja względem kodu:** 2026-01-29 – lista 11 endpointów i ścieżki plików zweryfikowane (przegląd `src/pages/api/`).

---

## Stan obecny

### Zaimplementowane endpointy (11)

| Endpoint                | Metoda | Plik                                 |
| ----------------------- | ------ | ------------------------------------ |
| `/api/auth/register`    | POST   | `src/pages/api/auth/register.ts`     |
| `/api/auth/login`       | POST   | `src/pages/api/auth/login.ts`        |
| `/api/auth/logout`      | POST   | `src/pages/api/auth/logout.ts`       |
| `/api/flashcards`       | GET    | `src/pages/api/flashcards/index.ts`  |
| `/api/flashcards`       | POST   | `src/pages/api/flashcards/index.ts`  |
| `/api/flashcards/[id]`  | GET    | `src/pages/api/flashcards/[id].ts`   |
| `/api/flashcards/[id]`  | PUT    | `src/pages/api/flashcards/[id].ts`   |
| `/api/flashcards/[id]`  | DELETE | `src/pages/api/flashcards/[id].ts`   |
| `/api/generations`      | GET    | `src/pages/api/generations/index.ts` |
| `/api/generations`      | POST   | `src/pages/api/generations/index.ts` |
| `/api/generations/[id]` | GET    | `src/pages/api/generations/[id].ts`  |

**Zgodność z MVP:** ETAP 1 (funkcjonalność biznesowa) i ETAP 2 (auth UI + endpoints) – endpointy zaimplementowane. Szczegóły: [mvp-implementation-plan-2026-01-27.md](mvp-implementation-plan-2026-01-27.md).

---

## Endpointy do implementacji (4)

### Priorytet 4: Reset hasła

Funkcjonalność odzyskiwania dostępu do konta.

| #   | Endpoint                    | Metoda | Opis                    | Plan implementacji |
| --- | --------------------------- | ------ | ----------------------- | ------------------ |
| 10  | `/api/auth/reset-password`  | POST   | Żądanie resetu hasła    | ISTNIEJE           |
| 11  | `/api/auth/update-password` | POST   | Ustawienie nowego hasła | ISTNIEJE           |

**Specyfikacja:** [auth-spec.md](../.ai/coreDocumentation/auth-spec.md) (sekcje 3.2.4-3.2.5)

**Plan implementacji:** [auth-endpoint-implementation-plan.md](../.ai/implementation/endpoint/auth-endpoint-implementation-plan.md)

**Zależności:**

- Strona `/auth/callback` do obsługi tokenu recovery
- Konfiguracja szablonów email w Supabase

**Status planu:** GOTOWY DO IMPLEMENTACJI

---

### Priorytet 5: Niski priorytet

Funkcjonalności opcjonalne lub do późniejszej implementacji.

| #   | Endpoint                     | Metoda | Opis                               | Plan implementacji |
| --- | ---------------------------- | ------ | ---------------------------------- | ------------------ |
| 12  | `/api/auth/account`          | DELETE | Usunięcie konta użytkownika (RODO) | ISTNIEJE           |
| 13  | `/api/generation-error-logs` | GET    | Logi błędów generacji AI           | ISTNIEJE           |

**Plan implementacji (12):** [auth-endpoint-implementation-plan.md](../.ai/implementation/endpoint/auth-endpoint-implementation-plan.md) (sekcja 2.6 i 9.7)

**Plan implementacji (13):** [generation-error-logs-endpoint-implementation-plan.md](../.ai/implementation/endpoint/generation-error-logs-endpoint-implementation-plan.md)

**Status planu:** ✅ WSZYSTKIE PLANY GOTOWE DO IMPLEMENTACJI

---

## Podsumowanie planów implementacji

| Kategoria                                    | Zaimplementowane                           | Do implementacji | Plan gotowy |
| -------------------------------------------- | ------------------------------------------ | ---------------- | ----------- |
| Autentykacja MVP (register, login, logout)   | 3                                          | 0                | 3           |
| Flashcards CRUD                              | 5 (GET list, POST, GET by id, PUT, DELETE) | 0                | 5           |
| Generations (GET list, GET by id, POST)      | 3                                          | 0                | 3           |
| Reset hasła                                  | 0                                          | 2                | 2           |
| Niski priorytet (DELETE account, Error logs) | 0                                          | 2                | 2           |
| **RAZEM**                                    | **11**                                     | **4**            | **13**      |

---

## Plany implementacji - status

### Istniejące plany (ścieżki względem `.ai/`):

1. [auth-endpoint-implementation-plan.md](../.ai/implementation/endpoint/auth-endpoint-implementation-plan.md) – endpointy auth (register, login, logout ✅; reset-password, update-password, DELETE account – do zrobienia)
2. [flashcards-crud-implementation-plan.md](../.ai/implementation/endpoint/flashcards-crud-implementation-plan.md) – flashcards CRUD ✅
3. [generations-get-endpoint-implementation-plan.md](../.ai/implementation/endpoint/generations-get-endpoint-implementation-plan.md) – GET generations ✅
4. [generation-error-logs-endpoint-implementation-plan.md](../.ai/implementation/endpoint/generation-error-logs-endpoint-implementation-plan.md) – GET error logs (do zrobienia)

---

## Kolejność implementacji (ZAKTUALIZOWANA - 2026-01-29)

**Strategia:** Najpierw funkcjonalność biznesowa, potem auth UI, na końcu SSR. Zobacz: [mvp-implementation-plan-2026-01-27.md](mvp-implementation-plan-2026-01-27.md).

```
ETAP 1: Funkcjonalność biznesowa ✅ ZAKOŃCZONY
├── 1.1. [CRUD] Flashcards: GET list, GET by id, PUT, DELETE, POST
├── 1.2. [READ] Generations: GET list, GET by id, POST
└── 1.3. [UI] Sesja nauki /study, nawigacja, widok /generations

ETAP 2: Auth UI + Endpoints ✅ ZAKOŃCZONY
├── 2.1. [AUTH] register, login, logout – endpointy + strony
└── 2.2. [UI] Strony /login, /register, UserMenu w Navigation

ETAP 3: SSR + Refaktor ⏳ DO ZROBIENIA
├── Middleware z auth check, locals.user
└── Endpointy używają locals.user.id (DEFAULT_USER_ID usunięty)

ETAP 4: Opcjonalne (NICE TO HAVE)
├── 4.1. [AUTH] Reset password, Update password
└── 4.2. [LOW] Delete account, GET generation-error-logs
```

---

## Changelog

| Data       | Opis                                                                                                                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-01-26 | Utworzenie dokumentu z analizą endpointów                                                                                                                                                                                                                                                           |
| 2026-01-26 | Aktualizacja - dodano informacje o statusie planów implementacji                                                                                                                                                                                                                                    |
| 2026-01-26 | Utworzono plan implementacji dla wszystkich endpointów auth (6 endpointów: register, login, logout, reset-password, update-password, DELETE account)                                                                                                                                                |
| 2026-01-26 | Utworzono plan implementacji dla GET /generation-error-logs - **WSZYSTKIE PLANY KOMPLETNE (13/13)**                                                                                                                                                                                                 |
| 2026-01-27 | **ZAKTUALIZOWANO KOLEJNOŚĆ:** Najpierw funkcjonalność biznesowa (ETAP 1), potem auth UI (ETAP 2), na końcu SSR (ETAP 3). Szczegóły w mvp-implementation-plan-2026-01-27.md                                                                                                                          |
| 2026-01-29 | **AKTUALIZACJA STANU:** 11 endpointów zaimplementowanych (auth 3, flashcards 5, generations 3). Do zrobienia: reset hasła (2), delete account + error logs (2). Zaktualizowano ścieżki do planów (.ai/implementation/endpoint/, .ai/coreDocumentation/). ETAP 1 i ETAP 2 oznaczono jako zakończone. |
| 2026-01-29 | Weryfikacja stanu względem kodu: przegląd `src/pages/api/` – 11 endpointów i ścieżki plików potwierdzone. Dodano pole „Weryfikacja względem kodu” w nagłówku.                                                                                                                                       |

---

## Review (aktualizacja 2026-01-29)

**Cel:** Dopasowanie listy endpointów do aktualnego stanu kodu.

**Wprowadzone zmiany:**

1. **Stan obecny** – Zastąpiono starą tabelę (tylko POST flashcards, POST generations) pełną listą 11 zaimplementowanych endpointów z poprawnymi ścieżkami plików (`flashcards/index.ts`, `flashcards/[id].ts`, `generations/index.ts`, `generations/[id].ts`, `auth/register.ts`, `auth/login.ts`, `auth/logout.ts`).

2. **Endpointy do implementacji** – Usunięto Priorytet 1 (auth MVP), Priorytet 2 (Flashcards CRUD) i Priorytet 3 (Generations READ) – są zaimplementowane. Pozostawiono Priorytet 4 (reset hasła) i Priorytet 5 (niski priorytet: DELETE account, GET generation-error-logs).

3. **Podsumowanie** – Tabela: 11 zaimplementowanych, 4 do zrobienia. Kategorie zgodne z aktualnym stanem.

4. **Plany implementacji** – Ścieżki zaktualizowane do `.ai/implementation/endpoint/` i `.ai/coreDocumentation/`. Dodano status „zaimplementowane” vs „do zrobienia” przy poszczególnych planach.

5. **Kolejność implementacji** – ETAP 1 i ETAP 2 oznaczono jako zakończone; ETAP 3 i ETAP 4 bez zmian.

6. **Changelog** – Dodany wpis z datą 2026-01-29.

7. **Weryfikacja 2026-01-29** – Stan dokumentu zweryfikowany względem kodu (`src/pages/api/`). Lista 11 zaimplementowanych endpointów i ścieżki plików zgodne z implementacją. Spójność z pozostałymi plikami statusu (.ai/implementation/status/) – po aktualizacji analizaWorkDone i projectStatus wszystkie cztery pliki będą opisywać ten sam stan.
