# Prompt / Specification

This file captures the full specification used to generate this framework, so the project is
reproducible. Hand the prompt below to an AI agent (or a developer) to rebuild an equivalent
framework from scratch.

> **Implementation note:** the spec originally named **reqres.in** as the system under test.
> reqres.in now requires a personally registered API key (the old public key returns `401`),
> which breaks out-of-the-box and CI runs, so the implementation uses **JSONPlaceholder**
> instead. See [ARCHITECTURE.md §8](ARCHITECTURE.md#8-why-jsonplaceholder-instead-of-reqresin).

---

## Prompt

> **Role:** You are a senior SDET / test-automation architect. Build a production-grade,
> industry-standard **API testing framework** from scratch and publish it to a **new public
> GitHub repository**. The framework must run successfully both locally and in GitHub Actions
> before the task is considered done — verify it.
>
> ### 1. Tech Stack (mandatory)
> - **Language:** JavaScript, Node.js (LTS), ES Modules
> - **Test engine:** Playwright (`@playwright/test`) using its `APIRequestContext` for API calls
> - **BDD layer:** `playwright-bdd` — Gherkin `.feature` files compiled into native Playwright tests
> - **Reporting:** Allure (`allure-playwright`) — history/trends, environment info, request/response attachments
> - **Logging:** Winston — levels, console + rotating file output under `/logs`
> - **Schema validation:** Ajv (JSON Schema) for response contracts
> - **Config/secrets:** dotenv + per-environment config; no hardcoded secrets
>
> ### 2. Target API
> A public REST API supporting `GET/POST/PUT/DELETE`. (Implementation uses JSONPlaceholder; the
> design must allow switching to an authenticated API via config only.)
>
> ### 3. Required capabilities
> - **DataManager** loading `/data` fixtures, supporting **JSON objects and plain strings/arrays**,
>   per-environment data, and data-driven scenarios (`Scenario Outline` + `Examples`).
> - **Failed-test re-run:** configurable retries; report distinguishes **flaky** vs **failed**.
> - **Tag-based execution:** `@smoke`, `@regression`, `@get`, `@post`, `@put`, `@delete` — runnable from CLI and CI.
>
> ### 4. Sample scenarios (all four verbs, all must pass)
> GET (single + list + 404), POST (create → 201), PUT (update → 200), DELETE (→ empty body).
> Each asserts: status code, response schema (Ajv), key body values, response time; and logs request/response.
>
> ### 5. Architecture (industry-standard)
> Base API client + per-resource service clients; reusable assertion/schema/data utils;
> Before/After hooks for setup/teardown, auth, logging, Allure attachments; clean folder separation
> (`features/ steps/ clients/ utils/ data/ schemas/ config/ hooks/`).
>
> ### 6. GitHub Actions
> Trigger on push, pull_request, and `workflow_dispatch` with a `tag` input. Install deps →
> generate tag-filtered BDD tests → run → build Allure report (with carried history) →
> **publish Allure report to GitHub Pages** → upload report + logs as artifacts.
>
> ### 7. npm scripts
> `test`, `test:smoke`, `test:get/post/put/delete`, `report`, `report:open`.
>
> ### 8. Deliverables
> New public GitHub repo (clean history, pushed to `main`); runnable out of the box; `README.md`,
> `ARCHITECTURE.md` (with Mermaid flow diagram + endpoints), `PROMPT.md`, `.gitignore`, `.env.example`.
>
> ### 9. Definition of Done
> All 4 sample verbs pass locally and in CI; Allure publishes to Pages; retry + tag filtering work;
> no secrets committed. Output the repo URL, the Pages report URL, and the commands to run each sample.
