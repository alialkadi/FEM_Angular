import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { RouterOutlet, RouterModule } from "@angular/router";
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule
],
  exports: [AdminLayoutComponent],
})
export class LayoutsModule { }
