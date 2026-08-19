# QA Lead Review Report — ShopTest Playwright Automation

**Project:** `main-test-code` / shop-test  
**Application under test:** https://shopteststore.netlify.app  
**Framework:** Playwright (`@playwright/test` ^1.61.1)  
**Review scope:** Full repository — specs, page objects, fixtures, auth setup, config, CI  
**Review date:** 2026-08-13  
**Reviewer perspective:** QA Lead (automation quality, test design, maintainability, security, CI readiness)

---

## 1. Executive Summary

The suite aims to cover guest browsing, multi-role auth storage, admin/seller product creation, and customer product/wishlist/cart flows using a Page Object Model (POM). The **intent is sound**, but the current implementation is **not production-ready**.

| Area | Rating | Notes |
|------|--------|-------|
| Test design / coverage | Weak | 3 specs; incomplete assertions; critical bugs |
| POM / maintainability | Weak | Duplication, typos, mixed module systems |
| Data & environment | Critical risk | Secrets committed; hardcoded URLs; stale auth |
| Stability / waits | Medium risk | Race-prone waits; hardcoded product names |
| CI / DX | Weak | No npm scripts; limited reporters; chromium only |
| Best practices | Needs remediations | See sections below |

**Top blockers before trusting CI results:**

1. Runtime bug in `tests/0001-TEST.spec.js` (use of undefined variable).
2. Auth tokens and credentials committed to git.
3. Incomplete / misleading guest and customer journeys.
4. Fragile locators and hard-coded product assumptions.

---

## 2. Inventory of Automated Test Cases

| Spec file | Intended scenario | Verdict |
|-----------|-------------------|---------|
| `tests/home-without-login.spec.js` | Guest home → products → cart gate → search → PDP → wishlist gate | **Partially valid — needs redesign** |
| `tests/0001-TEST.spec.js` | Admin creates product → customer verifies → add to cart | **Broken / does not make sense as written** |
| `tests/0002-test.spec.js` | Seller creates product → customer wishlist → move to cart | **Valid business flow — needs hardening** |
| `tests/auth.setup.js` | Persist storage state per role | **Valid pattern — needs reliability fixes** |

Unused (defined but never exercised in specs):

- `CartPage`, `CheckoutPage` fixtures/methods  
- Shipping data from `dataHelper.js`  
- Filter/sort helpers on `ProductPage`  
- Signup flows in `auth-pom/auth.js`

---

## 3. Test Case Deep Dive

### 3.1 `home-without-login.spec.js` — Guest / unauthenticated UX

**What QA tried to automate**

1. Open home and verify chrome (logo, nav, login, signup).  
2. Open Products and assert grid/cards.  
3. Attempt add-to-cart while logged out → expect login message.  
4. Search for a product, open PDP, verify details.  
5. Attempt wishlist while logged out → expect login page.

**Does it make sense?**  
Yes as a **guest restriction / smoke** suite. Guests should browse and be blocked from cart/wishlist. That is high-value for an e-commerce storefront.

**Problems**

| # | Issue | Reason | Solution |
|---|-------|--------|----------|
| 1 | One monolithic test does navigation + cart gate + search + PDP + wishlist | Failures are hard to triage; one flake fails the whole journey | Split into focused tests: `guest can view home`, `guest add-to-cart requires login`, `guest can search and open PDP`, `guest wishlist requires login` |
| 2 | Method `clickOnCartNav()` does **not** click cart nav — it clicks product-card add-to-cart | Misleading names hide intent and break reviews | Rename to `attemptAddToCartFromListing()`; keep a real `clickCartNav()` if needed |
| 3 | `searchProducts('Mechanical Keyboard RGB', 'Electronics')` but POM accepts only `query` | Second argument is silently ignored; category filter never tested | Either extend POM to accept category or remove the unused arg; assert filtered results |
| 4 | Hard dependency on product **"Mechanical Keyboard RGB"** | Seed data change / env difference → false failures | Use `data-testid` + first visible product, or API seed a known fixture product |
| 5 | PDP image locator hardcodes alt text `Mechanical Keyboard RGB` | Couples assertion to one SKU | Assert `product-title` / `product-price` / `product-add-to-cart` only, or pass expected alt |
| 6 | Title `"Verify Home Page"` understates scope | Reporting and ownership unclear | Rename to reflect guest journey / auth gates |
| 7 | No assertion that URL/query updated after search | Search success is unproven | Assert URL/query or that result cards match search term |

