import { Component, Inject } from '@angular/core';
import { CategoryType } from '../../../features/Models/CategoryType';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryTypeService } from '../../../features/admin/Services/categoryTypeService.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-structure-dialog',
  templateUrl: './edit-structure-dialog.component.html',
  styleUrl: './edit-structure-dialog.component.scss'
})
export class EditStructureDialogComponent {
   editForm: FormGroup;
    selectedFiled: File | null = null;
    previewUrl: string | ArrayBuffer | null = null;
    constructor(
      private _formBuilder: FormBuilder,
      private _dialogRef: MatDialogRef<EditStructureDialogComponent>,
      private _confirmDialog: MatDialog,
      private categoryTypeService : CategoryTypeService,
      @Inject(MAT_DIALOG_DATA) public data: {id: number, name: string, typeId: number, file: string }
    ) {
      this.loadTypesCategories();
      this.editForm = this._formBuilder.group({
        name: [data.name],
        file: [data.file],
        typeId: [data.typeId]
      });
      this.previewUrl = data.file;
  }
  
    types: CategoryType[] = [];
  
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFiled = file;
        const reader = new FileReader();
        reader.onload = e => (this.previewUrl = reader.result);
        reader.readAsDataURL(file);
      }
    }
  loadTypesCategories(): void {
      this.categoryTypeService.getAllCategoriestypes(true).subscribe({
        next: (res) => {
          if (res.success) {
            console.log("from types here is types",res)
            this.types = res.data.categoryTypes;
          }
        },
        error: (err) => console.error('Error loading typs:', err)
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
          console.log("from structure dialog",this.editForm)
          this._dialogRef.close({
            id: this.data.id,
            name: this.editForm.value.name,
            file: this.selectedFiled,
            typeId: this.editForm.value.typeId
          });
        }
      });
    }
}
