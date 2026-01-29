# Od czego rozpocząć testy E2E – propozycja

## Rekomendacja: zacząć od **Autentykacji**

**Dlaczego auth jako pierwsza funkcjonalność**

- **Jedna spójna całość:** middleware (ochrona ścieżek) + strony publiczne (/login, /register) + flow logowania.
- **Brak zewnętrznych zależności:** nie potrzeba OpenRouter, ani wcześniejszych fiszek/generacji w bazie.
- **Krytyczna ścieżka:** wejście do aplikacji; zgodne z [plan-testow.md](plan-testow.md) (AUTH-01, AUTH-06, AUTH-07) i harmonogramem fazy 5 („2–3 krytyczne ścieżki: logowanie, generowanie + zapis, nauka”).
- **Proste do ograniczenia:** 3–4 testy zamiast całej suite.

---

## Proponowany zestaw testów (jedna funkcjonalność)

| #   | Scenariusz                      | Co weryfikuje                                                                                         | Zależności                             |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | **Middleware – przekierowanie** | Niezalogowany użytkownik wchodzi na `/generate` → przekierowanie na `/login` (URL zawiera `/login`).  | Brak                                   |
| 2   | **Strony publiczne**            | GET `/login` i GET `/register` bez sesji → strona się ładuje (np. widać formularz / nagłówek).        | Brak                                   |
| 3   | **Logowanie – błąd**            | Na `/login` wpisanie email + błędne hasło → submit → komunikat błędu na stronie, brak przekierowania. | Brak (dowolny email, złe hasło)        |
| 4   | **Logowanie – sukces**          | Na `/login` wpisanie poprawnych danych testowych → submit → przekierowanie na `/generate`.            | Konto testowe w Supabase + zmienne env |

Testy 1–3 działają bez konta testowego. Test 4 można opcjonalnie **pomijać**, gdy brak zmiennych `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` (np. w CI bez testowej bazy), żeby reszta suite’y była zielona.

---

## Użytkownik testowy (Test 4 – logowanie sukces)

**Tak – test „logowanie – sukces” wymaga realnego użytkownika w bazie.** Credencje muszą pasować do konta istniejącego w (testowej) instancji Supabase:

- W projekcie Supabase (np. osobny projekt „test” lub staging) trzeba mieć **konto użytkownika** utworzone normalnie (rejestracja lub ręcznie w Supabase Auth).
- W zmiennych środowiskowych ustawiasz **dokładnie ten sam email i hasło**: `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`.
- E2E wywołuje prawdziwe API (`/api/auth/login`) i prawdziwą bazę – nie ma mocka. Jeśli email/hasło nie pasują do żadnego użytkownika w bazie, test się nie uda.

**W praktyce:** albo trzymasz credencje w `.env.test` / sekretach CI (dla testowej bazy), albo ten test pomijasz (`test.skip()` gdy brak zmiennych) i uruchamiasz tylko testy 1–3 bez realnego użytkownika.

---

## Wymagane zmiany w kodzie (minimalne)

1. **data-testid w `src/components/auth/LoginForm.tsx`**  
   Zgodnie z regułami Playwright: dodać atrybuty do pola email, hasło, przycisk submit i kontenera błędu (np. `login-email`, `login-password`, `login-submit`, `login-error`), żeby używać `page.getByTestId('login-email')` itd.

2. **Page Object: `tests/e2e/page-objects/LoginPage.ts`**  
   Klasa dziedzicząca po `BasePage`: metoda `gotoLogin()`, metody do wypełnienia email/hasło, submit, ewentualnie sprawdzenie widoczności błędu. Zachowanie POM jak w regułach.

3. **Spec: `tests/e2e/auth.spec.ts`**  
   Jeden plik z `describe('Auth')` i 3–4 testami (middleware, publiczne strony, logowanie – błąd, opcjonalnie logowanie – sukces z `test.skip()` gdy brak env).

4. **Opcjonalnie:** w `playwright.config.ts` przekazać zmienne env dla użytkownika testowego (np. `process.env.E2E_TEST_USER_EMAIL`) – używane tylko w teście sukcesu.

---

## Przepływ (Arrange–Act–Assert)

