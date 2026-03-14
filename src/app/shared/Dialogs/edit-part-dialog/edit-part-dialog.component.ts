import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { Category } from '../../../features/Models/Category';
import { CategoryType } from '../../../features/Models/CategoryType';
import { Structure } from '../../../features/Models/Structure.Model';

import { CategoryService } from '../../../features/admin/Services/CategoryService';
import { CategoryTypeService } from '../../../features/admin/Services/categoryTypeService.service';
import { StructureService } from '../../../features/admin/Services/structure-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

import { Subject, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

@Component({
  selector: 'app-edit-part-dialog',
  templateUrl: './edit-part-dialog.component.html',
  styleUrl: './edit-part-dialog.component.scss',
})
export class EditPartDialogComponent implements OnInit, OnDestroy {
  editForm: FormGroup;

  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  structures: Structure[] = [];

  private destroy$ = new Subject<void>();

  // keep initial ids (apply once)
  private initCategoryId: number | null;
  private initTypeId: number | null;
  private initStructureId: number | null;
  private isInitializing = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPartDialogComponent>,
    private confirmDialog: MatDialog,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      name: string;
      file: string;
      categoryId: number;
      categoryTypeId: number;
      structureId: number;
      description: string;
    },
  ) {
    this.initCategoryId = Number(data.categoryId) || null;
    this.initTypeId = Number(data.categoryTypeId) || null;
    this.initStructureId = Number(data.structureId) || null;

    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      categoryId: [this.initCategoryId, Validators.required],
      categoryTypeId: [this.initTypeId, Validators.required],
      structureId: [this.initStructureId, Validators.required],
      file: [data.file],
      description: [data.description],
    });

    this.previewUrl = data.file;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.setupCascade();

    // trigger cascade using existing category
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
    // Category -> Types
    this.editForm
      .get('categoryId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => {
          this.categoryTypes = [];
          this.structures = [];
          this.editForm.patchValue(
            { categoryTypeId: null, structureId: null },
            { emitEvent: false },
          );
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
        this.categoryTypes = types;

        // apply initial type once
        if (
          this.isInitializing &&
          this.initTypeId &&
          this.categoryTypes.some((t) => t.id === this.initTypeId)
        ) {
          this.editForm.patchValue(
            { categoryTypeId: this.initTypeId },
            { emitEvent: true },
          );
        }
      });

    // Type -> Structures
    this.editForm
      .get('categoryTypeId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => {
          this.structures = [];
          this.editForm.patchValue({ structureId: null }, { emitEvent: false });
        }),
        switchMap((typeId: number | null) => {
          if (!typeId) return of([]);
          return this.structureService.getStructuresByType(typeId).pipe(
            map((res: any) => res.data?.structures ?? []),
            catchError((err) => {
              console.error('Error loading structures:', err);
              return of([]);
            }),
          );
        }),
      )
      .subscribe((structures) => {
        this.structures = structures;

        // apply initial structure once
        if (
          this.isInitializing &&
          this.initStructureId &&
          this.structures.some((s) => s.id === this.initStructureId)
        ) {
          this.editForm.patchValue(
            { structureId: this.initStructureId },
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
        structureId: this.editForm.value.structureId,
        description: this.editForm.value.description,
      });
    });
  }
}
