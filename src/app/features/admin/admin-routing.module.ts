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
import { AppSettingComponent } from './pages/app-setting/app-setting.component';
import { CreateWorkerComponent } from './pages/workers/create-worker/create-worker.component';
import { WorkersListComponent } from './pages/workers/workers-list/workers-list.component';
import { MetadataAttributeListComponent } from './pages/Metadata/metadata-attribute-list/metadata-attribute-list.component';
import { MetadataCreateAttributeComponent } from './pages/Metadata/metadata-create-attribute/metadata-create-attribute.component';
import { MetadataAssignValueComponent } from './pages/Metadata-values/metadata-assign-value/metadata-assign-value.component';
import { UpdateServiceComponent } from './pages/Service/update-service/update-service.component';
import { MetadataUpdateAttributeComponent } from './pages/Metadata/metadata-update-attribute/metadata-update-attribute.component';
import { InputDefinitionComponent } from './pages/input-definition/input-definition.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'manage-users', component: ManageUsersComponent },
      { path: 'Categories', component: CategoriesListComponent },
      { path: 'CategoryTypes', component: CategoryTypesComponent },
      { path: 'Structures', component: StructureListComponent },
      { path: 'Parts', component: PartListComponent },
      { path: 'PartOptions', component: PartOptionListComponent },
      { path: 'Services', component: ServiceListComponent },
      { path: 'createservice', component: CreateServiceComponent },
      { path: 'Fee', component: FeeListComponent },
      { path: 'createFee', component: CreateFeeComponent },
      { path: 'ServiceRequests', component: AdminServiceRequestComponent },
      { path: 'setting', component: AppSettingComponent },
      { path: 'create-worker', component: CreateWorkerComponent },
      { path: 'workers', component: WorkersListComponent },
      { path: 'metadata', component: MetadataAttributeListComponent },
      { path: 'input', component: InputDefinitionComponent },
      { path: 'createattribute', component: MetadataCreateAttributeComponent },
      {
        path: 'assignvalue/:attributeId',
        component: MetadataAssignValueComponent,
      },
      { path: 'editservice/:id', component: UpdateServiceComponent },
      {
        path: 'editattribute/:id',
        component: MetadataUpdateAttributeComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // ✅ forChild only
  exports: [RouterModule],
})
export class AdminRoutingModule {}
