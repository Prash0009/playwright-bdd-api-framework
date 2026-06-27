# Playwright-BDD API Test Automation Framework

An industry-standard, production-grade **API test automation framework** built with:

| Concern            | Tooling |
|--------------------|---------|
| Language / runtime | JavaScript (Node.js, ES Modules) |
| Test engine        | [Playwright](https://playwright.dev) (`@playwright/test` + `APIRequestContext`) |
| BDD layer          | [playwright-bdd](https://vitalets.github.io/playwright-bdd/) (Cucumber / Gherkin `.feature` files) |
| Reporting          | [Allure](https://allurereport.org/) (trends, history, request/response attachments) |
| Logging            | [Winston](https://github.com/winstonjs/winston) (console + rotating files) |
| Schema validation  | [Ajv](https://ajv.js.org/) (JSON Schema) |
| Config / secrets   | dotenv + per-environment config |
| CI/CD              | GitHub Actions → publishes Allure report to GitHub Pages |

**System under test:** [JSONPlaceholder](https://jsonplaceholder.typicode.com) — a free, no-auth public REST API supporting `GET / POST / PUT / DELETE`. (See [ARCHITECTURE.md](ARCHITECTURE.md) for why this was chosen over reqres.in.)

---

## ✨ Features

- ✅ **BDD / Gherkin** scenarios compiled to native Playwright tests
- ✅ Sample coverage for **GET, POST, PUT, DELETE**
- ✅ **Data-driven** tests via `Scenario Outline` + `Examples`
- ✅ **Test-data manager** handling JSON objects *and* strings/arrays, with per-environment data
- ✅ **JSON-Schema** contract validation of responses
- ✅ **Failed-test re-run** (Playwright retries; report distinguishes *flaky* vs *failed*)
- ✅ **Tag-based execution** (`@smoke`, `@regression`, `@get`, `@post`, `@put`, `@delete`)
- ✅ **Service/Client layer** (Base client + endpoint clients) — clean separation of concerns
- ✅ **Allure reporting** with request/response attachments + environment info
- ✅ **GitHub Actions** workflow with manual tag selection + Pages publishing

---

## 📋 Prerequisites

- **Node.js ≥ 18** (tested on Node 20)
- npm
- **Java 8+** — only required to *view* Allure reports locally (`allure` CLI). Not needed to run tests.

---

## 🚀 Setup

```bash
git clone https://github.com/Prash0009/playwright-bdd-api-framework.git
cd playwright-bdd-api-framework

npm install
npx playwright install        # installs browsers (Playwright requirement)

cp .env.example .env          # optional — sensible defaults work out of the box
```

---

## ▶️ Running tests

The `pretest` hook regenerates the BDD test files automatically before `npm test`.

```bash
npm test                # run the full suite
npm run test:smoke      # only @smoke scenarios
npm run test:regression # only @regression scenarios
npm run test:get        # only @get
npm run test:post       # only @post
npm run test:put        # only @put
npm run test:delete     # only @delete
```

Run an arbitrary tag expression manually:

```bash
npx bddgen --tags "@get or @post" && npx playwright test
```

---

## 📊 Reports

```bash
npm run report          # generate static HTML report into ./allure-report
npm run report:open     # open the generated report
npm run report:serve    # generate + serve on the fly
```

Playwright's own HTML report is also produced under `./playwright-report`, and logs under `./logs`.

In CI, the Allure report is published to **GitHub Pages** after every push to `main`.

### 📄 PDF report (auto-generated)

A custom Playwright reporter ([`reporters/pdf-reporter.js`](reporters/pdf-reporter.js)) writes a
PDF execution summary into **`./reports`** automatically after **every** run (any tag, local or CI):

- `reports/api-test-report-<timestamp>.pdf` — one per run
- `reports/latest.pdf` — always the most recent run

The PDF contains the overall status, pass/fail/flaky/skipped counts, pass rate, duration, and a
colour-coded per-scenario results table. No extra command is needed — it's produced as part of
`npm test` (and every `npm run test:<tag>`). In CI it's bundled into the `test-artifacts` download.

---

## 🏷️ Test data

Test data lives in [`/data`](data) as JSON. The `DataManager` supports both structured
objects and plain strings/arrays, and resolves per-environment branches automatically:

```js
DataManager.get('users', 'create.payload');  // -> { name: 'morpheus', job: 'leader' }
DataManager.get('endpoints', 'list');        // -> '/users'  (string leaf)
DataManager.get('endpoints', 'sampleNames'); // -> ['neo','trinity','morpheus'] (array)
```

---

## 🔁 Failed-test re-run

Configured in [`playwright.config.js`](playwright.config.js):

- `retries: 2` in CI, `1` locally.
- A test that passes on retry is reported as **flaky**; one that never passes is **failed** —
  both Allure and the Playwright HTML report surface this distinction.

---

## 🤖 CI/CD (GitHub Actions)

Workflow: [`.github/workflows/api-tests.yml`](.github/workflows/api-tests.yml)

- Triggers on `push`, `pull_request`, and **manual `workflow_dispatch`** with a `tag` input
  (e.g. run only `@smoke` from the Actions UI).
- Installs deps → generates tag-filtered BDD tests → runs Playwright → builds Allure report.
- Carries Allure **history** across runs (trends).
- Uploads `allure-report`, `playwright-report`, and `logs` as artifacts.
- Publishes the Allure report to **GitHub Pages**.

> **One-time setup:** in the repo, go to **Settings → Pages → Build and deployment → Source = GitHub Actions**.

---

## 📁 Project structure

```
playwright-bdd-api-framework/
├─ features/        # Gherkin .feature files (tagged)
├─ steps/           # step definitions (Given/When/Then)
├─ clients/         # API service layer (base.client + users.client)
├─ utils/           # logger, dataManager, schemaValidator
├─ data/            # JSON / string / array test-data fixtures
├─ schemas/         # JSON Schemas for response validation
├─ config/          # environment configuration
├─ hooks/           # BDD fixtures + Before/After lifecycle hooks
├─ .github/workflows/  # CI pipeline
├─ playwright.config.js
├─ README.md  ARCHITECTURE.md  PROMPT.md
└─ .env.example  .gitignore  package.json
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full execution flow and design rationale.

## 📄 License

[MIT](LICENSE)
