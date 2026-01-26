# Diagram Autentykacji - 10xCards

<authentication_analysis>

## Analiza przepływów autentykacji

### 1. Przepływy autentykacji wymienione w dokumentacji:

- **Rejestracja użytkownika (US-001)**: Formularz rejestracyjny z email i hasłem → API endpoint `/api/auth/register` → Supabase Auth → zwrot tokenu JWT → zapis w cookies → przekierowanie do widoku generowania
- **Logowanie użytkownika (US-002)**: Formularz logowania z email i hasłem → API endpoint `/api/auth/login` → Supabase Auth → zwrot tokenu JWT → zapis w cookies → przekierowanie do widoku generowania
- **Wylogowanie**: Żądanie POST do `/api/auth/logout` → Supabase Auth → usunięcie tokenu z cookies → przekierowanie do logowania
- **Weryfikacja sesji w middleware**: Każde żądanie do chronionych stron → Middleware → weryfikacja tokenu przez Supabase Auth → ustawienie `locals.user` lub przekierowanie do logowania
- **Odświeżanie tokenu**: Automatyczne odświeżanie tokenu przez `@supabase/ssr` przy wygaśnięciu tokenu dostępu

### 2. Główni aktorzy i ich interakcje:

1. **Przeglądarka (Browser)**: Inicjuje żądania HTTP, wyświetla formularze, zarządza cookies, obsługuje przekierowania
2. **Middleware (Astro Middleware)**: Interceptuje wszystkie żądania, weryfikuje token JWT, sprawdza ścieżki publiczne, ustawia `locals.user`, wykonuje przekierowania
3. **Astro API**: Endpointy `/api/auth/login`, `/api/auth/register`, `/api/auth/logout` - przetwarzają żądania autentykacji
4. **Supabase Auth**: Zarządza użytkownikami, weryfikuje dane logowania, generuje tokeny JWT, zarządza sesjami

### 3. Procesy weryfikacji i odświeżania tokenów:

- **Weryfikacja tokenu**: Middleware wywołuje `supabase.auth.getUser()` przy każdym żądaniu do chronionych stron. Supabase Auth weryfikuje token JWT z cookies.
- **Odświeżanie tokenu**: `@supabase/ssr` automatycznie odświeża token dostępu przy użyciu refresh token, gdy token dostępu wygasa. Proces jest transparentny dla aplikacji.
- **Ochrona przed nieautoryzowanym dostępem**: Middleware sprawdza ścieżki publiczne (`PUBLIC_PATHS`). Jeśli ścieżka nie jest publiczna i użytkownik nie jest zalogowany, następuje przekierowanie do `/auth/login`.

### 4. Opis kroków autentykacji:

**Rejestracja:**
1. Użytkownik wypełnia formularz rejestracyjny (email, hasło)
2. Przeglądarka wysyła POST do `/api/auth/register`
3. Middleware sprawdza, czy ścieżka jest publiczna (tak) i przepuszcza żądanie
4. API tworzy instancję Supabase z cookies
5. API wywołuje `supabase.auth.signUp()` z danymi użytkownika
6. Supabase Auth tworzy użytkownika i zwraca token JWT
7. `@supabase/ssr` zapisuje token w cookies (httpOnly, secure, sameSite: lax)
8. API zwraca dane użytkownika
9. Przeglądarka przekierowuje do widoku generowania

**Logowanie:**
1. Użytkownik wypełnia formularz logowania (email, hasło)
2. Przeglądarka wysyła POST do `/api/auth/login`
3. Middleware sprawdza, czy ścieżka jest publiczna (tak) i przepuszcza żądanie
4. API tworzy instancję Supabase z cookies
5. API wywołuje `supabase.auth.signInWithPassword()` z danymi użytkownika
6. Supabase Auth weryfikuje dane i zwraca token JWT
7. `@supabase/ssr` zapisuje token w cookies
8. API zwraca dane użytkownika
9. Przeglądarka przekierowuje do widoku generowania

**Dostęp do chronionej strony:**
1. Użytkownik żąda dostępu do chronionej strony (np. `/generate`)
2. Middleware interceptuje żądanie
3. Middleware sprawdza, czy ścieżka jest publiczna (nie)
4. Middleware tworzy instancję Supabase z cookies
5. Middleware wywołuje `supabase.auth.getUser()` do weryfikacji tokenu
6. Jeśli token jest ważny, Supabase Auth zwraca dane użytkownika
7. Middleware ustawia `locals.user` z danymi użytkownika
8. Middleware przepuszcza żądanie do strony
9. Strona renderuje się z dostępem do `Astro.locals.user`

**Wygaśnięcie tokenu:**
1. Użytkownik żąda dostępu do chronionej strony
2. Middleware weryfikuje token przez `supabase.auth.getUser()`
3. Supabase Auth wykrywa wygaśnięcie tokenu dostępu
4. `@supabase/ssr` automatycznie próbuje odświeżyć token używając refresh token
5. Jeśli odświeżanie się powiedzie, nowy token jest zapisany w cookies i żądanie kontynuuje się
6. Jeśli odświeżanie się nie powiedzie, użytkownik jest przekierowany do logowania

**Wylogowanie:**
1. Użytkownik klika przycisk wylogowania
2. Przeglądarka wysyła POST do `/api/auth/logout`
3. Middleware sprawdza, czy ścieżka jest publiczna (tak) i przepuszcza żądanie
4. API tworzy instancję Supabase z cookies
5. API wywołuje `supabase.auth.signOut()`
6. Supabase Auth unieważnia token i refresh token
7. `@supabase/ssr` usuwa token z cookies
8. API zwraca sukces
9. Przeglądarka przekierowuje do strony logowania

</authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przeglądarka
    participant Middleware as Middleware
    participant API as Astro API
    participant Supabase as Supabase Auth

    Note over Browser,Supabase: Przepływ rejestracji użytkownika

    Browser->>Middleware: POST /api/auth/register
    activate Middleware
    Middleware->>Middleware: Sprawdź PUBLIC_PATHS
    Note right of Middleware: Ścieżka publiczna<br/>przepuszczam żądanie
    Middleware->>API: Przekaż żądanie
    deactivate Middleware
    activate API
    API->>API: Utwórz instancję Supabase<br/>z cookies (getAll)
    API->>Supabase: signUp(email, password)
    activate Supabase
    Supabase->>Supabase: Utwórz użytkownika<br/>wygeneruj JWT
    Supabase-->>API: Zwróć token JWT + user
    deactivate Supabase
    API->>API: setAll cookies<br/>(httpOnly, secure, sameSite)
    API-->>Browser: 200 OK { user }
    deactivate API
    Browser->>Browser: Przekieruj do /generate

    Note over Browser,Supabase: Przepływ logowania użytkownika

    Browser->>Middleware: POST /api/auth/login
    activate Middleware
    Middleware->>Middleware: Sprawdź PUBLIC_PATHS
    Note right of Middleware: Ścieżka publiczna<br/>przepuszczam żądanie
    Middleware->>API: Przekaż żądanie
    deactivate Middleware
    activate API
    API->>API: Utwórz instancję Supabase<br/>z cookies (getAll)
    API->>Supabase: signInWithPassword(email, password)
    activate Supabase
    Supabase->>Supabase: Weryfikuj dane<br/>wygeneruj JWT
    alt Weryfikacja pomyślna
        Supabase-->>API: Zwróć token JWT + user
        API->>API: setAll cookies<br/>(httpOnly, secure, sameSite)
        API-->>Browser: 200 OK { user }
        Browser->>Browser: Przekieruj do /generate
    else Weryfikacja nieudana
        Supabase-->>API: Błąd autentykacji
        API-->>Browser: 400 Bad Request { error }
        Browser->>Browser: Wyświetl komunikat błędu
    end
    deactivate Supabase
    deactivate API

    Note over Browser,Supabase: Przepływ dostępu do chronionej strony

    Browser->>Middleware: GET /generate
    activate Middleware
    Middleware->>Middleware: Sprawdź PUBLIC_PATHS
    Note right of Middleware: Ścieżka chroniona<br/>wymaga autentykacji
    Middleware->>Middleware: Utwórz instancję Supabase<br/>z cookies (getAll)
    Middleware->>Supabase: getUser() - weryfikuj token
    activate Supabase
    Supabase->>Supabase: Weryfikuj JWT token
    alt Token ważny
        Supabase-->>Middleware: Zwróć user data
        deactivate Supabase
        Middleware->>Middleware: Ustaw locals.user<br/>{ email, id }
        Middleware->>Browser: Renderuj stronę /generate
        Browser->>Browser: Wyświetl widok generowania
    else Token nieważny lub brak tokenu
        Supabase-->>Middleware: Brak użytkownika
        deactivate Supabase
        Middleware->>Browser: Redirect /auth/login
        Browser->>Browser: Przekieruj do logowania
    end
    deactivate Middleware

    Note over Browser,Supabase: Przepływ odświeżania tokenu

    Browser->>Middleware: GET /generate (token wygasł)
    activate Middleware
    Middleware->>Middleware: Utwórz instancję Supabase<br/>z cookies (getAll)
    Middleware->>Supabase: getUser() - weryfikuj token
    activate Supabase
    Supabase->>Supabase: Wykryj wygaśnięcie<br/>tokenu dostępu
    Supabase->>Supabase: Automatyczne odświeżenie<br/>używając refresh token
    alt Odświeżenie pomyślne
        Supabase->>Supabase: Wygeneruj nowy JWT
        Supabase-->>Middleware: Zwróć user data + nowy token
        deactivate Supabase
        Middleware->>Middleware: setAll cookies<br/>(nowy token)
        Middleware->>Middleware: Ustaw locals.user
        Middleware->>Browser: Renderuj stronę /generate
        Browser->>Browser: Wyświetl widok generowania
    else Odświeżenie nieudane
        Supabase-->>Middleware: Błąd odświeżania
        deactivate Supabase
        Middleware->>Browser: Redirect /auth/login
        Browser->>Browser: Przekieruj do logowania
    end
    deactivate Middleware

    Note over Browser,Supabase: Przepływ wylogowania

    Browser->>Middleware: POST /api/auth/logout
    activate Middleware
    Middleware->>Middleware: Sprawdź PUBLIC_PATHS
    Note right of Middleware: Ścieżka publiczna<br/>przepuszczam żądanie
    Middleware->>API: Przekaż żądanie
    deactivate Middleware
    activate API
    API->>API: Utwórz instancję Supabase<br/>z cookies (getAll)
    API->>Supabase: signOut()
    activate Supabase
    Supabase->>Supabase: Unieważnij token<br/>i refresh token
    Supabase-->>API: Sukces
    deactivate Supabase
    API->>API: Usuń cookies (setAll)
    API-->>Browser: 200 OK
    deactivate API
    Browser->>Browser: Przekieruj do /auth/login

    Note over Browser,Supabase: Przepływ dostępu do publicznej strony

    Browser->>Middleware: GET /auth/login
    activate Middleware
    Middleware->>Middleware: Sprawdź PUBLIC_PATHS
    Note right of Middleware: Ścieżka publiczna<br/>przepuszczam bez weryfikacji
    Middleware->>Browser: Renderuj stronę /auth/login
    deactivate Middleware
    Browser->>Browser: Wyświetl formularz logowania
```

</mermaid_diagram>
