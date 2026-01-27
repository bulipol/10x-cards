# API Endpoint Implementation Plan: Authentication Endpoints

## Analysis

### Key Points from API Specification
- Token-based authentication using Supabase Auth
- Protected endpoints require bearer token in Authorization header
- Database-level Row-Level Security (RLS) ensures users access only their records
- Endpoints: register, login, logout, reset-password, update-password, delete account

### Required Parameters
- **Register/Login**: email (required), password (required)
- **Reset Password**: email (required)
- **Update Password**: password (required), token from recovery flow
- **Logout**: session cookie (no body required)
- **Delete Account**: session cookie (no body required)

### Required Types (from auth-spec.md)
- User interface (id, email, created_at)
- Session interface (access_token, refresh_token, expires_at, user)
- AuthState interface (user, isLoading, error)
- ApiSuccessResponse<T> / ApiErrorResponse types

### Current State Analysis
- Middleware exists but lacks auth logic
- Supabase client uses basic `@supabase/supabase-js` (NOT `@supabase/ssr`)
- `DEFAULT_USER_ID` is hardcoded - bypasses real authentication
- RLS policies exist in migrations but are disabled
- No auth components, pages, or endpoints exist
- `zod` is used for validation but not in package.json (implicit dependency)

### Security Considerations
- Use `@supabase/ssr` for proper SSR cookie handling
- HttpOnly, Secure, SameSite cookies
- Never expose tokens in client-side code
- Generic error messages to prevent user enumeration
- Rate limiting consideration (future enhancement)

### Error Scenarios
- 400: Invalid input (validation errors)
- 401: Invalid credentials / Unauthorized
- 409: Email already taken (registration)
- 500: Server/Supabase errors

---

## 1. Endpoint Overview

This plan covers implementation of all authentication API endpoints:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/logout` | End user session | Yes |
| POST | `/api/auth/reset-password` | Request password reset email | No |
| POST | `/api/auth/update-password` | Set new password (after reset) | Recovery token |
| DELETE | `/api/auth/account` | Delete user account (GDPR) | Yes |

---

## 2. Request Details

### 2.1 POST /api/auth/register

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**Validation Rules:**
- `email`: required, valid email format, max 255 characters
- `password`: required, min 8 characters, max 72 characters, must contain at least one letter and one digit

### 2.2 POST /api/auth/login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass1"
}
```

**Validation Rules:**
- `email`: required, valid email format
- `password`: required, min 1 character

### 2.3 POST /api/auth/logout

**Request Body:** None (session from cookie)

### 2.4 POST /api/auth/reset-password

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Validation Rules:**
- `email`: required, valid email format

### 2.5 POST /api/auth/update-password

**Request Body:**
```json
{
  "password": "NewSecurePass1"
}
```

**Validation Rules:**
- `password`: required, min 8 characters, max 72 characters, must contain at least one letter and one digit
- Recovery token from cookie (set during reset flow)

### 2.6 DELETE /api/auth/account

**Request Body:** None (session from cookie)

---

## 3. Utilized Types

### 3.1 New Types to Add (src/types.ts or src/lib/schemas/auth.schema.ts)

```typescript
// User type for session
export interface User {
  id: string;
  email: string;
  created_at?: string;
}

// Auth state for client-side
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Auth error codes
export type AuthErrorCode =
  | "validation_error"
  | "invalid_credentials"
  | "email_taken"
  | "invalid_token"
  | "expired_token"
  | "rate_limit"
  | "server_error";
```

### 3.2 Zod Schemas (src/lib/schemas/auth.schema.ts)

```typescript
import { z } from "zod";

export const emailSchema = z.string()
  .email("Invalid email format")
  .max(255, "Email is too long");

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one digit");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});
```

---

## 4. Response Details

### 4.1 POST /api/auth/register

**Success (201):**
```json
{
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```
+ Set-Cookie header with session

**Error (400) - Validation:**
```json
{
  "error": "validation_error",
  "message": "Invalid input",
  "details": [{ "path": ["password"], "message": "..." }]
}
```

**Error (409) - Email taken:**
```json
{
  "error": "email_taken",
  "message": "User with this email already exists"
}
```

### 4.2 POST /api/auth/login

**Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```
+ Set-Cookie header with session

**Error (401):**
```json
{
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

### 4.3 POST /api/auth/logout

**Success (200):**
```json
{
  "message": "Logged out successfully"
}
```
+ Clear-Cookie header

### 4.4 POST /api/auth/reset-password

**Success (200):** Always returns success for security
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

### 4.5 POST /api/auth/update-password

**Success (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error (401):**
```json
{
  "error": "invalid_token",
  "message": "Invalid or expired reset token"
}
```

### 4.6 DELETE /api/auth/account

**Success (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error (401):**
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

---

## 5. Data Flow

### 5.1 Registration Flow
```
Client → POST /api/auth/register
  → Validate input (Zod)
  → Call supabase.auth.signUp()
  → Supabase creates user (auto-confirm enabled)
  → Return session cookies
  → Client redirected to /generate
```

### 5.2 Login Flow
```
Client → POST /api/auth/login
  → Validate input (Zod)
  → Call supabase.auth.signInWithPassword()
  → Return session cookies
  → Client redirected to /generate
```

### 5.3 Logout Flow
```
Client → POST /api/auth/logout
  → Call supabase.auth.signOut()
  → Clear session cookies
  → Client redirected to /login
```

### 5.4 Password Reset Flow
```
Client → POST /api/auth/reset-password
  → Validate email (Zod)
  → Call supabase.auth.resetPasswordForEmail()
  → User receives email with link
  → User clicks link → /auth/callback
  → Client → POST /api/auth/update-password
  → Call supabase.auth.updateUser()
  → Client redirected to /login
```

---

## 6. Security Considerations

### 6.1 Cookie Security
- **httpOnly: true** - Prevent XSS access to tokens
- **secure: true** - HTTPS only in production
- **sameSite: 'lax'** - CSRF protection
- **path: '/'** - Available across the app

### 6.2 Password Security
- Min 8 characters, max 72 (bcrypt limit)
- Require letter + digit combination
- Supabase handles hashing with bcrypt

### 6.3 Token Security
- Use `@supabase/ssr` for proper SSR cookie management
- Never expose refresh tokens to client JavaScript
- Automatic token refresh via middleware

### 6.4 Error Message Security
- Generic "Invalid email or password" for login failures
- Always return success for reset-password (prevent enumeration)
- No detailed error messages in production

### 6.5 Rate Limiting (Future)
- Implement rate limiting on auth endpoints
- Supabase has built-in rate limiting for auth

---

## 7. Error Handling

| Scenario | Status Code | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid input | 400 | validation_error | Details from Zod |
| Invalid credentials | 401 | invalid_credentials | Invalid email or password |
| Email already exists | 409 | email_taken | User with this email already exists |
| Invalid/expired token | 401 | invalid_token | Invalid or expired reset token |
| Unauthenticated access | 401 | unauthorized | Authentication required |
| Supabase error | 500 | server_error | Internal server error |

### Error Response Format
```typescript
interface ErrorResponse {
  error: AuthErrorCode;
  message: string;
  details?: unknown;
}
```

---

## 8. Performance Considerations

### 8.1 Middleware Optimization
- Check public paths first to avoid unnecessary auth checks
- Use efficient cookie parsing from `@supabase/ssr`

### 8.2 Session Management
- JWT tokens cached in cookies
- Automatic refresh handled by Supabase client
- No additional database queries for session validation

### 8.3 Database
- RLS policies handle authorization at database level
- No need for additional queries to check ownership

---

## 9. Implementation Steps

### Step 1: Install Required Dependencies
```bash
npm install @supabase/ssr zod
```

### Step 2: Create Auth Zod Schemas
Create `src/lib/schemas/auth.schema.ts` with validation schemas for all auth endpoints.

### Step 3: Update Supabase Client for SSR
Modify `src/db/supabase.client.ts` to use `@supabase/ssr` with proper cookie handling:
- Add `createSupabaseServerInstance` function
- Add `cookieOptions` configuration
- Add `parseCookieHeader` helper function
- Keep existing client for backward compatibility

### Step 4: Update Type Definitions
Update `src/env.d.ts` to include user type in `App.Locals`:
```typescript
interface Locals {
  supabase: SupabaseClient<Database>;
  user: { id: string; email: string } | null;
}
```

### Step 5: Update Middleware
Modify `src/middleware/index.ts`:
- Use `createSupabaseServerInstance` for cookie-based auth
- Define `PUBLIC_PATHS` for auth routes
- Get user session with `supabase.auth.getUser()`
- Set `locals.user` for authenticated requests
- Redirect to `/login` for protected routes without session

### Step 6: Create Auth API Endpoints
Create the following files in `src/pages/api/auth/`:

1. **register.ts** - Handle user registration
2. **login.ts** - Handle user login
3. **logout.ts** - Handle user logout
4. **reset-password.ts** - Handle password reset request
5. **update-password.ts** - Handle new password setting

Each endpoint should:
- Use `export const prerender = false`
- Parse and validate request body with Zod
- Use `createSupabaseServerInstance` for auth operations
- Return proper status codes and JSON responses
- Handle errors consistently

### Step 7: Create Account Deletion Endpoint (GDPR)
Create `src/pages/api/auth/account.ts` with DELETE handler:
- Verify user is authenticated
- Delete user data from flashcards, generations, error_logs
- Delete Supabase auth user
- Clear session cookies

### Step 8: Update Existing API Endpoints
Modify existing endpoints (`flashcards.ts`, `generations.ts`):
- Replace `DEFAULT_USER_ID` with `locals.user.id`
- Add authentication checks where needed

### Step 9: Create Auth Callback Page
Create `src/pages/auth/callback.astro`:
- Handle password reset token exchange
- Render UpdatePasswordForm component

### Step 10: Enable RLS Policies
Create new Supabase migration to re-enable RLS:
- Enable RLS on flashcards, generations, generation_error_logs
- Verify policies work with authenticated users

### Step 11: Testing
- Test all auth flows manually
- Verify protected routes redirect to login
- Test error handling scenarios
- Verify RLS policies work correctly

---

## 10. File Structure After Implementation

```
src/
├── db/
│   ├── supabase.client.ts      # Updated with SSR support
│   └── database.types.ts        # Unchanged
├── lib/
│   └── schemas/
│       └── auth.schema.ts       # NEW: Zod schemas for auth
├── middleware/
│   └── index.ts                 # Updated with auth logic
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.ts      # NEW
│   │   │   ├── login.ts         # NEW
│   │   │   ├── logout.ts        # NEW
│   │   │   ├── reset-password.ts # NEW
│   │   │   ├── update-password.ts # NEW
│   │   │   └── account.ts       # NEW (DELETE)
│   │   ├── flashcards.ts        # Updated to use locals.user
│   │   └── generations.ts       # Updated to use locals.user
│   └── auth/
│       └── callback.astro       # NEW: Password reset callback
├── env.d.ts                     # Updated with user type
└── types.ts                     # Unchanged (or add auth types)
```

---

## 11. Changelog

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-26 | 1.0 | Initial implementation plan created |
