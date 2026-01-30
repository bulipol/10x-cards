# 10xCards

## Project Description

10xCards is a web application designed for automatically generating flashcards using LLMs. It streamlines the process of creating high-quality flashcards from user-provided text, making learning more efficient and engaging. Users can generate flashcards automatically with AI or create and manage them manually.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

**Frontend:**

- Astro 5 (SSR with Node adapter)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui

**Backend:**

- Supabase (PostgreSQL) for data storage and authentication
- AI integration via OpenRouter.ai API

**Testing:**

- **Vitest** – unit tests (services, utilities, React components with React Testing Library)
- **Playwright** – end-to-end (E2E) tests for critical user flows (auth, generation, flashcards, study)

**CI/CD:**

- GitHub Actions: unit tests (Vitest), E2E tests (Playwright), production build. Deployment to DigitalOcean (e.g. Docker) is configured separately.

## Getting Started Locally

1. **Clone the repository:**

   ```sh
   git clone https://github.com/przeprogramowani/10x-cards.git
   cd 10x-cards
   ```

2. **Use the correct Node version** (see `.nvmrc`, currently **22.14.0**):

   ```sh
   nvm use
   ```

3. **Install dependencies:**

   ```sh
   npm install
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables)):

   ```sh
   cp .env.example .env
   # Edit .env and set SUPABASE_URL, SUPABASE_KEY, OPENROUTER_API_KEY
   ```

5. **Run the development server:**

   ```sh
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable              | Required | Description                          |
| --------------------- | -------- | ------------------------------------ |
| `SUPABASE_URL`        | Yes      | Supabase project URL                 |
| `SUPABASE_KEY`        | Yes      | Supabase anonymous (public) key      |
| `OPENROUTER_API_KEY`  | Yes      | OpenRouter.ai API key for AI generation |
| `E2E_TEST_USER_EMAIL` | E2E only | Test user email for Playwright E2E   |
| `E2E_TEST_USER_PASSWORD` | E2E only | Test user password for Playwright E2E |

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the project for production.
- **`npm run preview`**: Previews the production build locally.
- **`npm run astro`**: Runs Astro CLI commands.
- **`npm run lint`**: Runs ESLint to check for linting issues.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the code using Prettier.
- **`npm run test`**: Runs unit tests (Vitest).
- **`npm run test:watch`**: Runs unit tests in watch mode.
- **`npm run test:ui`**: Opens Vitest UI for unit tests.
- **`npm run test:coverage`**: Runs unit tests with coverage report.
- **`npm run test:e2e`**: Runs E2E tests (Playwright).
- **`npm run test:e2e:ui`**: Runs E2E tests with Playwright UI.

## Project Structure

- `src/pages` – Astro pages and routes
- `src/pages/api` – API endpoints (auth, flashcards, generations)
- `src/components` – React and Astro components (including `ui/` for Shadcn)
- `src/lib` – Services, schemas, utilities
- `src/db` – Supabase client and database types
- `src/layouts` – Astro layouts
- `src/middleware` – Astro middleware
- `public` – Static public assets

## Project Scope

**Current MVP:**

- Automatically generating flashcards using AI from user-provided text.
- Manual creation, editing, and management of flashcards.
- User registration, login, and authentication (Supabase).

**Planned:**

- Spaced-repetition algorithm for learning optimization.
- Usage statistics to assess quality of generated flashcards.

This MVP is designed to onboard 100 active users within the first three months and will evolve based on user feedback.

## Project Status

The project is currently in the MVP stage and under active development.

## License

This project is licensed under the MIT License.
