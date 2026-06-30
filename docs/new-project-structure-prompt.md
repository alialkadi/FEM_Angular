# Prompt: Create a New Angular Project With This Architecture

Use this prompt when asking an AI agent or developer to create a new Angular project that follows the same structure and architectural style as this project.

```text
Create a new Angular 17 project with server-side rendering support and a feature-based `src` architecture similar to the reference project, but do not copy, reuse, import, migrate, or include any files, assets, text content, business logic, images, PDFs, styles, components, models, services, names, routes, or code from the old project.

The new project must be built from scratch. Only follow the architectural pattern.

Technology requirements:
- Angular 17.
- Angular Router with lazy-loaded feature modules.
- Angular SSR setup with `main.server.ts` and `server.ts`.
- RxJS and HttpClient for API communication.
- Reactive Forms and template-driven Forms where useful.
- Angular Material modules for common UI controls.
- Optional Bootstrap/bootstrap-icons/fontawesome if the product needs them.

Required source structure:

src/
  app/
    app.component.*
    app.module.ts
    app-routing.module.ts
    app.module.server.ts
    environment.prod.ts
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
      reset-password/
        forget-password/
        otp/
        reset-password/
    layouts/
      layouts.module.ts
      public-layout/
      admin-layout/
      user-layout/
      technician-layout/
    shared/
      shared.module.ts
      ui/
        spinner/
        page-header/
      Dialogs/
        confirm-dialog/
        edit-entity-dialog/
      Services/
        toast.service.ts
    features/
      Models/
        api-response.model.ts
        shared domain DTO/model files
      login/
        login.component.*
        Models/
      Public/
        public.module.ts
        public-routing.module.ts
        Services/
        Models/
        Interceptors/
        pages/
          Home/
          landing-page/
          static-pages/
          product/service flow pages
      admin/
        admin.module.ts
        admin-routing.module.ts
        Services/
        pages/
          dashboard/
          users/
          settings/
          entities grouped by domain
      user-dashboard/
        user-dashboard.module.ts
        user-dashboard-routing.module.ts
        Services/
        Models/
        dashboard/
        profile/
        user-owned records/
      technician-dashboard/
        technician-dashboard.module.ts
        technician-dashboard-routing.module.ts
        Services/
        Models/
        dashboard/
        assigned-work/
  assets/
    project-specific assets only
  styles.scss
  fe-global.scss or equivalent global design stylesheet
  index.html
  main.ts
  main.server.ts

Architecture rules:
- Root `AppModule` imports `CoreModule`, `SharedModule`, `LayoutsModule`, `AppRoutingModule`, forms modules, HttpClientModule, and commonly used Material modules.
- Root `AppRoutingModule` defines top-level layout routes:
  - public routes use `PublicLayoutComponent` and lazy-load `PublicModule`.
  - admin routes use `AdminLayoutComponent`, are protected by `RoleGuard`, and lazy-load `AdminModule`.
  - user routes use `UserLayoutComponent`, are protected by `RoleGuard`, and lazy-load `UserDashboardModule`.
  - technician routes use `TechnicianLayoutComponent`, are protected by `RoleGuard`, and lazy-load `TechnicianDashboardModule`.
- Each feature module owns its routing file, pages, feature services, and feature models.
- Layout components are shells with router outlets and role-specific navigation areas.
- Shared module contains reusable UI components, dialogs, common Angular/Material exports, and generic services.
- Core module contains singleton infrastructure: auth, guards, interceptors, global pipes, reset-password flow, and application-level models.
- API services should be thin Angular services using `HttpClient`, `environment.apiUrl`, typed request/response models, and `Observable<T>`.
- Use a generic `ApiResponse<T>` model for backend responses.
- Keep page components grouped by feature/domain, not by file type.
- Keep each component in its own folder with `.ts`, `.html`, `.scss`, and `.spec.ts` where applicable.
- Use lazy loading for major areas and child routes for dashboard sections.
- Do not put feature-specific components inside `shared`.
- Do not duplicate old project names, content, copied CSS, images, PDFs, route paths, business terminology, or API endpoint paths. Replace all domain names with names appropriate to the new project.

Deliverables:
- A clean Angular project implementing this structure.
- Placeholder components and modules sufficient for navigation to work.
- Fresh styles and placeholder UI written specifically for the new project.
- No copied files or assets from the reference project.
- A short README explaining the module structure and how to run the app.
```

