import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Subject, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { Category } from '../../../features/Models/Category';
import { CategoryType } from '../../../features/Models/CategoryType';

import { CategoryService } from '../../../features/admin/Services/CategoryService';
import { CategoryTypeService } from '../../../features/admin/Services/categoryTypeService.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-structure-dialog',
  templateUrl: './edit-structure-dialog.component.html',
  styleUrl: './edit-structure-dialog.component.scss',
})
export class EditStructureDialogComponent implements OnInit, OnDestroy {
  editForm: FormGroup;

  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  categories: Category[] = [];
  types: CategoryType[] = [];

  private destroy$ = new Subject<void>();

  // keep initial ids once (so we don’t override user changes later)
  private initCategoryId: number | null;
  private initTypeId: number | null;
  private isInitializing = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditStructureDialogComponent>,
    private confirmDialog: MatDialog,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      name: string;
      categoryId: number;
      typeId: number;
      file: string;
    },
  ) {
    this.initCategoryId = Number(data.categoryId) || null;
    this.initTypeId = Number(data.typeId) || null;

    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      categoryId: [this.initCategoryId, Validators.required],
      typeId: [this.initTypeId, Validators.required],
      file: [data.file],
    });

    this.previewUrl = data.file;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupCascade();

    // ✅ trigger types load for the existing selected category
    this.editForm.patchValue(
      { categoryId: this.initCategoryId },
      { emitEvent: true },
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => (this.categories = res.data?.categories ?? []),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  private setupCascade(): void {
    this.editForm
      .get('categoryId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => {
          // reset types list & selected type when category changes
          this.types = [];
          this.editForm.patchValue({ typeId: null }, { emitEvent: false });
        }),
        switchMap((catId: number | null) => {
          if (!catId) return of([]);
          return this.categoryTypeService.getTypesByCategory(catId).pipe(
            map((res: any) => res.data?.categoryTypes ?? []),
            catchError((err) => {
              console.error('Error loading types:', err);
              return of([]);
            }),
          );
        }),
      )
      .subscribe((types) => {
        this.types = types;

        // ✅ apply default type only at init (not after user changes)
        if (
          this.isInitializing &&
          this.initTypeId &&
          this.types.some((t) => t.id === this.initTypeId)
        ) {
          this.editForm.patchValue(
            { typeId: this.initTypeId },
            { emitEvent: false },
          );
        }

        this.isInitializing = false;
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.selectedFiled = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(file);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const confirmRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: { message: `Confirm update Item ${this.data.name}` },
    });

    confirmRef.afterClosed().subscribe((ok) => {
      if (!ok) return;

      this.dialogRef.close({
        id: this.data.id,
        name: this.editForm.value.name,
        file: this.selectedFiled,
        typeId: this.editForm.value.typeId,
        categoryId: this.editForm.value.categoryId,
      });
    });
  }
}
