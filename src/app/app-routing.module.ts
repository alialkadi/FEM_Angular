import { RoleGuard } from './core/Auth/role.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './features/login/login.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin',"user"] },
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
