# Specyfikacja Architektury Modułu Autentykacji

## Spis treści
1. [Przegląd](#1-przegląd)
2. [Architektura interfejsu użytkownika](#2-architektura-interfejsu-użytkownika)
3. [Logika backendowa](#3-logika-backendowa)
4. [System autentykacji](#4-system-autentykacji)
5. [Kontrakty danych](#5-kontrakty-danych)

---

## 1. Przegląd

### 1.1. Cel dokumentu
Niniejsza specyfikacja opisuje architekturę modułu rejestracji, logowania, wylogowywania i odzyskiwania hasła użytkowników w aplikacji 10x-cards. Rozwiązanie opiera się na Supabase Auth zintegrowanym z frameworkiem Astro oraz komponentami React.

### 1.2. Zakres funkcjonalny
- Rejestracja nowego użytkownika (email + hasło)
- Logowanie istniejącego użytkownika
- Wylogowywanie
- Odzyskiwanie hasła (reset via email)
- Ochrona tras wymagających autentykacji
- Zarządzanie sesją użytkownika

### 1.3. Wymagania zgodności
Moduł musi być zgodny z:
- PRD (US-001, US-002, US-009)
- Istniejącą architekturą Astro + React
- Aktualną konfiguracją Supabase (baza danych, migracje)
- RODO (prawo do usunięcia konta)

---

## 2. Architektura interfejsu użytkownika

### 2.1. Struktura stron i routingu

#### 2.1.1. Nowe strony Astro (publiczne - bez autentykacji)

| Ścieżka | Plik | Opis |
|---------|------|------|
| `/login` | `src/pages/login.astro` | Strona logowania |
| `/register` | `src/pages/register.astro` | Strona rejestracji |
| `/reset-password` | `src/pages/reset-password.astro` | Formularz żądania resetu hasła |
| `/auth/callback` | `src/pages/auth/callback.astro` | Obsługa callback dla resetu hasła |

#### 2.1.2. Strony chronione (wymagają autentykacji)

| Ścieżka | Plik | Zachowanie |
|---------|------|------------|
| `/generate` | `src/pages/generate.astro` | Przekierowanie do `/login` bez sesji |
| `/flashcards` | `src/pages/flashcards.astro` | Lista fiszek użytkownika (nowa) |
| `/study` | `src/pages/study.astro` | Sesja nauki (przyszła implementacja) |

#### 2.1.3. Logika przekierowań

```
Użytkownik niezalogowany:
  /generate, /flashcards, /study → przekierowanie do /login

Użytkownik zalogowany:
  /login, /register → przekierowanie do /generate

Strona główna (/):
  Niezalogowany → /login
  Zalogowany → /generate
```

### 2.2. Layouty

#### 2.2.1. Layout.astro (modyfikacja istniejącego)

Rozszerzenie obecnego layoutu o:
- **Nagłówek nawigacyjny** z dynamiczną zawartością:
  - Dla zalogowanych: nazwa/email użytkownika, przycisk "Wyloguj"
  - Dla niezalogowanych: linki "Zaloguj się", "Zarejestruj się"
- **Przekazywanie stanu sesji** do komponentów React przez props lub context

Struktura nagłówka:
```
┌─────────────────────────────────────────────────────────────┐
│  Logo/Nazwa          [Generuj] [Moje fiszki]    [User ▼]   │
│                                                  └─ Wyloguj │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2.2. AuthLayout.astro (nowy)

Dedykowany layout dla stron autentykacji:
- Minimalistyczny design bez nawigacji
- Centrowany kontener formularza
- Logo/branding aplikacji
- Link powrotny do strony głównej

Struktura:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      [Logo 10x-cards]                       │
│                                                             │
│                   ┌─────────────────┐                       │
│                   │   [Formularz]   │                       │
│                   └─────────────────┘                       │
│                                                             │
│                   Link alternatywny                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3. Komponenty React

#### 2.3.1. Nowe komponenty autentykacji

| Komponent | Lokalizacja | Odpowiedzialność |
|-----------|-------------|------------------|
| `LoginForm.tsx` | `src/components/auth/` | Formularz logowania email/hasło |
| `RegisterForm.tsx` | `src/components/auth/` | Formularz rejestracji |
| `ResetPasswordForm.tsx` | `src/components/auth/` | Formularz żądania resetu hasła |
| `UpdatePasswordForm.tsx` | `src/components/auth/` | Formularz ustawienia nowego hasła |
| `AuthGuard.tsx` | `src/components/auth/` | Wrapper sprawdzający sesję client-side |
| `UserMenu.tsx` | `src/components/auth/` | Menu użytkownika w nagłówku |

#### 2.3.2. Specyfikacja komponentów formularzy

**LoginForm.tsx**
- Pola: email (input type="email"), hasło (input type="password")
- Przyciski: "Zaloguj się" (submit), "Zapomniałeś hasła?" (link)
- Stan: loading, error message
- Walidacja client-side: wymagane pola, format email
- Po sukcesie: przekierowanie do `/generate`

**RegisterForm.tsx**
- Pola: email (input type="email"), hasło (input type="password")
- Przyciski: "Zarejestruj się" (submit)
- Walidacja client-side:
  - Email: wymagany, poprawny format
  - Hasło: min. 8 znaków, co najmniej jedna cyfra i litera
- Po sukcesie: automatyczne logowanie i przekierowanie do `/generate`

**ResetPasswordForm.tsx**
- Pola: email
- Przycisk: "Wyślij link do resetu"
- Po sukcesie: komunikat o wysłaniu emaila (bez ujawniania czy email istnieje)

**UpdatePasswordForm.tsx**
- Pola: nowe hasło, powtórz hasło
- Walidacja: jak przy rejestracji
- Wyświetlany po kliknięciu linku z emaila resetu

#### 2.3.3. Modyfikacje istniejących komponentów

**FlashcardGenerationView.tsx**
- Usunięcie hardcoded `DEFAULT_USER_ID`
- Pobieranie `user_id` z kontekstu sesji
- Obsługa błędu 401 (przekierowanie do logowania)

### 2.4. Walidacja i komunikaty błędów

#### 2.4.1. Walidacja client-side

| Pole | Reguły | Komunikat błędu |
|------|--------|-----------------|
| Email | Wymagane, format email | "Wprowadź poprawny adres email" |
| Hasło | Min. 8 znaków | "Hasło musi mieć co najmniej 8 znaków" |
| Hasło | Litera + cyfra | "Hasło musi zawierać literę i cyfrę" |

#### 2.4.2. Komunikaty błędów serwera

| Kod błędu | Komunikat użytkownika |
|-----------|----------------------|
| `invalid_credentials` | "Nieprawidłowy email lub hasło" |
| `email_taken` | "Konto z tym adresem email już istnieje" |
| `weak_password` | "Hasło jest zbyt słabe" |
| `rate_limit` | "Zbyt wiele prób. Spróbuj ponownie później" |
| `server_error` | "Wystąpił błąd. Spróbuj ponownie" |

#### 2.4.3. Komunikaty sukcesu

| Akcja | Komunikat |
|-------|-----------|
| Rejestracja | Toast: "Konto utworzone. Witaj w 10x-cards!" |
| Reset hasła | "Jeśli konto istnieje, wysłaliśmy link do resetu hasła" |
| Zmiana hasła | "Hasło zostało zmienione. Możesz się zalogować" |
| Wylogowanie | Toast: "Zostałeś wylogowany" |

### 2.5. Scenariusze użytkownika (User Flows)

#### 2.5.1. Rejestracja

```
1. Użytkownik wchodzi na /register
2. Wypełnia formularz (email, hasło)
3. Walidacja client-side
4. Klik "Zarejestruj się"
5. POST /api/auth/register
6. Supabase tworzy konto (bez weryfikacji email)
7. Supabase zwraca sesję - użytkownik automatycznie zalogowany
8. Utworzenie sesji (cookie httpOnly)
9. Przekierowanie do /generate
10. Toast "Konto utworzone. Witaj w 10x-cards!"
```

#### 2.5.2. Logowanie

```
1. Użytkownik wchodzi na /login
2. Wypełnia email i hasło
3. Klik "Zaloguj się"
4. POST /api/auth/login
5. Supabase weryfikuje dane
6. Utworzenie sesji (cookie httpOnly)
7. Przekierowanie do /generate
```

#### 2.5.3. Wylogowanie

```
1. Użytkownik klika "Wyloguj" w menu
2. POST /api/auth/logout
3. Supabase usuwa sesję
4. Usunięcie cookie sesji
5. Przekierowanie do /login
6. Toast "Zostałeś wylogowany"
```

#### 2.5.4. Reset hasła

```
1. Użytkownik klika "Zapomniałeś hasła?" na /login
2. Przekierowanie do /reset-password
3. Wprowadzenie emaila
4. POST /api/auth/reset-password
5. Supabase wysyła email z linkiem
6. Komunikat "Sprawdź email"
7. Użytkownik klika link w emailu
8. GET /auth/callback z tokenem recovery
9. Przekierowanie do /auth/callback z formularzem nowego hasła
10. Użytkownik ustawia nowe hasło
11. POST /api/auth/update-password
12. Przekierowanie do /login z komunikatem sukcesu
```

### 2.6. Wireframe'y stron

#### 2.6.1. Strona logowania `/login`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ╔═══════════════╗                        │
│                        ║  10x-cards    ║                        │
│                        ╚═══════════════╝                        │
│                                                                 │
│                   ┌─────────────────────────┐                   │
│                   │                         │                   │
│                   │     Zaloguj się         │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Email             │  │                   │
│                   │  │ jan@example.com   │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Hasło             │  │                   │
│                   │  │ ••••••••          │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │   Zaloguj się     │  │  ← Button primary │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  Zapomniałeś hasła?     │  ← Link tekstowy  │
│                   │                         │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
│                   Nie masz konta?                               │
│                   Zarejestruj się            ← Link do /register│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stan błędu:**
```
│                   │  ┌───────────────────┐  │                   │
│                   │  │ ⚠ Nieprawidłowy   │  │  ← Alert         │
│                   │  │   email lub hasło │  │    destructive    │
│                   │  └───────────────────┘  │                   │
```

**Elementy:**

| Element | Komponent | Właściwości |
|---------|-----------|-------------|
| Logo | `<h1>` | Nazwa aplikacji |
| Tytuł | `<h2>` | "Zaloguj się" |
| Email | `<Input type="email">` | placeholder, required |
| Hasło | `<Input type="password">` | placeholder, required |
| Submit | `<Button>` | variant="default", loading state |
| Link reset | `<a>` | href="/reset-password" |
| Link register | `<a>` | href="/register" |
| Alert błędu | `<Alert variant="destructive">` | Ukryty domyślnie |

#### 2.6.2. Strona rejestracji `/register`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ╔═══════════════╗                        │
│                        ║  10x-cards    ║                        │
│                        ╚═══════════════╝                        │
│                                                                 │
│                   ┌─────────────────────────┐                   │
│                   │                         │                   │
│                   │   Utwórz konto          │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Email             │  │                   │
│                   │  │ jan@example.com   │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Hasło             │  │                   │
│                   │  │ ••••••••          │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │  Min. 8 znaków,         │  ← Tekst pomocniczy│
│                   │  litera i cyfra         │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │  Zarejestruj się  │  │  ← Button primary │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
│                   Masz już konto?                               │
│                   Zaloguj się                ← Link do /login   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stan błędu (email zajęty):**
```
│                   │  ┌───────────────────┐  │                   │
│                   │  │ ⚠ Konto z tym     │  │  ← Alert         │
│                   │  │   emailem już     │  │    destructive    │
│                   │  │   istnieje        │  │                   │
│                   │  └───────────────────┘  │                   │
```

**Elementy:**

| Element | Komponent | Właściwości |
|---------|-----------|-------------|
| Logo | `<h1>` | Nazwa aplikacji |
| Tytuł | `<h2>` | "Utwórz konto" |
| Email | `<Input type="email">` | placeholder, required |
| Hasło | `<Input type="password">` | placeholder, required, minLength=8 |
| Hint hasła | `<p className="text-muted-foreground">` | Wymagania |
| Submit | `<Button>` | variant="default", loading state |
| Link login | `<a>` | href="/login" |
| Alert błędu | `<Alert variant="destructive">` | Ukryty domyślnie |

#### 2.6.3. Strona resetu hasła `/reset-password`

**Stan początkowy (formularz):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ╔═══════════════╗                        │
│                        ║  10x-cards    ║                        │
│                        ╚═══════════════╝                        │
│                                                                 │
│                   ┌─────────────────────────┐                   │
│                   │                         │                   │
│                   │   Zresetuj hasło        │                   │
│                   │                         │                   │
│                   │   Podaj adres email     │                   │
│                   │   powiązany z kontem    │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Email             │  │                   │
│                   │  │ jan@example.com   │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Wyślij link       │  │  ← Button primary │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
│                   ← Wróć do logowania        ← Link do /login   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stan sukcesu (po wysłaniu):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ╔═══════════════╗                        │
│                        ║  10x-cards    ║                        │
│                        ╚═══════════════╝                        │
│                                                                 │
│                   ┌─────────────────────────┐                   │
│                   │                         │                   │
│                   │   ✓ Sprawdź swoją       │                   │
│                   │     skrzynkę email      │                   │
│                   │                         │                   │
│                   │   Jeśli konto z tym     │                   │
│                   │   adresem istnieje,     │                   │
│                   │   wysłaliśmy link do    │                   │
│                   │   zresetowania hasła.   │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Wróć do logowania │  │  ← Button         │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.6.4. Strona ustawienia nowego hasła `/auth/callback`

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        ╔═══════════════╗                        │
│                        ║  10x-cards    ║                        │
│                        ╚═══════════════╝                        │
│                                                                 │
│                   ┌─────────────────────────┐                   │
│                   │                         │                   │
│                   │   Ustaw nowe hasło      │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Nowe hasło        │  │                   │
│                   │  │ ••••••••          │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │ Powtórz hasło     │  │                   │
│                   │  │ ••••••••          │  │                   │
│                   │  └───────────────────┘  │                   │
│                   │  Min. 8 znaków,         │                   │
│                   │  litera i cyfra         │                   │
│                   │                         │                   │
│                   │  ┌───────────────────┐  │                   │
│                   │  │   Zmień hasło     │  │  ← Button primary │
│                   │  └───────────────────┘  │                   │
│                   │                         │                   │
│                   └─────────────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Stan błędu (hasła nie pasują):**
```
│                   │  ┌───────────────────┐  │                   │
│                   │  │ ⚠ Hasła nie są    │  │  ← Alert         │
│                   │  │   identyczne      │  │    destructive    │
│                   │  └───────────────────┘  │                   │
```

**Stan błędu (token wygasł):**
```
│                   │  ┌───────────────────┐  │                   │
│                   │  │ ⚠ Link wygasł     │  │                   │
│                   │  │   lub jest        │  │                   │
│                   │  │   nieprawidłowy   │  │                   │
│                   │  │                   │  │                   │
│                   │  │  [Wyślij ponownie]│  │  ← Link           │
│                   │  └───────────────────┘  │                   │
```

### 2.7. Komponenty UI do wykorzystania

#### 2.7.1. Istniejące komponenty (shadcn/ui)

| Komponent | Plik | Użycie w auth |
|-----------|------|---------------|
| `Button` | `ui/button.tsx` | Przyciski submit |
| `Label` | `ui/label.tsx` | Etykiety pól |
| `Alert` | `ui/alert.tsx` | Komunikaty błędów |
| `Sonner` | `ui/sonner.tsx` | Toast notifications |

#### 2.7.2. Komponenty do dodania

| Komponent | Źródło | Użycie |
|-----------|--------|--------|
| `Input` | shadcn/ui | Pola tekstowe formularzy |
| `Card` | shadcn/ui | Kontener formularza (opcjonalnie) |

#### 2.7.3. Przykład instalacji brakujących komponentów

```bash
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
```

---

## 3. Logika backendowa

### 3.1. Struktura endpointów API

#### 3.1.1. Endpointy autentykacji

| Metoda | Ścieżka | Opis | Autoryzacja |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | Rejestracja nowego użytkownika | Publiczny |
| POST | `/api/auth/login` | Logowanie użytkownika | Publiczny |
| POST | `/api/auth/logout` | Wylogowanie użytkownika | Wymagana sesja |
| POST | `/api/auth/reset-password` | Żądanie resetu hasła | Publiczny |
| POST | `/api/auth/update-password` | Ustawienie nowego hasła | Token recovery |

#### 3.1.2. Endpointy stron (SSR)

| Ścieżka | Metoda renderowania | Logika |
|---------|---------------------|--------|
| `/auth/callback` | SSR | Obsługa tokenu recovery (reset hasła) |

### 3.2. Specyfikacja endpointów

#### 3.2.1. POST /api/auth/register

**Request:**
```typescript
{
  email: string;    // wymagany, format email
  password: string; // wymagany, min 8 znaków
}
```

**Response (201):**
```typescript
{
  message: "Registration successful";
  user: {
    id: string;
    email: string;
  }
}
```
+ Set-Cookie header z tokenem sesji (użytkownik automatycznie zalogowany)

**Response (400):**
```typescript
{
  error: "validation_error";
  message: string;
  details?: Record<string, string>;
}
```

**Response (409):**
```typescript
{
  error: "email_taken";
  message: "User with this email already exists";
}
```

#### 3.2.2. POST /api/auth/login

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  message: "Login successful";
  user: {
    id: string;
    email: string;
  }
}
```
+ Set-Cookie header z tokenem sesji

**Response (401):**
```typescript
{
  error: "invalid_credentials";
  message: "Invalid email or password";
}
```

#### 3.2.3. POST /api/auth/logout

**Request:** Brak body (sesja z cookie)

**Response (200):**
```typescript
{
  message: "Logged out successfully";
}
```
+ Clear-Cookie header

#### 3.2.4. POST /api/auth/reset-password

**Request:**
```typescript
{
  email: string;
}
```

**Response (200):** Zawsze sukces (bezpieczeństwo)
```typescript
{
  message: "If the email exists, a reset link has been sent";
}
```

#### 3.2.5. POST /api/auth/update-password

**Request:**
```typescript
{
  password: string; // nowe hasło
}
```
+ Cookie z tokenem recovery

**Response (200):**
```typescript
{
  message: "Password updated successfully";
}
```

**Response (401):**
```typescript
{
  error: "invalid_token";
  message: "Invalid or expired reset token";
}
```

### 3.3. Walidacja danych wejściowych

#### 3.3.1. Schematy Zod

```typescript
// src/lib/schemas/auth.schema.ts

const emailSchema = z.string()
  .email("Nieprawidłowy format email")
  .max(255, "Email jest zbyt długi");

const passwordSchema = z.string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .max(72, "Hasło jest zbyt długie") // limit bcrypt
  .regex(/[a-zA-Z]/, "Hasło musi zawierać co najmniej jedną literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę");

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Hasło jest wymagane"),
});

const resetPasswordSchema = z.object({
  email: emailSchema,
});

const updatePasswordSchema = z.object({
  password: passwordSchema,
});
```

### 3.4. Obsługa wyjątków

#### 3.4.1. Klasa AuthError

```typescript
// src/lib/errors/auth.error.ts

class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

type AuthErrorCode =
  | "validation_error"
  | "invalid_credentials"
  | "email_taken"
  | "invalid_token"
  | "expired_token"
  | "rate_limit"
  | "server_error";
```

#### 3.4.2. Centralna obsługa błędów

Wszystkie endpointy API powinny używać wspólnego handlera błędów:
- Logowanie błędów do konsoli/systemu monitoringu
- Mapowanie błędów Supabase na AuthError
- Zwracanie ustandaryzowanych odpowiedzi JSON

### 3.5. Middleware Astro

#### 3.5.1. Modyfikacja src/middleware/index.ts

Rozszerzenie istniejącego middleware o:

1. **Inicjalizacja klienta Supabase z obsługą sesji**
   - Tworzenie klienta z dostępem do cookies
   - Odświeżanie tokenów JWT

2. **Weryfikacja sesji dla chronionych tras**
   - Lista chronionych ścieżek
   - Przekierowanie do /login bez sesji

3. **Wstrzykiwanie danych użytkownika do context.locals**
   - `locals.supabase` - klient Supabase
   - `locals.user` - dane zalogowanego użytkownika lub null

#### 3.5.2. Konfiguracja chronionych tras

```typescript
const protectedRoutes = [
  '/generate',
  '/flashcards',
  '/study',
  '/api/flashcards',
  '/api/generations',
];

const authRoutes = [
  '/login',
  '/register',
  '/reset-password',
];
```

Logika:
- Dla `protectedRoutes`: brak sesji → redirect do `/login`
- Dla `authRoutes`: aktywna sesja → redirect do `/generate`

---

## 4. System autentykacji

### 4.1. Konfiguracja Supabase Auth

#### 4.1.1. Ustawienia projektu Supabase

- **Confirm email**: Wyłączone (użytkownik logowany automatycznie po rejestracji)
- **Secure email change**: Włączone
- **Email templates**: Dostosowane (polski język) - używane tylko dla reset hasła
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback` (dev)
  - `https://domain.com/auth/callback` (prod)

#### 4.1.2. Zmienne środowiskowe

```env
# Istniejące
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ... (anon key)

# Opcjonalne dla server-side
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tylko backend, nigdy w kliencie!)
```

### 4.2. Zarządzanie sesją

#### 4.2.1. Strategia sesji

- **Typ**: Sesja oparta na JWT z refresh tokenami
- **Przechowywanie**: HttpOnly cookies (secure w produkcji)
- **Czas życia access token**: 1 godzina
- **Czas życia refresh token**: 7 dni
- **Odświeżanie**: Automatyczne przez middleware

#### 4.2.2. Klient Supabase dla SSR

```typescript
// src/db/supabase.server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createSupabaseServerClient(
  cookies: AstroCookies
) {
  return createServerClient(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookies.delete(name, options);
        },
      },
    }
  );
}
```

### 4.3. Row Level Security (RLS)

#### 4.3.1. Włączenie RLS

Wymagane kroki w Supabase:
1. Włączenie RLS dla tabel: `flashcards`, `generations`, `generation_error_logs`
2. Dodanie polityk bezpieczeństwa

#### 4.3.2. Polityki bezpieczeństwa

**Tabela flashcards:**
```sql
-- SELECT: użytkownik widzi tylko swoje fiszki
CREATE POLICY "Users can view own flashcards"
ON flashcards FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: użytkownik może tworzyć fiszki tylko dla siebie
CREATE POLICY "Users can create own flashcards"
ON flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: użytkownik może edytować tylko swoje fiszki
CREATE POLICY "Users can update own flashcards"
ON flashcards FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE: użytkownik może usuwać tylko swoje fiszki
CREATE POLICY "Users can delete own flashcards"
ON flashcards FOR DELETE
USING (auth.uid() = user_id);
```

**Analogiczne polityki dla tabel `generations` i `generation_error_logs`.**

### 4.4. Przepływ autentykacji

#### 4.4.1. Diagram sekwencyjny logowania

```
┌─────────┐          ┌─────────┐         ┌─────────┐         ┌─────────┐
│ Browser │          │  Astro  │         │Supabase │         │  Email  │
└────┬────┘          └────┬────┘         └────┬────┘         └────┬────┘
     │                    │                   │                   │
     │ POST /api/auth/login                   │                   │
     │ {email, password}  │                   │                   │
     │───────────────────>│                   │                   │
     │                    │                   │                   │
     │                    │ signInWithPassword│                   │
     │                    │──────────────────>│                   │
     │                    │                   │                   │
     │                    │   {session, user} │                   │
     │                    │<──────────────────│                   │
     │                    │                   │                   │
     │  Set-Cookie + 200  │                   │                   │
     │<───────────────────│                   │                   │
     │                    │                   │                   │
     │ Redirect /generate │                   │                   │
     │<───────────────────│                   │                   │
```

#### 4.4.2. Diagram sekwencyjny rejestracji

```
┌─────────┐          ┌─────────┐         ┌─────────┐
│ Browser │          │  Astro  │         │Supabase │
└────┬────┘          └────┬────┘         └────┬────┘
     │                    │                   │
     │ POST /api/auth/register                │
     │ {email, password}  │                   │
     │───────────────────>│                   │
     │                    │                   │
     │                    │ signUp            │
     │                    │ (autoconfirm)     │
     │                    │──────────────────>│
     │                    │                   │
     │                    │ {session, user}   │
     │                    │<──────────────────│
     │                    │                   │
     │  Set-Cookie + 201  │                   │
     │<───────────────────│                   │
     │                    │                   │
     │ Redirect /generate │                   │
     │<───────────────────│                   │
```

**Uwaga:** Weryfikacja email jest wyłączona (Confirm email = OFF).
Użytkownik jest automatycznie zalogowany po rejestracji zgodnie z PRD US-001.

### 4.5. Usunięcie konta (RODO)

#### 4.5.1. Endpoint usunięcia

| Metoda | Ścieżka | Opis |
|--------|---------|------|
| DELETE | `/api/auth/account` | Usunięcie konta i wszystkich danych |

#### 4.5.2. Proces usunięcia

1. Użytkownik potwierdza chęć usunięcia konta
2. Wywołanie endpointu DELETE
3. Kaskadowe usunięcie:
   - Wszystkie fiszki użytkownika
   - Wszystkie rekordy generacji
   - Logi błędów
   - Konto w Supabase Auth
4. Wylogowanie i przekierowanie

---

## 5. Kontrakty danych

### 5.1. Typy TypeScript

#### 5.1.1. Typy sesji i użytkownika

```typescript
// src/types/auth.ts

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
```

#### 5.1.2. Typy odpowiedzi API

```typescript
// src/types/api.ts

interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, string>;
}

type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
```

### 5.2. Rozszerzenie kontekstu Astro

```typescript
// src/env.d.ts

declare namespace App {
  interface Locals {
    supabase: SupabaseClient<Database>;
    user: User | null;
  }
}
```

### 5.3. Struktura plików

```
src/
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ResetPasswordForm.tsx
│       ├── UpdatePasswordForm.tsx
│       ├── AuthGuard.tsx
│       └── UserMenu.tsx
├── db/
│   ├── supabase.client.ts     # klient przeglądarkowy
│   └── supabase.server.ts     # klient serwerowy (nowy)
├── layouts/
│   ├── Layout.astro           # modyfikacja
│   └── AuthLayout.astro       # nowy
├── lib/
│   ├── schemas/
│   │   └── auth.schema.ts     # schematy Zod
│   ├── errors/
│   │   └── auth.error.ts      # klasa błędów
│   └── services/
│       └── auth.service.ts    # logika autentykacji (opcjonalnie)
├── middleware/
│   └── index.ts               # modyfikacja
├── pages/
│   ├── api/
│   │   └── auth/
│   │       ├── register.ts
│   │       ├── login.ts
│   │       ├── logout.ts
│   │       ├── reset-password.ts
│   │       ├── update-password.ts
│   │       └── account.ts     # DELETE endpoint
│   ├── auth/
│   │   └── callback.astro
│   ├── login.astro
│   ├── register.astro
│   └── reset-password.astro
└── types/
    └── auth.ts
```

---

## 6. Podsumowanie wymagań implementacyjnych

### 6.1. Priorytet wysoki (MVP)

1. Konfiguracja Supabase Auth i klienta SSR
2. Middleware z obsługą sesji
3. Strony: login, register
4. Komponenty: LoginForm, RegisterForm
5. API: register, login, logout
6. Ochrona tras /generate, /api/*
7. Włączenie RLS

### 6.2. Priorytet średni

1. Reset hasła (strona + API)
2. Strona /flashcards
3. Menu użytkownika
4. AuthLayout

### 6.3. Priorytet niski

1. Usunięcie konta (RODO)
2. Dostosowanie szablonów email
3. Rate limiting

---

## 7. Changelog

| Data | Wersja | Opis zmian |
|------|--------|------------|
| 2026-01-25 | 1.0 | Utworzenie dokumentu specyfikacji |
| 2026-01-25 | 1.1 | Dostosowanie do PRD: wyłączenie weryfikacji email, automatyczne logowanie po rejestracji, usunięcie pola "powtórz hasło" z formularza rejestracji |
| 2026-01-25 | 1.2 | Dodanie sekcji 2.6 Wireframe'y stron i 2.7 Komponenty UI do wykorzystania |