**Enhancement recommendation**

Treat this as **negative-path / gate testing** for guests:

```text
Given I am not logged in
When I add a product to cart / wishlist
Then I am prompted to log in
And cart / wishlist are unchanged
```

Add positive guest checks separately (home loads, products list, PDP read-only).

---

### 3.2 `0001-TEST.spec.js` — Admin creates product → Customer verifies

**What QA tried to automate**

Cross-role E2E: Admin creates a dynamic product → Customer finds it → opens PDP → verifies details → adds to cart.

**Does it make sense?**  
Yes as a **business-critical happy path**. Admin publish → customer discoverability is a core acceptance flow.

**Problems (blocking)**

| # | Issue | Reason | Solution |
|---|-------|--------|----------|
| 1 | **Line 34 calls `customerDashboardPage.selectProductCategory(...)` before the object exists** (created ~line 47) | Spec will throw `ReferenceError` and never reach customer steps | Remove the premature call, or move category selection into the customer block after POM init |
| 2 | Customer auth uses `.auth/abc.json` while comment says Admin–ABC | Role under test is unclear; `abc` is not a first-class business role | Use `.auth/customer.json` for customer verification; delete or document `abc` as a scratch account only |
| 3 | Starts customer at `/wishlist` then navigates to products | Wishlist as entry point is unrelated to “verify new product” | `goto('/products')` (or baseURL + `/products`) before search |
| 4 | `clickAddToCartCUSTOMER()` with **no cart assertion** | Test claims cart behavior without proving it | After add: open cart, assert `cart-item-name` contains product name (reuse pattern from 0002) |
| 5 | Unused imports (`mainhome`, `expect`) and poor file name `0001-TEST.spec.js` | Noise; hard to discover in suite reports | Rename e.g. `admin-create-product-customer-verify.spec.js`; remove unused imports |
| 6 | No `test.describe` / tags (`@smoke`, `@e2e`, `@admin`) | Cannot filter CI or ownership | Wrap in `test.describe('Admin product publish', …)` + tags |
| 7 | No teardown / product cleanup | Dynamic products pollute shared Netlify env | Delete product via UI/API in `afterEach`, or use unique prefix + periodic cleanup job |

**Enhancement recommendation**

Keep the scenario, fix the bug, assert the full chain:

```text
Admin: create product (unique name) → visible in admin list
Customer: search → open PDP → assert name/price/description/category
Customer: add to cart → cart contains product
Optional: checkout smoke (currently CheckoutPage exists but unused)
```

Also align naming: variables should be `adminContext` / `customerContext` consistently (already mostly OK here except wrong storage file).

---

### 3.3 `0002-test.spec.js` — Seller creates product → Customer wishlist → cart

**What QA tried to automate**

Seller publishes product → Customer searches → PDP verify → wishlist → move wishlist item to cart → verify cart.

**Does it make sense?**  
**Yes — strongest scenario in the repo.** Covers seller publish + wishlist bridge + cart. This is worth keeping and promoting to smoke/regression.

**Problems**

| # | Issue | Reason | Solution |
|---|-------|--------|----------|
| 1 | Seller context variables named `adminContext` / `adminPage` / `adminProductPage` | Misleading; reviewers assume admin permissions | Rename to `sellerContext`, `sellerPage`, `sellerProductPage` |
| 2 | Seller navigates to `/admin/products` | May be correct for this app, but unclear vs seller-specific routes | Confirm app RBAC; if sellers use a different path, update goto; assert URL/role after load |
| 3 | Customer still lands on `/wishlist` before product search | Same noise as 0001 | Start on `/products` |
| 4 | File name `0002-test.spec.js` | Opaque numbering | Rename e.g. `seller-product-wishlist-to-cart.spec.js` |
| 5 | Unused imports (`mainhome`, `expect`) | Lint noise | Remove |
| 6 | Image assertion uses alt `new Product` while product name is `new Product ${timestamp}` | May pass loosely or fail depending on img alt implementation | Prefer `getByTestId` for image/container; avoid alt that truncates dynamically |
| 7 | No assertion on wishlist API failure paths / toast | Only happy path | Add optional negative test: wishlist when stock=0 / inactive product |
| 8 | Commented-out add-to-cart from PDP | Dead code confuses intent | Delete comment block or implement as alternate path test |

