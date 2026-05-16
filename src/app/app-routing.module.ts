import { PublicModule } from './features/Public/public.module';
import { RoleGuard } from './core/Auth/role.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/login/login.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { TechniciaLayoutComponent } from './layouts/technicia-layout/technicia-layout.component';
import { ServiceAdvertisedDetailComponent } from './features/Public/pages/service-advertised-detail/service-advertised-detail.component';
import { ForgetrPasswordComponent } from './core/reset-password/forgetr-password/forgetr-password.component';
import { OtpComponent } from './core/reset-password/otp/otp.component';
import { ResetPasswordComponent } from './core/reset-password/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/admin.module').then((m) => m.AdminModule),
      },
    ],
  },
  {
    path: 'FenetrationMaintainence',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/Public/public.module').then((m) => m.PublicModule),
      },
    ],
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    data: { roles: ['user'] },
    canActivate: [RoleGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/user-dashboard/user-dashboard.module').then(
            (m) => m.UserDashboardModule,
          ),
      },
    ],
  },
  {
    path: 'technician',
    component: TechniciaLayoutComponent,
    data: { roles: ['Worker'] },
    canActivate: [RoleGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/technician-dashboard/technician-dashboard.module').then(
            (m) => m.TechnicianDashboardModule,
          ),
      },
    ],
  },
  { path: 's/:slug', component: ServiceAdvertisedDetailComponent },
  { path: '', redirectTo: 'FenetrationMaintainence', pathMatch: 'full' },

  { path: '**', redirectTo: 'FenetrationMaintainence' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
