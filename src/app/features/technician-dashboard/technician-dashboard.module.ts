import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TechnicianDashboardRoutingModule } from './technician-dashboard-routing.module';
import { DashboardNavComponent } from './dashboard/dashboard-nav/dashboard-nav.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../shared/shared.module';
import { TechnicianRequestsComponent } from './technician-requests/technician-requests.component';


@NgModule({
  declarations: [
    DashboardNavComponent,
    DashboardComponent,
    TechnicianRequestsComponent
  ],
  imports: [
    CommonModule,
    TechnicianDashboardRoutingModule,
    SharedModule,
        MatIcon,
        MatPaginatorModule,
        FormsModule,
        ReactiveFormsModule ,
        MatFormFieldModule
  ]
})
export class TechnicianDashboardModule { }
