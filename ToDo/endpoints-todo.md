# Endpointy API - Lista do implementacji

## Stan obecny

### Zaimplementowane endpointy:
| Endpoint | Metoda | Status | Plik | Plan implementacji |
|----------|--------|--------|------|-------------------|
| `/api/flashcards` | POST | Zaimplementowany | `src/pages/api/flashcards.ts` | [flashcards-post-endpoint-implementation-plan.md](../.ai/flashcards-post-endpoint-implementation-plan.md) |
| `/api/generations` | POST | Zaimplementowany | `src/pages/api/generations.ts` | [generations-endpoint-implementation-plan.md](../.ai/generations-endpoint-implementation-plan.md) |

---

## Endpointy do implementacji

### Priorytet 1: Autentykacja (MVP)

Wymagane do uruchomienia aplikacji z prawdziwymi użytkownikami.

| # | Endpoint | Metoda | Opis | Plan implementacji |
|---|----------|--------|------|-------------------|
| 1 | `/api/auth/register` | POST | Rejestracja nowego użytkownika | ISTNIEJE |
| 2 | `/api/auth/login` | POST | Logowanie użytkownika | ISTNIEJE |
| 3 | `/api/auth/logout` | POST | Wylogowanie użytkownika | ISTNIEJE |

**Specyfikacja:** [auth-spec.md](../.ai/auth-spec.md)

**Plan implementacji:** [auth-endpoint-implementation-plan.md](../.ai/auth-endpoint-implementation-plan.md)

**Zależności:**
- Konfiguracja Supabase Auth
- Middleware z obsługą sesji
- Schematy walidacji Zod (`src/lib/schemas/auth.schema.ts`)

**Status planu:** GOTOWY DO IMPLEMENTACJI

---

### Priorytet 2: Flashcards CRUD

Niezbędne do pełnej funkcjonalności zarządzania fiszkami (US-005, US-006, US-007).

| # | Endpoint | Metoda | Opis | Plan implementacji |
|---|----------|--------|------|-------------------|
| 4 | `/api/flashcards` | GET | Lista fiszek z paginacją, filtrowaniem, sortowaniem | ISTNIEJE |
| 5 | `/api/flashcards/[id]` | GET | Pobieranie pojedynczej fiszki | ISTNIEJE |
| 6 | `/api/flashcards/[id]` | PUT | Aktualizacja istniejącej fiszki | ISTNIEJE |
| 7 | `/api/flashcards/[id]` | DELETE | Usuwanie fiszki | ISTNIEJE |

**Plan implementacji:** [flashcards-endpoint-implementation-plan.md](../.ai/flashcards-endpoint-implementation-plan.md)

**Pliki do utworzenia:**
- `src/lib/schemas/flashcards.schema.ts`
- `src/lib/services/flashcards.service.ts`
- `src/pages/api/flashcards/index.ts`
- `src/pages/api/flashcards/[id].ts`

**Status planu:** GOTOWY DO IMPLEMENTACJI

---

### Priorytet 3: Generations READ

Umożliwia przeglądanie historii generacji.

| # | Endpoint | Metoda | Opis | Plan implementacji |
|---|----------|--------|------|-------------------|
| 8 | `/api/generations` | GET | Lista generacji z paginacją | ISTNIEJE |
| 9 | `/api/generations/[id]` | GET | Szczegóły generacji z powiązanymi fiszkami | ISTNIEJE |

**Plan implementacji:** [generations-get-endpoint-implementation-plan.md](../.ai/generations-get-endpoint-implementation-plan.md)

**Pliki do utworzenia:**
- `src/lib/schemas/generations.schema.ts`
- `src/lib/services/generations.service.ts`
- `src/pages/api/generations/index.ts` (rozszerzenie o GET)
- `src/pages/api/generations/[id].ts`

**Status planu:** GOTOWY DO IMPLEMENTACJI

---

### Priorytet 4: Reset hasła

Funkcjonalność odzyskiwania dostępu do konta.

| # | Endpoint | Metoda | Opis | Plan implementacji |
|---|----------|--------|------|-------------------|
| 10 | `/api/auth/reset-password` | POST | Żądanie resetu hasła | ISTNIEJE |
| 11 | `/api/auth/update-password` | POST | Ustawienie nowego hasła | ISTNIEJE |

