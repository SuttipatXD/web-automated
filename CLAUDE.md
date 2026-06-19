# web-automated

Playwright automation suite for **BeWallet** — a Thai fintech KYC/registration web app.

## Stack

- **Framework**: Playwright v1.56.1 + TypeScript
- **Pattern**: Page Object Model (POM)
- **Browser**: Firefox only
- **Runtime**: Node.js (CommonJS)

## Project Structure

```
web-automated/
├── fixtures/
│   ├── base.fixture.ts       # Extends Playwright test: sets 1920×1080 viewport, disables animations
│   └── user.fixture.ts       # Reads @user <key> from test title → injects user credentials
├── pages/
│   ├── main.page.ts          # Landing page: open Register / KYC card
│   ├── login.page.ts         # Phone + ID card login form
│   ├── otp.page.ts           # OTP entry (KYC flow vs Register flow differ)
│   ├── consent.page.ts       # Terms & PDPA consent (conditional — skipped if already accepted)
│   ├── verify-identity.page.ts  # "กรุณายืนยันตัวตน" prompt
│   ├── kyc-photo.page.ts     # Camera permission denial + file upload (selfie + ID card)
│   ├── personal-info.page.ts # Personal info form (register vs verify variants)
│   ├── address.page.ts       # Address, income, occupation form
│   ├── pin.page.ts           # Set + confirm PIN
│   └── result.page.ts        # Final result: success / waiting / not-found
├── test/
│   ├── register.spec.ts      # 1 test: userD — full registration → waiting status
│   └── verify-your-identity.spec.ts  # 4 tests: userA/B/C/E — KYC flows
├── utils/
│   ├── users.json            # User credentials (gitignored — inject via CI secret)
│   ├── data.json             # Test data: OTP=123456, PIN=131313, personalInfo, addressData, file paths
│   ├── random.ts             # randomThaiPhone() / randomThaiIdCard() with checksum
│   └── src/
│       ├── selfie.png        # Upload image for selfie step
│       └── idCard.png        # Upload image for ID card step
├── scripts/
│   └── generate-dashboard.js # Reads test-results/results.json → writes dashboard.html
├── playwright.config.ts
└── .github/workflows/
    └── playwright.yml        # CI: push/PR to main|dev + weekday schedule 16:00 ICT
```

## npm Scripts

| Command | Description |
|---|---|
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run with visible browser |
| `npm run test:register` | Register spec only |
| `npm run test:verify` | KYC verify spec only |
| `npm run dashboard` | Generate dashboard.html from latest results |
| `npm run test:dashboard` | Run all tests then generate dashboard |
| `npm run test:report` | Open Playwright HTML report |
| `npm run install:browsers` | Install Firefox |

## Test Cases

| Test | User | Flow | Expected Result |
|---|---|---|---|
| KYC | userA | Login → OTP | success status |
| KYC | userB | Login (no OTP) | not found status |
| KYC | userC | Login → OTP | waiting status |
| KYC | userE | Login → OTP → Consent → VerifyIdentity → Photo → PersonalInfo → Address | waiting status |
| Register | userD | Login → OTP → Consent → PersonalInfo → Photo → Address → PIN | waiting status |

## User Fixture Convention

Tests select their user via `@user <key>` in the test title:

```ts
test("@user userD Register → waiting status", async ({ page, user }) => { ... })
```

`user.phone` / `user.idcard` are injected automatically from `utils/users.json`.
If `phone` or `idcard` is `"random"`, it generates a valid Thai value on the fly.

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `BASE_URL` | `.env` / GitHub Secret | Target app URL (e.g. `https://bewallet-uat.example.com`) |
| `USERS_JSON` | GitHub Secret | Full content of `utils/users.json` (single-line JSON) |

## CI/CD (GitHub Actions)

**File**: `.github/workflows/playwright.yml`

**Triggers**:
- Push / PR → `main` or `dev`
- Weekday schedule: every Mon–Fri at **16:00 ICT** (09:00 UTC)
- Manual (`workflow_dispatch`)

**Key steps**:
1. `npm ci`
2. `npx playwright install firefox --with-deps`
3. Write `utils/users.json` from `secrets.USERS_JSON`
4. `npm run test:register`
5. Generate dashboard, upload artifacts (14-day retention)
6. Write pass/fail summary to GitHub Step Summary

**Artifacts per run**:
- `playwright-report-{N}` — HTML report with screenshots
- `test-results-{N}` — JSON results + traces + failure screenshots
- `dashboard-{N}` — dashboard.html

## Playwright Config Notes

- `timeout`: 120s per test, 15s per assertion
- `retries`: 2 on CI, 0 locally
- `workers`: 1 on CI (sequential), auto locally
- `screenshot`: only on failure
- `trace`: on first retry
- `fullyParallel`: true (overridden to 1 worker on CI)
- `forbidOnly`: true on CI (blocks accidental `test.only` commits)
