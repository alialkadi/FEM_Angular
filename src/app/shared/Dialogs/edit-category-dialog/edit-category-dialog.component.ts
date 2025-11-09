import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-category-dialog',
  templateUrl: './edit-category-dialog.component.html'
})
export class EditCategoryDialogComponent {
  editForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>,
    private confirmDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name: string,file: string }
  ) {
    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      file: [data.file,'']
    });
    this.previewUrl = data.file;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => (this.previewUrl = reader.result)
      reader.readAsDataURL(file);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.invalid) return;

    // Step 2: Open confirmation dialog
    const confirmRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Are you sure you want to update "${this.data.name}"?` }
    });

    confirmRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close({
          id: this.data.id,
          name: this.editForm.value.name,
          file: this.selectedFile
        });
      }
    });
  }
}
