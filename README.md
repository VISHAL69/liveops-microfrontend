# LiveOps

A frontend operations dashboard for monitoring products, inventory and orders —
# LiveOps

A frontend operations dashboard for monitoring products, inventory, and orders,
built with Angular 22, Nx, Native Federation, PrimeNG, Signals, and RxJS.

LiveOps demonstrates a domain-based Micro Frontend architecture with independent
Dashboard, Inventory, and Orders applications sharing a common Shell.

---

## 1. Project overview

LiveOps has three functional areas, each its own deployable Micro Frontend (MFE):

| Area | Route | What it shows |
|---|---|---|
| **Dashboard** | `/dashboard` | KPIs (products, low/out-of-stock, orders, inventory value), a category breakdown chart, low-stock alerts, recent orders |
| **Inventory** | `/inventory` | Searchable, filterable, sortable, paginated product table with a details dialog and an **"Add to Order"** button per product |
| **Orders** | `/orders` | The live order built up from Inventory's "Add to Order" clicks, plus a historical "Order History" table (DummyJSON carts) |

A **Shell** application hosts navigation and lazily loads each MFE at runtime.

### The core cross-MFE flow

```
Inventory MFE
      ↓
Display Products
      ↓
User clicks "Add to Order"
      ↓
Product is added to the shared OrdersStore
      ↓
User navigates to Orders MFE
      ↓
Orders MFE displays the added products, with quantity incrementing
on repeat clicks of the same product
```

---

## 2. Architecture

```
                ┌─────────────┐
                │   Shell     │
                │    Host     │
                └──────┬──────┘
                       │
              Native Federation
            (esbuild + import maps)
                       │
      ┌────────────────┼────────────────┐
      │                │                │
      ▼                ▼                ▼
 Dashboard         Inventory          Orders
    MFE               MFE               MFE
      │                │                │
      └────────────────┼────────────────┘
                       │
                Nx Workspace
                       │
        ┌──────────────┼──────────────┐
        ▼               ▼              ▼
   products/        inventory/      orders/
  (own domain)      (own domain)   (own domain)
        │               │              │
        └───────────────┼──────────────┘
                       │
                 shared/ (generic only:
                 ui, utils)
                       │
                       ▼
                   DummyJSON
```

Each MFE is an independent Angular application that can be served and built on
its own. The Shell discovers them at runtime through a
`federation.manifest.json` and lazy-loads each one's exposed root component
behind a route.

---

## 3. Technology stack

- **Angular 22** (standalone components, Signals, modern control flow, zoneless change detection)
- **Nx 23** monorepo
- **Native Federation** (`@angular-architects/native-federation`) for the Micro Frontend architecture
- **TypeScript** (strict mode, no implicit `any` in the domain layer)
- **RxJS** for HTTP/async workflows
- **PrimeNG 22** + **PrimeIcons** + `@primeuix/themes` (Aura preset) as the UI library
- **Chart.js** (via `p-chart`) for the category breakdown visualization
- **DummyJSON** as the REST data source (products, carts, users)
- **Jest** for unit tests, **Playwright** for a manual end-to-end verification pass (see §14)

---

## 4. Angular 22 features used

- Standalone components everywhere — no `NgModule`s anywhere in the app or feature layer
- **Signals**: `signal()`, `computed()` for all local/derived UI state (loading, filters, KPI values, dashboard metrics, the shared order)
- **Zoneless change detection** (`provideZonelessChangeDetection()`) — no `zone.js` in the run-time path
- Modern control flow (`@if`, `@else if`, `@for … track`, no `*ngIf`/`*ngFor`)
- `inject()` for dependency injection instead of constructor injection
- `provideRouter()`, `provideHttpClient()`, `provideAnimationsAsync()` — fully provider-based bootstrapping, no `app.module.ts`
- `takeUntilDestroyed()` for automatic RxJS subscription cleanup
- `ChangeDetectionStrategy.OnPush` on every component
- Strongly typed API layer — no `any` in the products/orders domain models or services

---

## 5. Nx monorepo structure (domain-based)

