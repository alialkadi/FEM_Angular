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

@NgModule({
  declarations: [SpinnerComponent, PageHeaderComponent, EditCategoryDialogComponent, ConfirmDialogComponent],
  imports: [CommonModule,
    ReactiveFormsModule, MatInputModule, MatIconModule,
    MatDialogModule,
    MatButtonModule, MatFormFieldModule, NgOptimizedImage],   
  exports: [CommonModule, SpinnerComponent, PageHeaderComponent,MatButtonModule,MatDialogModule],
})
export class SharedModule {}