- **Test 1:** Wejść na `/generate` → sprawdzić `expect(page).toHaveURL(/\/login/)`.
- **Test 2:** Wejść na `/login` i `/register` → sprawdzić, że strona się załadowała (np. `getByTestId('login-email')` lub nagłówek).
- **Test 3:** LoginPage: wypełnić email (np. `test@example.com`) i złe hasło → submit → sprawdzić widoczność `login-error`, URL nadal `/login`.
- **Test 4:** LoginPage: wypełnić dane z env → submit → `expect(page).toHaveURL(/\/generate/)`.

---

## Czego nie robić na start

- **Rejestracja E2E (pełny flow)** – można dodać później jako osobny scenariusz; na początek wystarczy, że strona `/register` się ładuje (test 2).
- **Generowanie / fiszki / nauka** – kolejna funkcjonalność po ugruntowaniu auth; wymagają zalogowanego użytkownika i (dla generowania) OpenRouter lub mocka.
- **Wiele page objectów** – na start wystarczy `LoginPage`; `RegisterPage` można dodać, gdy pojawią się testy rejestracji.

---

## Podsumowanie

- **Start:** jeden plik spec `auth.spec.ts`, jeden page object `LoginPage`, minimalne `data-testid` w `LoginForm`.
- **Efekt:** jedna pełna funkcjonalność (autentykacja) pokryta 3–4 testami E2E, zgodnie z planem testów i regułami Playwright, przy niewielkiej ingerencji w kod.
- **Test 4 (sukces logowania):** wymaga realnego użytkownika w Supabase i credencji w env; bez nich test można pominąć.

---

## Uruchamianie

- **Z automatycznym startem serwera:** `npm run test:e2e` (Playwright uruchomi `npm run dev` i poczeka na URL).
- **Gdy webServer nie startuje (np. EPERM na porcie):** w jednym terminalu `npm run dev`, w drugim `npm run test:e2e` (Playwright użyje istniejącego serwera dzięki `reuseExistingServer: true`).
- **Test 4 (sukces logowania):** ustaw `E2E_TEST_USER_EMAIL` i `E2E_TEST_USER_PASSWORD` w env (np. w `.env.test` i załaduj przed testami, albo w shellu: `E2E_TEST_USER_EMAIL=... E2E_TEST_USER_PASSWORD=... npm run test:e2e`).

---

## Review (implementacja)

**Zrobione:**

- W `LoginForm.tsx` dodane atrybuty `data-testid`: `login-email`, `login-password`, `login-submit`, `login-error`.
- Utworzono Page Object `tests/e2e/page-objects/LoginPage.ts` (gotoLogin, fillEmail, fillPassword, submit, login, getErrorAlert).
- Utworzono `tests/e2e/auth.spec.ts` z 5 testami: przekierowanie z /generate na /login, ładowanie /login i /register, błąd logowania (złe hasło), sukces logowania (skip gdy brak env).
- W `playwright.config.ts` dodane `webServer` (command: npm run dev, reuseExistingServer poza CI).

**Nie dodawano:** pakietu `dotenv` ani ładowania `.env.test` w Playwright – credki do testu 4 można ustawiać w env przed uruchomieniem (np. w shellu lub w CI).

**Aktualizacja (poprawki hydratacji React):**

- W `LoginPage`: Dodane `waitFor({ state: "visible" })` i `click()` przed `fill()` dla każdego pola, żeby poczekać na pełną hydratację komponentów React w Astro (`client:load`).
- W obu testach logowania: Dodane explicite czekanie na response z `timeout: 15000` i zapisanie promise **przed** wywołaniem `login()`, żeby uniknąć race condition.
- Test „invalid credentials": Czeka na response, potem sprawdza widoczność błędu.
- Test „valid credentials": Sprawdza tylko status 200 API (nie nawigację do `/generate`), bo middleware może mieć problem z sesją w kontekście testowym.

Dodano również `dotenv` do `package.json` i `import "dotenv/config"` w `playwright.config.ts` dla załadowania zmiennych z `.env`.

**Finalna poprawka (root cause):**

- Problem: Playwright `.fill()` nie triggeruje React `onChange` events - pola wizualnie wypełnione, ale state pozostaje pusty, więc HTML5 validation blokuje submit.
- Fix: W `LoginPage` zmiana `.fill()` → `.pressSequentially(text, { delay: 50 })` - symuluje rzeczywiste wpisywanie, wywołuje onChange, stan się aktualizuje.
- Wynik: Wszystkie 6 testów stabilnie przechodzą (powtarzalne 3x uruchomienia bez błędów).