```
liveops/
├── apps/
│   ├── shell/            → host application (navigation, layout, routing)
│   ├── dashboard/        → Dashboard MFE
│   ├── inventory/        → Inventory MFE (thin shell around libs/inventory/ui)
│   └── orders/           → Orders MFE (current order panel + order history)
│
├── libs/
│   ├── products/
│   │   ├── interfaces/      → Product model, stock-status derivation
│   │   ├── data-access/     → ProductsApiService (typed HTTP calls to DummyJSON)
│   │   └── ui/               → StockStatusTag (product-specific, not generic)
│   │
│   ├── inventory/
│   │   ├── data-access/     → RecentlyViewedStore (inventory-specific Signals state)
│   │   └── ui/
│   │       ├── products/         → InventoryProducts - the whole feature:
│   │       │                        search, filters, sortable/paginated table,
│   │       │                        "Add to Order", opens product-details
│   │       └── product-details/  → InventoryProductDetails - read-only dialog
│   │
│   ├── orders/
│   │   ├── interfaces/      → Cart/Order (history) models + OrderItem (live cart)
│   │   ├── data-access/     → OrdersApiService (carts+users) + OrdersStore
│   │   │                       (the shared "Add to Order" cart - see §9)
│   │   └── ui/               → CurrentOrder - renders the live OrdersStore
│   │
│   └── shared/
│       ├── ui/               → kpi-card, page-header, loading-state, empty-state
│       │                        (genuinely generic - nothing product/order-specific)
│       └── utils/             → formatters + dashboard metric calculations
```

**What changed from a "shared-first" layout:** `Product`, `ProductsApiService`,
and product-specific UI (`StockStatusTag`) live in `libs/products/`, not
`libs/shared/`. Inventory's product listing/detail UI and its
`RecentlyViewedStore` live in `libs/inventory/`, not scattered across app
code. `OrdersStore` and order-specific UI live in `libs/orders/`.
`libs/shared/` only holds `kpi-card`, `page-header`, `loading-state`,
`empty-state`, and generic formatting/metric utilities - nothing here knows
what a "product" or an "order" is. `libs/shared/interfaces` isn't created
yet since there's no genuinely domain-agnostic interface to put there;
adding an empty folder for the sake of matching a template wasn't worth it.

---

## 6. Micro Frontend architecture

**Native Federation**, not classic Webpack Module Federation, is what powers
the Shell/remote relationship — see §12 for why.

- **Shell** (`apps/shell`) is a *dynamic host*: it reads `federation.manifest.json`
  at runtime to discover where each remote's `remoteEntry.json` is served from.
- **Dashboard / Inventory / Orders** are each configured as a *remote*, exposing
  a single module (their root component):

  ```ts
  // apps/inventory/federation.config.mjs
  exposes: {
    './Component': './apps/inventory/src/app/app.ts',
  }
  ```

- The Shell's routes lazily import that exposed component:

  ```ts
  {
    path: 'inventory',
    loadComponent: () =>
      loadRemoteModule('inventory', './Component').then((m) => m.App),
  }
  ```

- `@angular/core`, `@angular/common`, `rxjs` and `primeng` are shared as
  singletons across the Shell and all three remotes via `shareAll()`, so
  there's exactly one copy of Angular and PrimeNG loaded in the browser
  regardless of how many MFEs are active. **Workspace libraries
  (`@liveops/*`) are not covered by this** - see §9 for why that matters and
  how `OrdersStore` handles it.
- Each MFE can also be served completely standalone (e.g. `nx serve dashboard`
  on its own, browsed directly) for isolated development — its own
  `app.config.ts` supplies HttpClient/PrimeNG/router providers for that case.

---

## 7. Domain ownership

- **`libs/products`** — everything about a Product as a concept: the model,
  stock-status derivation, the API service, and product-specific UI
  (`StockStatusTag`). Both Dashboard and Inventory depend on this; neither
  owns it.
- **`libs/inventory`** — everything about *browsing and acting on* products
  from an operations standpoint: the listing/detail UI, and
  `RecentlyViewedStore`. This is where "Add to Order" is triggered from.
- **`libs/orders`** — everything about an order: the historical
  Cart/Order model, the live `OrderItem`/`OrdersStore` cart, the API
  service, and order-specific UI (`CurrentOrder`).
- **`libs/shared`** — only components/utilities with zero business meaning:
  a KPI card, a page header, loading/empty states, currency formatting.
  Nothing here is moved out of convenience; each item was checked against
  "would this make sense in a completely unrelated app" before landing here.

---

## 8. API used

