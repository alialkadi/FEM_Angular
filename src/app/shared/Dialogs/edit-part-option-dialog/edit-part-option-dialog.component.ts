import { Component, Inject } from '@angular/core';
import { PartService } from '../../../features/admin/Services/part-service.service';
import { Part } from '../../../features/Models/Part.Models';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-part-option-dialog',
  templateUrl: './edit-part-option-dialog.component.html',
  styleUrl: './edit-part-option-dialog.component.scss'
})
export class EditPartOptionDialogComponent {
 editForm: FormGroup;
  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<EditPartOptionDialogComponent>,
    private _confirmDialog: MatDialog,
    private partService : PartService,
    @Inject(MAT_DIALOG_DATA) public data: {id: number, name: string, mainPartId: number, file: string }
  ) {
    this.loadParts();
    this.editForm = this._formBuilder.group({
      name: [data.name],
      file: [data.file],
      mainPartId: [data.mainPartId]
    });
    this.previewUrl = data.file;
  }
  Parts: Part[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiled = file;
      const reader = new FileReader();
      reader.onload = e => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }
loadParts(): void {
    this.partService.getAllParts(true).subscribe({
      next: (res) => {
        if (res.success) {
          console.log("from types here is Parts",res)
          this.Parts = res.data.parts;
        }
      },
      error: (err) => console.error('Error loading Parts:', err)
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
          mainPartId: this.editForm.value.mainPartId
        });
      }
    });
  }
}
