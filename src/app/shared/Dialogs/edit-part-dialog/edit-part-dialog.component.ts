import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { StructureService } from '../../../features/admin/Services/structure-service.service';
import { Structure } from '../../../features/Models/Structure.Model';

@Component({
  selector: 'app-edit-part-dialog',
  templateUrl: './edit-part-dialog.component.html',
  styleUrl: './edit-part-dialog.component.scss'
})
export class EditPartDialogComponent {
  editForm: FormGroup;
  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<EditPartDialogComponent>,
    private _confirmDialog: MatDialog,
    private structureService : StructureService,
    @Inject(MAT_DIALOG_DATA) public data: {id: number, name: string, structureId: number, file: string }
  ) {
    this.loadStructures();
    this.editForm = this._formBuilder.group({
      name: [data.name],
      file: [data.file],
      structureId: [data.structureId]
    });
    this.previewUrl = data.file;
  }
  Structures: Structure[] = [];

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiled = file;
      const reader = new FileReader();
      reader.onload = e => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }
loadStructures(): void {
    this.structureService.getAllStructures(true).subscribe({
      next: (res) => {
        if (res.success) {
          console.log("from types here is Structures",res)
          this.Structures = res.data.structures;
        }
      },
      error: (err) => console.error('Error loading Structures:', err)
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
          structureId: this.editForm.value.structureId
        });
      }
    });
  }
}
