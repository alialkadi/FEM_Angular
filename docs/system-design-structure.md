# System Design Structure

This document describes the structure of the current Angular application so a new project can follow the same architectural pattern without copying any existing files.

## Project Type

- Angular 17 single-page application.
- Angular SSR is configured through `server.ts`, `main.server.ts`, and `app.module.server.ts`.
- Routing is module-based and uses lazy-loaded feature modules.
- UI dependencies include Angular Material, Bootstrap, icon libraries, charting, PDF/canvas utilities, Leaflet, and QR code tooling.

## High-Level Source Layout

```text
src/
  app/
    core/
    features/
    layouts/
    shared/
    app-routing.module.ts
    app.module.ts
    app.module.server.ts
    app.component.*
    environment.prod.ts
  assets/
  fe-global.scss
  styles.scss
  index.html
  main.ts
  main.server.ts
```

## Main Application Shell

`src/app/app.module.ts` is the root Angular module. It wires together:

- `BrowserModule` and hydration for SSR.
- `AppRoutingModule`.
- `CoreModule`.
- `SharedModule`.
- `LayoutsModule`.
- `FormsModule`, `ReactiveFormsModule`, and `HttpClientModule`.
- Common Angular Material modules.
- Global HTTP interceptors.

`src/app/app-routing.module.ts` defines the application entry points and assigns each major route group to a layout component.

## Routing Model

The app uses layout routes at the top level and feature routing inside each area.

```text
/
  redirects to public area

/FenetrationMaintainence
  PublicLayoutComponent
  lazy-loads features/Public/PublicModule

/admin
  AdminLayoutComponent
  RoleGuard with Admin role
  lazy-loads features/admin/AdminModule

/user
  UserLayoutComponent
  RoleGuard with user role
  lazy-loads features/user-dashboard/UserDashboardModule

/technician
  TechniciaLayoutComponent
  RoleGuard with Worker role
  lazy-loads features/technician-dashboard/TechnicianDashboardModule

/s/:slug
  public advertised-detail style route
```

Each feature module then uses `RouterModule.forChild(routes)` for its own pages and dashboard child routes.

## Core Layer

Location: `src/app/core`

Purpose: application-wide infrastructure and singleton logic.

```text
core/
  core.module.ts
  Auth/
    auth.service.ts
    auth.guard.ts
    role.guard.ts
    auth.interceptor.ts
  Models/
    auth.models.ts
  Pipes/
    groupByPipe.ts
  reset-password/
    forgetr-password/
    otp/
    reset-password/
```

Responsibilities:

- Authentication token storage and decoding.
- Role lookup from JWT claims.
- Login state checks.
- Route guards for authenticated and role-based access.
- HTTP authentication behavior.
- Cross-feature auth models.
- Reset-password flow components.
- Global pipes.

## Layout Layer

Location: `src/app/layouts`

Purpose: page shells that wrap route areas.

```text
layouts/
  layouts.module.ts
  admin-layout/
  public-layout/
  user-layout/
  technicia-layout/
```

Responsibilities:

- Provide top-level page structure for each route group.
- Host `router-outlet` for feature modules.
- Keep navigation/chrome separate from page feature logic.
- Allow public, admin, user, and technician areas to have different shells.

## Shared Layer

Location: `src/app/shared`

Purpose: reusable UI and generic helpers used by multiple feature areas.

```text
shared/
  shared.module.ts
  ui/
    spinner/
    page-header/
  Dialogs/
    confirm-dialog/
    edit-category-dialog/
    edit-cateogy-type/
    edit-fee-dialog/
    edit-part-dialog/
    edit-part-option-dialog/
    edit-structure-dialog/
  Services/
    toast.service.ts
```

Responsibilities:

- Shared visual components.
- Reusable dialog components.
- Shared Angular Material exports.
- Generic UI services.
- Common module imports such as `CommonModule`.

Shared should stay domain-light. Feature-specific screens and API logic belong in `features`.

## Feature Layer

Location: `src/app/features`

Purpose: domain and role-based application areas.

```text
features/
  Models/
  login/
  Public/
  admin/
  user-dashboard/
  technician-dashboard/
```

### Shared Feature Models

Location: `src/app/features/Models`

Contains DTOs and response models used by more than one feature area, including generic API response wrappers and domain models.