**Enhancement recommendation**

Split into two tests (shared product setup fixture):

1. Seller can create and see product in management list.  
2. Customer can wishlist → move to cart → see cart line item.

Or keep one E2E but add `test.step()` for reporting clarity.

---

### 3.4 `auth.setup.js` — Storage state bootstrap

**What QA tried to automate**

Log in once per role (admin, customer, seller, abc) and save Playwright `storageState` under `.auth/`.

**Does it make sense?**  
Yes — recommended Playwright pattern for authenticated projects.

**Problems**

| # | Issue | Reason | Solution |
|---|-------|--------|----------|
| 1 | Skips login if auth file already exists | Stale/expired JWTs stay forever → flaky authenticated tests | Always refresh on CI; locally invalidate when `exp` passed, or use `--project=setup` forced regenerate |
| 2 | Committed `.auth/*.json` with live JWTs | Security risk; tokens expire (`exp` in payload) | Gitignore `.auth/`; generate in setup; never commit |
| 3 | Role `abc` has no clear product meaning | Extra login cost and confusion | Remove unless required by a documented persona |
| 4 | Relies on `waitForTimeout(1000)` | Arbitrary sleep is flaky and slow | Prefer waiting on logout control / localStorage key (already partially done) |
| 5 | Duplicate / outdated `config.js` also implements auth setup with different credentials | Two sources of truth | Delete or archive `config.js`; keep a single setup entrypoint |
| 6 | `WEB_URL` in `.env` is empty; URLs hardcoded | Env switching (staging/prod) impossible | Set `baseURL` from `process.env.WEB_URL` in `playwright.config.js` |

---

## 4. Page Object & Code Structure Review

### 4.1 Duplication and naming

| Finding | Reason | Solution |
|---------|--------|----------|
| Three login implementations: `pages/login.js`, `pages/e2e/LoginPage.js`, `pages/auth-pom/auth.js` | Drift and inconsistent behavior | Consolidate to one `LoginPage`; auth setup imports that only |
| `homepage.js` and `custmare.js` duplicate large locator/method sets | Changes must be made twice; bugs diverge (e.g. wishlist wait only in customer POM) | Extract shared `StorefrontPage` / `ProductDetailPage`; role-specific classes extend it |
| Filename / class typos: `custmare.js`, `costomerPage`, `mainhome` | Hurts onboarding and searchability | Rename to `CustomerPage.js` / `HomePage.js` with proper PascalCase exports |
| `credentials.js` is empty | Dead placeholder | Implement env-backed credentials helper or remove |

### 4.2 Module system inconsistency

| Finding | Reason | Solution |
|---------|--------|----------|
| `package.json` has `"type": "commonjs"` while `playwright.config.js` and several pages use `import`/`export` | Fragile resolution; tooling confusion | Standardize on ESM (`"type": "module"`) **or** pure CJS; align all files |
| Fixtures mix `require` (`home-Fixture.js`) and `import` (`testFixtures.js`) | Same as above | One style across fixtures |

### 4.3 Locator strategy

**Good practices already present**

- Frequent use of `getByTestId(...)` (nav, product form, cart, wishlist).  
- Dynamic product data via `generateDynamicProductData()`.

**Gaps**

| Finding | Reason | Solution |
|---------|--------|----------|
| CSS class locators in `CartPage` (`.cart-item`, `.item-name`) while customer POM uses `cart-item-name` test ids | Inconsistent robustness | Align CartPage to `getByTestId('cart-item-name')` etc. |
| Broad text locators (`Charlie Customer`, emoji logo `🛒 ShopTest`) | Brittle to copy/branding changes | Prefer test ids for reviews section and logo |
| Compound CSS OR locators for username (`input[id="username"], input[type="email"], ...`) | Ambiguous; may fill wrong field | Single stable `data-testid="login-email"` (coordinate with app) |

### 4.4 Fixture usage vs manual contexts

