import { Component, Inject } from '@angular/core';
import { FormGroup, FormGroupName, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { read } from 'fs';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { CategoryService } from '../../../features/admin/Services/CategoryService';
import { Category } from '../../../features/Models/Category';

@Component({
  selector: 'app-edit-cateogy-type',
  templateUrl: './edit-cateogy-type.component.html',
  styleUrl: './edit-cateogy-type.component.scss'
})
export class EditCateogyTypeComponent {
  editForm: FormGroup;
  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<EditCateogyTypeComponent>,
    private _confirmDialog: MatDialog,
    private categoryService : CategoryService,
    @Inject(MAT_DIALOG_DATA) public data: {id: number, name: string, categoryId: number, file: string }
  ) {
    this.loadCategories();
    this.editForm = this._formBuilder.group({
      name: [data.name],
      file: [data.file],
      categoryId: [data.categoryId]
    });
    this.previewUrl = data.file;
  }
  categories: Category[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiled = file;
      const reader = new FileReader();
      reader.onload = e => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }
loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        if (res.success) {
          console.log("from types here is categories",res)
          this.categories = res.data.categories;
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }
  onCancel(): void{
    this._dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.invalid) return;
    
    const confirmRef = this._confirmDialog.open(ConfirmDialogComponent, {
      width: "350px",
      data: { message: `Confirm update Item ${this.data.name}` }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("from dialog",this.editForm)
        this._dialogRef.close({
          id: this.data.id,
          name: this.editForm.value.name,
          file: this.selectedFiled,
          categoryId: this.editForm.value.categoryId
        });
      }
    });
  }
}