### Login Feature

Location: `src/app/features/login`

Contains the login component and login request/response models.

### Public Feature

Location: `src/app/features/Public`

```text
Public/
  public.module.ts
  public-routing.module.ts
  Interceptors/
  Models/
  Services/
  pages/
    Home/
    Wishlist/
    landing-page/
    service-advertised-detail/
    service-explorer/
    service-explorer-option-a/
    service-explorer-option-b/
    service-explorer-option-c/
    service-request-review/
    service-user-form/
    StaticFiles/
```

Responsibilities:

- Public website pages.
- Landing page sections.
- Public service discovery and request flow.
- Wishlist.
- Static informational pages.
- Public-facing services such as SEO, maps, wishlist, advertising, and consultation APIs.

### Admin Feature

Location: `src/app/features/admin`

```text
admin/
  admin.module.ts
  admin-routing.module.ts
  Services/
  pages/
    dashboard/
    app-setting/
    Categories/
    consultation/
    Customers/
    input-definition/
    input-value/
    manage-users/
    Metadata/
    Metadata-values/
    Parts/
    part-option-list/
    Service/
    Service_Requests/
    statics/
    Structure/
    workers/
```

Responsibilities:

- Admin dashboard.
- CRUD screens for domain entities.
- Customer, worker, category, structure, part, service, fee, metadata, and request management.
- Admin-only API services.

### User Dashboard Feature

Location: `src/app/features/user-dashboard`

```text
user-dashboard/
  user-dashboard.module.ts
  user-dashboard-routing.module.ts
  Services/
  Models/
  dashboard/
  user-profile/
  user-service-requests/
  user-service-qoute-requests/
```

Responsibilities:

- User dashboard shell and navigation.
- User profile.
- User service requests.
- User quote/order views.
- User-specific API services and models.

### Technician Dashboard Feature

Location: `src/app/features/technician-dashboard`

```text
technician-dashboard/
  technician-dashboard.module.ts
  technician-dashboard-routing.module.ts
  Services/
  Models/
  dashboard/
  technician-requests/
```

Responsibilities:

- Technician dashboard shell and navigation.
- Assigned request list.
- Technician-specific services and models.

## Component Pattern

Most components follow this folder pattern:

```text
feature-or-shared-area/
  component-name/
    component-name.component.ts
    component-name.component.html
    component-name.component.scss
    component-name.component.spec.ts
```

The TypeScript file owns behavior, the HTML file owns template markup, the SCSS file owns component-local styling, and the spec file owns unit tests.

## Service Pattern

Services are grouped by feature area:

```text
features/admin/Services/
features/Public/Services/
features/user-dashboard/Services/
features/technician-dashboard/Services/
core/Auth/
shared/Services/
```

Typical service design:

- Injectable Angular service.
- Uses `HttpClient`.
- Reads base API URL from `environment.apiUrl`.
- Returns `Observable<ApiResponse<T>>` or typed `Observable<T>`.
- Keeps HTTP request construction in the service so components stay focused on UI state.
- Uses `HttpParams` for optional query filters.

## Data Model Pattern

Models are TypeScript interfaces/classes grouped close to the feature that owns them. Models shared across areas live in `features/Models` or `core/Models`.

Common model categories:

- request DTOs
- response DTOs
- list response wrappers
- enum-like metadata types
- user/auth token models
- feature-specific view models

## Styling Pattern

Global styles are split across:

- `src/styles.scss`
- `src/fe-global.scss`
- component-level `.scss` files

The app uses a mix of global design rules and local component styles. New projects should create fresh styles rather than reusing old CSS.

## Asset Pattern

Assets live under:

```text
src/assets/
  landing-page/
  documents/
```

Assets are product-specific and must not be reused in a new project unless they are independently licensed for that new project.

## Architecture Summary

The system is organized as a role-based Angular application:

- `app` bootstraps and routes the whole application.
- `core` provides infrastructure used everywhere.
- `layouts` provides route shells.
- `shared` provides reusable UI building blocks.
- `features` contains the real product areas and their modules.
- Each major area is lazy-loaded and owns its child routes.
- Services encapsulate API calls.
- Models keep API and UI data typed.
- Components are organized by feature/domain and kept in their own folders.

