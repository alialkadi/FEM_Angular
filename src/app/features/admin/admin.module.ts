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

@NgModule({
  declarations: [DashboardComponent, ManageUsersComponent, DashboradNavComponent, CategoryTypesComponent,CategoriesListComponent, StructureListComponent, PartListComponent],
  imports: [SharedModule, AdminRoutingModule, MatIcon,CommonModule ,MatPaginatorModule,FormsModule, ReactiveFormsModule ,CommonModule ]
})
export class AdminModule {}
