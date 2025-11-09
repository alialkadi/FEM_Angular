import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { DashboradNavComponent } from './pages/dashboard/dashborad-nav/dashborad-nav.component';
import { MatIcon } from "@angular/material/icon";
import { CategoryTypesComponent } from './pages/Categories/category-types/category-types.component';
import { CommonModule } from '@angular/common';
import { CategoriesListComponent } from './pages/Categories/categories-list/categories-list.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StructureListComponent } from './pages/Structure/structure-list/structure-list.component';
import { PartListComponent } from './pages/Parts/part-list/part-list.component';
import { PartOptionListComponent } from './pages/part-option-list/part-option-list.component';
import { ServiceListComponent } from './pages/Service/service-list/service-list.component';
import { CreateServiceComponent } from './pages/Service/create-service/create-service.component';
import { FeeListComponent } from './pages/Service/fee-list/fee-list.component';
import { CreateFeeComponent } from './pages/Service/create-fee/create-fee.component';
import { AdminServiceRequestComponent } from './pages/Service_Requests/admin-service-request/admin-service-request.component';

@NgModule({
  declarations: [DashboardComponent, ManageUsersComponent, DashboradNavComponent, CategoryTypesComponent,CategoriesListComponent, StructureListComponent, PartListComponent, PartOptionListComponent, ServiceListComponent, CreateServiceComponent, FeeListComponent, CreateFeeComponent, AdminServiceRequestComponent],
  imports: [SharedModule, AdminRoutingModule, MatIcon,CommonModule ,MatPaginatorModule,FormsModule, ReactiveFormsModule ,CommonModule ]
})
export class AdminModule {}