`testFixtures.js` exposes `loginPage`, `dashboardPage`, `productPage`, `cartPage`, `checkoutPage`, `testData`, but E2E specs mostly ignore them and open `browser.newContext({ storageState })` manually.

| Reason | Solution |
|--------|----------|
| Fixtures alone cannot easily express multi-role contexts in one test | Keep manual multi-context for cross-role E2E; for single-role tests, use Playwright **projects** with `storageState` per role so tests inject `page` already authenticated |
| `testData` fixture receives unused `page` | Make `testData` a plain fixture without page dependency |

### 4.5 Dead / incomplete code

- Large commented blocks in `auth.js`, `LoginPage` files.  
- `adminLogin()` in `pages/e2e/LoginPage.js` incomplete.  
- `CheckoutPage` / shipping data unused despite being wired in fixtures.

**Solution:** Either wire a checkout E2E (cart → shipping → place order → confirmation) or remove unused POMs until needed (YAGNI with a tracked backlog item).

---

## 5. Configuration, CI, and Tooling

### 5.1 `playwright.config.js`

| Finding | Reason | Solution |
|---------|--------|----------|
| `baseURL` commented out | Every `goto` hardcodes full URL | Enable `baseURL: process.env.WEB_URL` |
| Only Chromium enabled | Cross-browser regressions missed | Re-enable Firefox/WebKit on nightly; keep Chromium on PR |
| `trace: 'on-first-retry'` only | Local failures harder to debug | Consider `retain-on-failure` for CI artifacts |
| No `screenshot` / `video` on failure | Weak failure evidence | `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` |
| HTML reporter only | CI needs machine-readable output | Add `[['html'], ['list'], ['github']]` or JUnit |
| dotenv import commented in config; loaded only in setup | Inconsistent env loading | Load dotenv once in config |

### 5.2 `package.json`

| Finding | Reason | Solution |
|---------|--------|----------|
| Empty `"scripts": {}` | Developers/CI must remember raw `npx` commands | Add `test`, `test:headed`, `test:ui`, `test:report`, `auth:setup` |
| No lint/prettier/eslint | Style and unused imports accumulate | Add ESLint + `@typescript-eslint` or JS lint for Playwright |

### 5.3 GitHub Actions (`.github/workflows/playwright.yml`)

| Finding | Reason | Solution |
|---------|--------|----------|
| No env secrets for `WEB_URL` / credentials | Auth setup will fail or use committed secrets | Use GitHub Secrets; never bake passwords into repo |
| Runs on push/PR to main only | Feature branches may not get feedback if not targeting main | Keep PR trigger; ensure required checks |
| Uploads HTML report but no trace zip | Incomplete debugging package | Upload `test-results/` as well |
| No caching of browsers/npm beyond defaults | Slower CI | Optional: cache Playwright browsers |

### 5.4 `.gitignore`

| Finding | Reason | Solution |
|---------|--------|----------|
| Ignores `/playwright/.auth/` but project uses `.auth/` | Auth JSON still tracked | Ignore `.auth/` and `.env` (use `.env.example`) |

---

## 6. Security & Test Data (Critical)

| # | Finding | Reason | Solution |
|---|---------|--------|----------|
| 1 | `.env` committed with real-looking passwords | Credential leak; rotation burden | Remove from git history if exposed; use `.env.example` with placeholders; store secrets in CI vault |
| 2 | `.auth/*.json` committed with JWT access/refresh tokens | Token theft / session hijack risk | Delete from repo; gitignore; regenerate in setup |
| 3 | Hardcoded credentials in `testdata.js` and obsolete `config.js` | Duplicates secrets outside env | Read only from `process.env` |
| 4 | Shared public Netlify app as sole environment | Parallel runs conflict (products, carts) | Dedicated test tenant or API reset hooks between runs |

---

## 7. Automation Best Practices Checklist