**Specyfikacja:** [auth-spec.md](../.ai/auth-spec.md) (sekcje 3.2.4-3.2.5)

**Plan implementacji:** [auth-endpoint-implementation-plan.md](../.ai/auth-endpoint-implementation-plan.md)

**Zależności:**
- Strona `/auth/callback` do obsługi tokenu recovery
- Konfiguracja szablonów email w Supabase

**Status planu:** GOTOWY DO IMPLEMENTACJI

---

### Priorytet 5: Niski priorytet

Funkcjonalności opcjonalne lub do późniejszej implementacji.

| # | Endpoint | Metoda | Opis | Plan implementacji |
|---|----------|--------|------|-------------------|
| 12 | `/api/auth/account` | DELETE | Usunięcie konta użytkownika (RODO) | ISTNIEJE |
| 13 | `/api/generation-error-logs` | GET | Logi błędów generacji AI | ISTNIEJE |

**Plan implementacji (12):** [auth-endpoint-implementation-plan.md](../.ai/auth-endpoint-implementation-plan.md) (sekcja 2.6 i 9.7)

**Plan implementacji (13):** [generation-error-logs-endpoint-implementation-plan.md](../.ai/generation-error-logs-endpoint-implementation-plan.md)

**Status planu:** ✅ WSZYSTKIE PLANY GOTOWE DO IMPLEMENTACJI

---

## Podsumowanie planów implementacji

| Kategoria | Zaimplementowane | Do implementacji | Plan gotowy | Plan do utworzenia |
|-----------|------------------|------------------|-------------|-------------------|
| Autentykacja MVP | 0 | 3 | 3 | 0 |
| Flashcards CRUD | 1 (POST) | 4 | 4 | 0 |
| Generations | 1 (POST) | 2 | 2 | 0 |
| Reset hasła | 0 | 2 | 2 | 0 |
| Niski priorytet | 0 | 2 | 2 | 0 |
| **RAZEM** | **2** | **13** | **13** | **0** |

---

## Plany implementacji - status

### Istniejące plany (gotowe do implementacji):
1. [auth-endpoint-implementation-plan.md](../.ai/auth-endpoint-implementation-plan.md) - **WSZYSTKIE endpointy auth:** register, login, logout, reset-password, update-password, DELETE account
2. [flashcards-endpoint-implementation-plan.md](../.ai/flashcards-endpoint-implementation-plan.md) - GET/PUT/DELETE flashcards
3. [generations-get-endpoint-implementation-plan.md](../.ai/generations-get-endpoint-implementation-plan.md) - GET generations
4. [generation-error-logs-endpoint-implementation-plan.md](../.ai/generation-error-logs-endpoint-implementation-plan.md) - GET error logs

### Plany do utworzenia:
**BRAK** - wszystkie plany są gotowe!

---

## Kolejność implementacji (rekomendowana)

```
1. [MVP] Auth: register, login, logout
   ├── Status planu: ✅ GOTOWY
   └── Umożliwia uruchomienie aplikacji z użytkownikami

2. [CRUD] Flashcards: GET list, GET by id, PUT, DELETE
   ├── Status planu: ✅ GOTOWY
   └── Pełna funkcjonalność zarządzania fiszkami

3. [READ] Generations: GET list, GET by id
   ├── Status planu: ✅ GOTOWY
   └── Historia generacji

4. [AUTH] Reset password, Update password
   ├── Status planu: ✅ GOTOWY (w ramach planu auth)
   └── Odzyskiwanie dostępu

5. [LOW] Delete account, Error logs
   ├── Status planu: ✅ DELETE account GOTOWY (w ramach planu auth)
   ├── Status planu: ✅ Error logs GOTOWY
   └── Funkcjonalności dodatkowe
```

---

## Changelog

| Data | Opis |
|------|------|
| 2026-01-26 | Utworzenie dokumentu z analizą endpointów |
| 2026-01-26 | Aktualizacja - dodano informacje o statusie planów implementacji |
| 2026-01-26 | Utworzono plan implementacji dla wszystkich endpointów auth (6 endpointów: register, login, logout, reset-password, update-password, DELETE account) |
| 2026-01-26 | Utworzono plan implementacji dla GET /generation-error-logs - **WSZYSTKIE PLANY KOMPLETNE (13/13)** |
