import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Structure } from '../../../features/Models/Structure.Model';
import { Part } from '../../../features/Models/Part.Models';

import { CategoryService } from '../../../features/admin/Services/CategoryService';
import { CategoryTypeService } from '../../../features/admin/Services/categoryTypeService.service';
import { StructureService } from '../../../features/admin/Services/structure-service.service';
import { PartService } from '../../../features/admin/Services/part-service.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-part-option-dialog',
  templateUrl: './edit-part-option-dialog.component.html',
  styleUrl: './edit-part-option-dialog.component.scss',
})
export class EditPartOptionDialogComponent implements OnInit, OnDestroy {
  editForm: FormGroup;

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];

  selectedFiled: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditPartOptionDialogComponent>,
    private confirmDialog: MatDialog,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      name: string;
      file: string;
      categoryId: number;
      categoryTypeId: number;
      structureId: number;
      mainPartId: number;
      description: string;
    },
  ) {
    this.editForm = this.fb.group({
      name: [data.name, Validators.required],
      categoryId: [data.categoryId ?? null, Validators.required],
      categoryTypeId: [data.categoryTypeId ?? null, Validators.required],
      structureId: [data.structureId ?? null, Validators.required],
      mainPartId: [data.mainPartId ?? null, Validators.required],
      file: [data.file],
      description: [data.description],
    });

    this.previewUrl = data.file;
  }

  private initIds = {
    categoryId: this.data.categoryId ?? null,
    categoryTypeId: this.data.categoryTypeId ?? null,
    structureId: this.data.structureId ?? null,
    mainPartId: this.data.mainPartId ?? null,
  };

  private isInitializing = true;

  ngOnInit(): void {
    this.loadCategories();
    this.setupCascade();

    // ✅ Trigger initial cascade using existing values
    this.editForm.patchValue(
      {
        categoryId: this.data.categoryId ?? null,
        categoryTypeId: this.data.categoryTypeId ?? null,
        structureId: this.data.structureId ?? null,
        mainPartId: this.data.mainPartId ?? null,
      },
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
      error: (err) => console.error('Error loading categories', err),
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
          this.parts = [];
          this.editForm.patchValue(
            { categoryTypeId: null, structureId: null, mainPartId: null },
            { emitEvent: false },
          );
        }),
        switchMap((catId: number | null) => {
          if (!catId) return of([]);
          return this.categoryTypeService.getTypesByCategory(catId).pipe(
            map((res: any) => res.data?.categoryTypes ?? []),
            catchError(() => of([])),
          );
        }),
      )
      .subscribe((types) => {
        this.categoryTypes = types;

        // apply default type ONLY on init
        if (
          this.isInitializing &&
          this.initIds.categoryTypeId &&
          this.categoryTypes.some((t) => t.id === this.initIds.categoryTypeId)
        ) {
          this.editForm.patchValue(
            { categoryTypeId: this.initIds.categoryTypeId },
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
          this.parts = [];
          this.editForm.patchValue(
            { structureId: null, mainPartId: null },
            { emitEvent: false },
          );
        }),
        switchMap((typeId: number | null) => {
          if (!typeId) return of([]);
          return this.structureService.getStructuresByType(typeId).pipe(
            map((res: any) => res.data?.structures ?? []),
            catchError(() => of([])),
          );
        }),
      )
      .subscribe((structures) => {
        this.structures = structures;

        // apply default structure ONLY on init
        if (
          this.isInitializing &&
          this.initIds.structureId &&
          this.structures.some((s) => s.id === this.initIds.structureId)
        ) {
          this.editForm.patchValue(
            { structureId: this.initIds.structureId },
            { emitEvent: true },
          );
        }
      });

    // Structure -> Parts
    this.editForm
      .get('structureId')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        tap(() => {
          this.parts = [];
          this.editForm.patchValue({ mainPartId: null }, { emitEvent: false });
        }),
        switchMap((structureId: number | null) => {
          if (!structureId) return of([]);
          return this.partService.getPartsByStructure(structureId).pipe(
            map((res: any) => res.data?.parts ?? []),
            catchError(() => of([])),
          );
        }),
      )
      .subscribe((parts) => {
        this.parts = parts;

        // apply default part ONLY on init
        if (
          this.isInitializing &&
          this.initIds.mainPartId &&
          this.parts.some((p) => p.id === this.initIds.mainPartId)
        ) {
          this.editForm.patchValue(
            { mainPartId: this.initIds.mainPartId },
            { emitEvent: false },
          );
        }

        // after we reach the last level once -> stop init mode
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
        mainPartId: this.editForm.value.mainPartId,
        description: this.editForm.value.description,
      });
    });
  }
}
