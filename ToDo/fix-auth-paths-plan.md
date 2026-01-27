# Plan Naprawy Rozbieżności Ścieżek Auth - Problem 1

## Cel
Ujednolicenie konwencji ścieżek autentykacji w dokumentacji i kodzie projektu.

## Decyzja
Używać **prostszych ścieżek bez prefixu `/auth/`**:
- `/login` zamiast `/auth/login`
- `/register` zamiast `/auth/register`
- `/reset-password` zamiast `/auth/reset-password`

**Uzasadnienie:**
1. `auth-spec.md` jest głównym dokumentem specyfikacji projektu
2. Prostsze URL-e są bardziej user-friendly
3. Prefix `/auth/` zostawiamy tylko dla `/auth/callback` (obsługa tokenów recovery)

## Zmiany do wykonania

### [x] Zadanie 1: Zaktualizować PUBLIC_PATHS w middleware
**Plik:** `.cursor/rules/supabase-auth.mdc`
**Linie:** 104-113

**Było:**
```typescript
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];
```

**Będzie:**
```typescript
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/login",
  "/register",
  "/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
];
```

**Wyjaśnienie:**
- Ścieżki stron (bez `/api/`) zmieniamy na prostszą formę
- Ścieżki API endpoints (`/api/auth/*`) **pozostają bez zmian** - to są endpointy backendu, mogą mieć prefix `/auth/`

### [x] Zadanie 2: Zaktualizować redirect URL w middleware
**Plik:** `.cursor/rules/supabase-auth.mdc`
**Linia:** 138

**Było:**
```typescript
return redirect("/auth/login");
```

**Będzie:**
```typescript
return redirect("/login");
```

## Pliki, które NIE wymagają zmian

### ✅ `auth-spec.md`
Już używa poprawnych ścieżek: `/login`, `/register`, `/reset-password`

### ✅ Sekcja "Create Auth API Endpoints"
API endpoints w liniach 149-211 pozostają z prefixem `/api/auth/` - to jest poprawne

## Podsumowanie zmian
- **Liczba plików do zmiany:** 1 (`.cursor/rules/supabase-auth.mdc`)
- **Liczba miejsc do zmiany:** 4 (3 ścieżki w PUBLIC_PATHS + 1 redirect)
- **Typ zmiany:** Prosta zamiana stringów
- **Ryzyko:** Bardzo niskie - to tylko dokumentacja, nie kod produkcyjny

## Checklist przed implementacją
- [x] Przeczytano aktualny kod
- [x] Zidentyfikowano wszystkie miejsca do zmiany
- [x] Użytkownik zatwierdził plan
- [x] Wykonano zmiany
- [x] Przegląd zmian

---

## Przegląd Wykonanych Zmian

### Data: 2026-01-27

### Plik zmieniony: `.cursor/rules/supabase-auth.mdc`

**Zmiana 1: PUBLIC_PATHS (linie 104-113)**
- Zmieniono `/auth/login` → `/login`
- Zmieniono `/auth/register` → `/register`
- Zmieniono `/auth/reset-password` → `/reset-password`

**Zmiana 2: Redirect URL (linia 138)**
- Zmieniono `return redirect("/auth/login")` → `return redirect("/login")`

### Status: ✅ UKOŃCZONE

Wszystkie ścieżki stron autentykacji zostały zunifikowane do prostszej wersji bez prefixu `/auth/`, zgodnie z główną specyfikacją w `auth-spec.md`.

API endpoints (`/api/auth/*`) pozostały bez zmian - są poprawne z prefixem.

### Następne kroki

Problem 1 został rozwiązany. Rozbieżność ścieżek auth została usunięta. Dokumentacja jest teraz spójna.

**Problemy 2 i 3 zostały odłożone do ETAPU 3** (po implementacji funkcjonalności biznesowej i auth UI).

Zobacz kompletny plan implementacji MVP: [mvp-implementation-plan-2026-01-27.md](mvp-implementation-plan-2026-01-27.md)
