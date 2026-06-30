import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Part } from '../../../../Models/Part.Models';
import { Structure } from '../../../../Models/Structure.Model';
import { Category } from '../../../../Models/Category';
import { CategoryType } from '../../../../Models/CategoryType';

import { PartService } from '../../../Services/part-service.service';
import { StructureService } from '../../../Services/structure-service.service';
import { CategoryService } from '../../../Services/CategoryService';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { EditPartDialogComponent } from '../../../../../shared/Dialogs/edit-part-dialog/edit-part-dialog.component';
import { ToastService } from '../../../../../shared/Services/toast.service';
import { ConfirmDialogComponent } from '../../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.scss',
})
export class PartListComponent implements OnInit {
  /* ================= DATA ================= */
  allParts: Part[] = []; // full dataset
  filteredParts: Part[] = []; // after filters
  Parts: Part[] = []; // paginated view

  Structures: Structure[] = [];
  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];

  /* ================= FILTER STATE ================= */
  selectedCategoryId?: number;
  selectedCategoryTypeId?: number;
  selectedStructureId?: number;
  searchText: string = '';
  /* ================= PAGINATION ================= */
  pageIndex = 1;
  pageSize = 15;
  pageSizes = [15, 25, 50, 100];
  totalCount = 0;
  /* ================= CREATE DROPDOWNS STATE ================= */
  createCategoryId?: number;
  createCategoryTypeId?: number;
  createStructureId?: number;

  createCategoryTypes: CategoryType[] = [];
  createStructures: Structure[] = [];
  /* ================= FORM ================= */
  crateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    structureId: new FormControl('', Validators.required),
    description: new FormControl(''),
  });
  sortingPartId: number | null = null;

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private partService: PartService,
    private structureService: StructureService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadParts();
    this.loadCategories();
  }

  /* ================= LOADERS ================= */

  loadParts(keepPage = false): void {
    const currentPage = this.pageIndex;

    this.partService.getAllParts(true, 1, 1000).subscribe({
      next: (res) => {
        console.log(res);
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }

        this.allParts = (res.data.parts ?? []).sort(
          (a, b) =>
            (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id,
        );

        this.applyFilters(keepPage ? currentPage : 1);
      },
      error: () => this.toast.show('Failed to load parts', 'error'),
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }
        this.categories = res.data.categories;
      },
      error: () => this.toast.show('Failed to load categories', 'error'),
    });
  }

  /* ================= FILTER HANDLERS ================= */

  onCategoryChange(event: Event): void {
    this.selectedCategoryId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.selectedCategoryTypeId = undefined;
    this.selectedStructureId = undefined;
    this.categoryTypes = [];
    this.Structures = [];

    if (!this.selectedCategoryId) {
      this.applyFilters();
      return;
    }

    this.categoryTypeService
      .getTypesByCategory(this.selectedCategoryId)
      .subscribe((res) => {
        if (res.success) this.categoryTypes = res.data.categoryTypes;
      });

    this.applyFilters();
  }
  onCreateCategoryChange(event: Event): void {
    this.createCategoryId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.createCategoryTypeId = undefined;
    this.createStructureId = undefined;

    this.createCategoryTypes = [];
    this.createStructures = [];

    // reset required control
    this.crateForm.patchValue({ structureId: '' });

    if (!this.createCategoryId) return;

    this.categoryTypeService
      .getTypesByCategory(this.createCategoryId)
      .subscribe((res) => {
        if (res.success) this.createCategoryTypes = res.data.categoryTypes;
      });
  }

  onCreateCategoryTypeChange(event: Event): void {
    this.createCategoryTypeId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.createStructureId = undefined;
    this.createStructures = [];

    this.crateForm.patchValue({ structureId: '' });

    if (!this.createCategoryTypeId) return;

    this.structureService
      .getStructuresByType(this.createCategoryTypeId)
      .subscribe((res) => {
        if (res.success) this.createStructures = res.data.structures;
      });
  }

  onCreateStructureChange(event: Event): void {
    this.createStructureId =
      +(event.target as HTMLSelectElement).value || undefined;

    // keep formControl in sync
    this.crateForm.patchValue({
      structureId: this.createStructureId ? String(this.createStructureId) : '',
    });
  }
  onCategoryTypeChange(event: Event): void {
    this.selectedCategoryTypeId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.selectedStructureId = undefined;
    this.Structures = [];

    if (!this.selectedCategoryTypeId) {
      this.applyFilters();
      return;
    }

    this.structureService
      .getStructuresByType(this.selectedCategoryTypeId)
      .subscribe((res) => {
        if (res.success) this.Structures = res.data.structures;
      });

    this.applyFilters();
  }

  onStructureChange(event: Event): void {
    this.selectedStructureId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.applyFilters();
  }
  onSearchChange(value: string): void {
    this.searchText = value ?? '';
    this.applyFilters();
  }
  applyFilters(page = 1): void {
    const search = (this.searchText || '').trim().toLowerCase();

    this.filteredParts = this.allParts
      .filter((p) => {
        if (this.selectedCategoryId && p.categoryId !== this.selectedCategoryId)
          return false;

        if (
          this.selectedCategoryTypeId &&
          p.categoryTypeId !== this.selectedCategoryTypeId
        )
          return false;

        if (
          this.selectedStructureId &&
          p.structureId !== this.selectedStructureId
        )
          return false;

        if (search) {
          const hay =
            `${p.name ?? ''} ${p.strucutreName ?? ''} ${p.categoryName ?? ''} ${p.categoryTypeName ?? ''}`.toLowerCase();

          if (!hay.includes(search)) return false;
        }

        return true;
      })
      .sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.id - b.id,
      );

    this.totalCount = this.filteredParts.length;
    this.pageIndex = Math.min(page, this.totalPage);
    this.updatePagedData();
  }

  /* ================= PAGINATION ================= */

  updatePagedData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.Parts = this.filteredParts.slice(start, end);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPage) return;
    this.pageIndex = page;
    this.updatePagedData();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  get totalPage(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  /* ================= CRUD ================= */

  onSave(): void {
    if (!this.crateForm.valid) {
      this.toast.show('Please fill required fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.crateForm.value.name!);
    formData.append('structureId', this.crateForm.value.structureId!);
    formData.append('description', this.crateForm.value.description!);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.partService.createPart(formData).subscribe((res) => {
      if (res.success) {
        this.toast.show(res.message, 'success');
        this.loadParts();
        this.crateForm.reset();
        this.selectedFile = null;
        this.previewUrl = null;
      } else {
        this.toast.show(res.message, 'error');
      }
    });
  }

  onEdit(part: Part): void {
    const dialogRef = this.dialog.open(EditPartDialogComponent, {
      data: {
        id: part.id,
        name: part.name,
        file: part.fileUrl,

        categoryId: part.categoryId,
        categoryTypeId: part.categoryTypeId,
        structureId: part.structureId,
        description: part.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('structureId', String(result.structureId));
      formData.append('description', String(result.description));
      if (result.file) formData.append('file', result.file);

      this.partService.updatePart(result.id, formData).subscribe((res) => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.loadParts();
        } else {
          this.toast.show(res.message, 'error');
        }
      });
    });
  }

  onDelete(id: number, name: string): void {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: `350px`,
      data: { message: `Are you sure you want to delete "${name}"` },
    });
    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.partService.deletePart(id).subscribe((res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadParts();
          } else {
            this.toast.show(res.message, 'error');
          }
        });
      }
    });
  }

  /* ================= FILE ================= */

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }

  // ############ sorting ########## //
  canSortParts(): boolean {
    return (
      this.selectedStructureId !== undefined && this.selectedStructureId > 0
    );
  }

  isFirstPart(index: number): boolean {
    return this.canSortParts() && this.pageIndex === 1 && index === 0;
  }

  isLastPart(index: number): boolean {
    return (
      this.canSortParts() &&
      this.pageIndex === this.totalPage &&
      index === this.Parts.length - 1
    );
  }

  moveUp(item: Part, index: number): void {
    if (!this.canSortParts()) {
      this.toast.warning('Select a component first to reorder components.');
      return;
    }

    if (this.isFirstPart(index)) return;

    this.sortingPartId = item.id;

    this.partService
      .moveUp(item.id)
      .pipe(finalize(() => (this.sortingPartId = null)))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.show(res.message || 'part moved up successfully.');
            this.loadParts(true);
          } else {
            this.toast.show(res.message || 'Move failed.');
          }
        },
        error: (err) => {
          this.toast.show(err?.error?.message || 'Failed to move part up.');
        },
      });
  }

  moveDown(item: Part, index: number): void {
    if (!this.canSortParts()) {
      this.toast.show('Select a component first to reorder parts.');
      return;
    }

    if (this.isLastPart(index)) return;

    this.sortingPartId = item.id;

    this.partService
      .moveDown(item.id)
      .pipe(finalize(() => (this.sortingPartId = null)))
      .subscribe({
        next: (res) => {
          console.log(res);
          if (res.success) {
            this.toast.show(res.message || 'part moved down successfully.');
            this.loadParts(true);
          } else {
            this.toast.show(res.message || 'Move failed.');
          }
        },
        error: (err) => {
          this.toast.show(err?.error?.message || 'Failed to move part down.');
        },
      });
  }
}