All data comes from `https://dummyjson.com`:

- `GET /products`, `/products/:id`, `/products/search?q=`, `/products/category/:category`, `/products/categories`
- `GET /carts`, `/carts/:id` (used as historical "orders" in Order History)
- `GET /users`, `/users/:id` (used to resolve a cart's customer name)

No custom backend, database, or auth server was created, per the assignment's
scope constraints. The live "Add to Order" cart (`OrdersStore`) is pure
client-side state - it isn't persisted to DummyJSON, which has no endpoint
for creating orders.

---

## 9. Sharing order state across independently-built MFEs

This is the trickiest part of the assignment, so it's worth explaining in
full: **`OrdersStore` (`libs/orders/data-access`) is not a simple
`providedIn: 'root'` singleton relying on Angular DI alone.**

Native Federation's `shareAll()` dedupes dependencies listed in
`package.json` (real npm packages: Angular, RxJS, PrimeNG). It has no
knowledge of `@liveops/orders-data-access` - that's a TS path-mapped
workspace library, not an npm package, so each remote that imports it (both
Inventory and Orders) compiles its **own separate copy** of the
`OrdersStore` class into its own bundle. If `OrdersStore` relied purely on
`providedIn: 'root'`, Inventory and Orders would each get their own
independent store instance, and "Add to Order" would silently do nothing
useful - exactly the kind of bug this assignment's acceptance criteria would
catch.

What genuinely is shared across independently-built federated bundles
running in the same browser tab is `globalThis` - the same JS global object
no matter how many copies of a class get bundled. So `OrdersStore` keeps its
actual data (`items: OrderItem[]`) on a small object at
`globalThis.__liveopsOrdersBus__`, and every `OrdersStore` instance (one per
remote) reads/writes that same object and notifies every other instance via
a shared listener set. Each instance still exposes normal Angular Signals
(`items`, `itemCount`, `total`), so nothing about how components consume
this service changes - `addProduct()`/`removeProduct()` read like ordinary
Signal-store methods from the outside.

This was verified two ways:
- A unit test (`orders.store.spec.ts`) explicitly creates **two separate
  `OrdersStore` instances** (simulating two remotes) and asserts that
  writes on one are visible on the other.
- A full Playwright run against the actual built Shell + federated
  Inventory/Orders bundles (not just Jest), clicking "Add to Order" twice on
  a real rendered product row in Inventory, then navigating to Orders and
  reading the rendered quantity back out of the DOM.

---

## 10. Signals vs. RxJS — division of responsibility

- **RxJS** owns *asynchronous workflows*: the initial HTTP calls to DummyJSON
  (`forkJoin` for parallel product/cart fetches), and the debounced inventory
  search (`Subject` → `debounceTime(300)` → `distinctUntilChanged()`).
- **Signals** own *synchronous, derived UI state*: loading/error flags, search
  term, selected filters, every dashboard KPI, and the shared order itself
  (`OrdersStore.items`/`itemCount`/`total` are all Signals).
- The two meet at exactly one point per screen: an RxJS subscription's `next`
  callback calls `.set()` on a signal, or (for orders) `OrdersStore`'s public
  methods mutate its internal bus and notify listeners. From there,
  everything downstream (`computed()` chains, templates) is signal-driven.

---

## 11. Running the application

Each MFE must be served on its assigned port so the Shell's
`federation.manifest.json` can find it:

```bash
npm install

# in four separate terminals
npx nx serve dashboard   # http://localhost:4201
npx nx serve inventory   # http://localhost:4202
npx nx serve orders      # http://localhost:4203
npx nx serve shell       # http://localhost:4200  ← open this one
```

Or run them all in parallel with one command:

```bash
npx nx run-many -t serve -p shell dashboard inventory orders --parallel=4
```

To try the core flow: open the Shell, go to Inventory, click "Add to Order"
on any product (try it twice on the same one), then go to Orders and check
the quantity.

## 12. Building the application

```bash
npx nx run-many -t build -p shell dashboard inventory orders
```

Production builds, `npx nx run-many -t lint`, and `npx nx run-many -t test`
all pass across all 15 projects (4 apps + 11 libs) as of this revision.

---

## 13. Notable architectural decisions

- **Native Federation instead of `@nx/angular` Module Federation.** As of
  Nx 23, `@nx/angular:host`/`:remote` are deprecated in favor of
  `@angular-architects/native-federation`, which uses esbuild + import maps
  instead of Webpack.
- **Zoneless by default**, via `provideZonelessChangeDetection()` in every
  app.
- **`@primeuix/themes` instead of `@primeng/themes`** (the latter is
  deprecated upstream).
- **`OrdersStore` uses a `globalThis` bus, not bare `providedIn: 'root'`.**
  See §9 - this is the one place the implementation looks unusual, and it's
  unusual for a specific, verified reason, not out of caution.
- **DummyJSON carts as "Order History."** DummyJSON has no real order
  concept, and no status field on carts, so history-table status is derived
  deterministically from the cart id (`deriveOrderStatus`) purely so the UI
  has something stable to show/filter - documented in code so it's not
  mistaken for real backend data. The **live** order (`OrdersStore`) is
  separate from this and is what "Add to Order" actually populates.
- **Product details via Dialog, not a route** — simpler, keeps Inventory's
  MFE a single exposed component.
- **No NgRx** — the app's state is either local component Signals or the one
  small cross-MFE store described in §9.

---

## 14. Bugs found and fixed while verifying the flow end-to-end

Getting to a genuinely working "Add to Order" flow surfaced two real,
non-obvious upstream issues that unit tests alone would not have caught -
worth recording here in case they resurface after a future PrimeNG upgrade:

1. **PrimeNG 22's `p-table`/`p-toolbar` no longer support the legacy
   `<ng-template pTemplate="header">` / `pTemplate="body"` / `pTemplate="start"`
   / `pTemplate="end"` convention.** These components were refactored to use
   `contentChild('header', ...)` / `contentChild('body', ...)` etc., which
   query by **template reference variable** (`<ng-template #header>`,
   `<ng-template #body let-product>`), not the old string-attribute
   directive. Using the old syntax compiles cleanly and produces no runtime
   error - the table just silently renders zero rows and the toolbar's
   projected content silently disappears. Fixed by switching every table
   and toolbar template in the app to `#header`/`#body`/`#start`/`#end`.
2. **PrimeNG 22's `[pButton]` directive no longer has `label`/`icon`
   inputs.** Using `<button pButton label="..." icon="...">` compiles
   cleanly but silently renders an empty button (no visible text or icon).
   The `label`/`icon` inputs now only exist on the `<p-button>` **component**.
   Fixed by switching every button in the app from the `pButton` directive
   to the `<p-button>` component.

Both were found by writing an actual Playwright test that serves the real
built bundles and drives a real Chromium browser through the Inventory →
Add to Order → Orders flow, rather than trusting that "it compiles and unit
tests pass" was sufficient for a cross-component, cross-MFE UI flow. Neither
issue produced a console error, a failed build, or a failed unit test - both
were silent, and are the kind of gap that specifically justifies an
end-to-end pass on top of unit tests for UI-heavy flows like this one.

## 15. Testing

- **Unit tests** (Jest) cover the pure business logic: `getStockStatus`
  thresholds, `calculateInventoryValue`/`countLowStock`/`countOutOfStock`/
  `groupByCategory`, and `OrdersStore` (including the two-instance
  cross-remote sync scenario from §9). One smoke test per application shell.
- **Manual end-to-end verification** (Playwright, not checked into the repo
  as an automated suite given the assignment's time constraints): served all
  four built apps on their real ports, mocked the three DummyJSON endpoints
  at the network layer, and drove a real browser through Shell → Inventory →
  Add to Order (×2) → Orders, asserting the rendered quantity in the DOM.
  This is what caught both issues in §14.

## 16. Trade-offs and known limitations

- Dashboard, Inventory, and Orders each fetch the *full* DummyJSON product/cart
  collections (`limit=0`) rather than paginating server-side, since DummyJSON's
  dataset is small. A larger catalog would need server-side pagination/search.
- Order History status is synthetic (derived from cart id), clearly
  documented as such in code.
- The live order (`OrdersStore`) is in-memory only - it resets on a full
  page reload of the Shell, since it isn't persisted anywhere. Persisting it
  (e.g. `localStorage`, synced the same way as the `globalThis` bus) would
  be a natural next step if that mattered for the demo.
- No authentication, real-time updates, or e2e test suite committed to the
  repo, per the original scope constraints.
