import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { UserServiceRequestsComponent } from './user-service-requests/user-service-requests.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserServiceQouteRequestsComponent } from './user-service-qoute-requests/user-service-qoute-requests.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: UserServiceRequestsComponent },
      { path: 'profile', component: UserProfileComponent },
      { path: 'orders', component: UserServiceQouteRequestsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDashboardRoutingModule {}
