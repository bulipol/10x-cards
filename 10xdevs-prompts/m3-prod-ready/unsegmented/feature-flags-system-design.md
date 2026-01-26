# Feature Flags System Design

In my application, I would like to separate deployments from releases by introducing a feature flag system.

It should be applicable:

- at the api endpoint level (collections, auth)
- at the astro pages level – @login.astro @signup.astro @reset-password.astro
- at the collections visibility level – @TwoPane.tsx and @MobileNavigation.tsx

At the level of the mentioned modules, I should be able to check the state of the flag for a given functionality, according to the environment.

Design a universal TypeScript module that can be used on the frontend and backend (src/features), which will store flag configuration for local, integration, and production environments. Add flags for "auth" and "collections".

I will provide the environment as the ENV_NAME variable (local, integration, prod)

We will deal with integration in the next step. Before we start, ask me 5 questions that will facilitate the entire implementation.
