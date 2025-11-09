import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { RoleGuard } from '../../core/Auth/role.guard';
import { CategoriesListComponent } from './pages/Categories/categories-list/categories-list.component';
import { CategoryTypesComponent } from './pages/Categories/category-types/category-types.component';
import { StructureListComponent } from './pages/Structure/structure-list/structure-list.component';
import { PartListComponent } from './pages/Parts/part-list/part-list.component';
import { PartOptionListComponent } from './pages/part-option-list/part-option-list.component';
import { ServiceListComponent } from './pages/Service/service-list/service-list.component';
import { CreateServiceComponent } from './pages/Service/create-service/create-service.component';
import { FeeListComponent } from './pages/Service/fee-list/fee-list.component';
import { CreateFeeComponent } from './pages/Service/create-fee/create-fee.component';
import { AdminServiceRequestComponent } from './pages/Service_Requests/admin-service-request/admin-service-request.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard', component: DashboardComponent, children: [
      {path: 'manage-users', component: ManageUsersComponent},
      {path: 'Categories', component: CategoriesListComponent },
      {path: 'CategoryTypes', component: CategoryTypesComponent },
      {path: 'Structures', component: StructureListComponent },
      {path: 'Parts', component: PartListComponent },
      {path: 'PartOptions', component: PartOptionListComponent },
      {path: 'Services', component: ServiceListComponent },
      {path: 'createservice', component: CreateServiceComponent },
      { path: 'Fee', component: FeeListComponent },
      { path: 'createFee', component: CreateFeeComponent },
      { path: 'ServiceRequests', component: AdminServiceRequestComponent },

  ]}
];


@NgModule({
  imports: [RouterModule.forChild(routes)],   // ✅ forChild only
  exports: [RouterModule]
})
export class AdminRoutingModule {}
