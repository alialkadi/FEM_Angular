import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

import { SpinnerComponent } from './ui/spinner/spinner.component';
import { PageHeaderComponent } from './ui/page-header/page-header.component';
import { EditCategoryDialogComponent } from './Dialogs/edit-category-dialog/edit-category-dialog.component';
import { ConfirmDialogComponent } from './Dialogs/confirm-dialog/confirm-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { EditCateogyTypeComponent } from './Dialogs/edit-cateogy-type-dialog/edit-cateogy-type.component';
import { EditStructureDialogComponent } from './Dialogs/edit-structure-dialog/edit-structure-dialog.component';
import { EditPartDialogComponent } from './Dialogs/edit-part-dialog/edit-part-dialog.component';
import { EditPartOptionDialogComponent } from './Dialogs/edit-part-option-dialog/edit-part-option-dialog.component';
import { EditFeeDialogComponent } from './Dialogs/edit-fee-dialog/edit-fee-dialog.component';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [SpinnerComponent, PageHeaderComponent, EditCategoryDialogComponent, ConfirmDialogComponent, EditCateogyTypeComponent, EditStructureDialogComponent, EditPartDialogComponent, EditPartOptionDialogComponent, EditFeeDialogComponent],
  imports: [CommonModule,
    ReactiveFormsModule, MatInputModule, MatIconModule,
    MatDialogModule, MatOptionModule,
    MatButtonModule, MatFormFieldModule, NgOptimizedImage],   
  exports: [CommonModule, SpinnerComponent, PageHeaderComponent,MatButtonModule,MatDialogModule],
})
export class SharedModule {}
