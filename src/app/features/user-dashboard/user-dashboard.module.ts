import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDashboardRoutingModule } from './user-dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { DashboardNavComponent } from './dashboard/dashboard-nav/dashboard-nav.component';
import { UserHeaderComponent } from './dashboard/user-header/user-header.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserServiceRequestsComponent } from './user-service-requests/user-service-requests.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserServiceQouteRequestsComponent } from './user-service-qoute-requests/user-service-qoute-requests.component';


@NgModule({
  declarations: [
    DashboardComponent,
    DashboardNavComponent,
    UserHeaderComponent,
    UserServiceRequestsComponent,
    UserProfileComponent,
    UserServiceQouteRequestsComponent,
  ],
  imports: [
    UserDashboardRoutingModule,
    SharedModule,
    MatIcon,CommonModule ,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule ,
    MatFormFieldModule
  ]
})
export class UserDashboardModule { }