| Practice | Current state | Action |
|----------|---------------|--------|
| Clear, intention-revealing test names | Fail | Rename specs and `test()` titles |
| Arrange–Act–Assert / `test.step` | Partial | Add steps and explicit asserts at each stage |
| Independent tests | Fail | Avoid shared mutable catalog without cleanup |
| Stable locators (`data-testid`) | Mostly good | Finish migration in CartPage / text locators |
| No hard waits | Partial | Remove `waitForTimeout` |
| Correct wait ordering (`waitForResponse` **before** action) | Risk in search helpers | Start waiting, then fill/press Enter |
| Secrets out of VCS | Fail | Immediate remediation |
| Role-based Playwright projects | Missing | Add `admin`, `customer`, `seller` projects with storageState |
| Idempotent / unique test data | Good start | Keep timestamps; add cleanup |
| Meaningful negative tests | Partial (guest gates) | Expand invalid login, out-of-stock, unauthorized admin URL |
| Documentation | Fail (`README.md` is `# shop-test`) | Document how to run, roles, env vars, tags |
| Coverage of checkout | Missing | Highest value next automation after fixing 0001/0002 |

---

## 8. Recommended Target Suite Structure

```text
tests/
  auth.setup.js
  guest/
    home.smoke.spec.js
    cart-requires-login.spec.js
    wishlist-requires-login.spec.js
  admin/
    create-product.spec.js
  seller/
    create-product.spec.js
  customer/
    search-and-pdp.spec.js
    wishlist-to-cart.spec.js
  e2e/
    admin-publish-customer-purchase.spec.js   # full path incl. checkout
pages/
  login.page.js
  home.page.js
  products.page.js
  product-detail.page.js
  wishlist.page.js
  cart.page.js
  checkout.page.js
  admin/products.page.js
fixtures/
  test.fixtures.js
```

Use Playwright projects:

```text
setup → chromium-guest
     → chromium-admin   (storageState: .auth/admin.json)
     → chromium-customer
     → chromium-seller
```

---

## 9. Priority Remediation Roadmap

### P0 — Fix before any green CI trust

1. Fix `ReferenceError` in `0001-TEST.spec.js`; use customer storage state; assert cart.  
2. Stop committing `.env` and `.auth/*.json`; rotate passwords/tokens if repo was public.  
3. Set `baseURL` + `WEB_URL`; remove duplicate hardcoded host strings gradually.  
4. Fix `.gitignore` for `.auth/` and `.env`.

### P1 — Stabilize and clarify

5. Rename specs/POMs; remove typos and unused imports.  
6. Split guest mega-test; fix `clickOnCartNav` naming and `searchProducts` signature.  
7. Rename seller variables in `0002`; start customer on `/products`.  
8. Always regenerate auth on CI; validate token `exp`.  
9. Add npm scripts and richer Playwright reporters/artifacts.

### P2 — Expand value

10. Implement checkout E2E using existing `CheckoutPage` + shipping data.  
11. Add negative auth tests (wrong password, forbidden admin as customer).  
12. Multi-browser nightly; PR stays Chromium.  
13. Product cleanup via API after create flows.  
14. Replace README with runbook for QA engineers.

---

## 10. Verdict on Each Automated Case (Quick Reference)

| Test case | Keep? | Sense? | Action |
|-----------|-------|--------|--------|
| Guest home / auth gates (`home-without-login`) | Yes | Yes, but over-scoped | Split + fix method contracts + remove hard-coded SKU |
| Admin → customer product (`0001-TEST`) | Yes | Yes business-wise; **implementation broken** | Repair bug, correct role file, complete cart asserts, rename |
| Seller → wishlist → cart (`0002-test`) | Yes | **Best current E2E** | Harden naming, entry URL, locators, cleanup |
| Auth setup | Yes | Yes | Refresh tokens, drop `abc` unless justified, single source of credentials |
| Checkout / filters / signup (code only) | N/A | Valuable if automated | Either automate or remove dead code from critical path |

---

## 11. Closing Notes for QA Leadership

Automation here shows the team understands **POM**, **storageState**, and **cross-role E2E**, which is the right direction for ShopTest. The gap is not strategy — it is **execution quality**: one broken primary E2E, secret leakage, duplicated page objects, and tests that stop short of asserting business outcomes.

Treat `0002` as the template for “good enough to keep,” fix `0001` to match it, redesign the guest spec into atomic checks, and lock down environment/secrets. After P0/P1, add checkout coverage — that closes the revenue-critical path the current suite never reaches.

---

*End of report.*
