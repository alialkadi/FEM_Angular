import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Part } from '../../../Models/Part.Models';
import { PartOption } from '../../../Models/PartOption.Model';
import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { Structure } from '../../../Models/Structure.Model';

import { PartOptionService } from '../../Services/part-option-service.service';
import { PartService } from '../../Services/part-service.service';
import { CategoryService } from '../../Services/CategoryService';
import { CategoryTypeService } from '../../Services/categoryTypeService.service';
import { StructureService } from '../../Services/structure-service.service';
import { EditPartOptionDialogComponent } from '../../../../shared/Dialogs/edit-part-option-dialog/edit-part-option-dialog.component';
import { ToastService } from '../../../../shared/Services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-part-option-list',
  templateUrl: './part-option-list.component.html',
  styleUrl: './part-option-list.component.scss',
})
export class PartOptionListComponent implements OnInit {
  /* ================= DATA ================= */
  allPartOptions: PartOption[] = [];
  filteredPartOptions: PartOption[] = [];
  PartOptions: PartOption[] = [];

  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];
  Structures: Structure[] = [];
  Parts: Part[] = [];

  /* ================= FILTER STATE ================= */
  selectedCategoryId?: number;
  selectedCategoryTypeId?: number;
  selectedStructureId?: number;
  selectedPartId?: number;
  searchText: string = '';
  /* ================= PAGINATION ================= */
  pageIndex = 1;
  pageSize = 15;
  pageSizes = [15, 25, 50, 100];
  totalCount = 0;

  /* ================= FORM ================= */
  crateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    mainPartId: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private partOptionService: PartOptionService,
    private partService: PartService,
    private structureService: StructureService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadPartOptions();
    this.loadCategories();
  }

  /* ================= LOADERS ================= */

  loadPartOptions(): void {
    this.partOptionService.getAllPartOptions(true, 1, 1000).subscribe({
      next: (res) => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }
        this.allPartOptions = res.data.partOptions;
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to load Part Options', 'error'),
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe((res) => {
      if (res.success) this.categories = res.data.categories;
    });
  }

  /* ================= FILTER HANDLERS ================= */

  onCategoryChange(event: Event): void {
    this.selectedCategoryId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.selectedCategoryTypeId = undefined;
    this.selectedStructureId = undefined;
    this.selectedPartId = undefined;

    this.categoryTypes = [];
    this.Structures = [];
    this.Parts = [];

    if (this.selectedCategoryId) {
      this.categoryTypeService
        .getTypesByCategory(this.selectedCategoryId)
        .subscribe((res) => {
          if (res.success) this.categoryTypes = res.data.categoryTypes;
        });
    }

    this.applyFilters();
  }

  onCategoryTypeChange(event: Event): void {
    this.selectedCategoryTypeId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.selectedStructureId = undefined;
    this.selectedPartId = undefined;

    this.Structures = [];
    this.Parts = [];

    if (this.selectedCategoryTypeId) {
      this.structureService
        .getStructuresByType(this.selectedCategoryTypeId)
        .subscribe((res) => {
          if (res.success) this.Structures = res.data.structures;
        });
    }

    this.applyFilters();
  }

  onStructureChange(event: Event): void {
    this.selectedStructureId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.selectedPartId = undefined;

    this.Parts = [];

    if (this.selectedStructureId) {
      this.partService
        .getPartsByStructure(this.selectedStructureId)
        .subscribe((res) => {
          if (res.success) this.Parts = res.data.parts;
        });
    }

    this.applyFilters();
  }

  onPartFilterChange(event: Event): void {
    this.selectedPartId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.applyFilters();
  }
  onSearchChange(value: string): void {
    this.searchText = value ?? '';
    this.applyFilters();
  }
  applyFilters(): void {
    const search = (this.searchText || '').trim().toLowerCase();
    this.filteredPartOptions = this.allPartOptions.filter((o) => {
      if (this.selectedCategoryId && o.categoryId !== this.selectedCategoryId)
        return false;
      if (
        this.selectedCategoryTypeId &&
        o.categoryTypeId !== this.selectedCategoryTypeId
      )
        return false;
      if (
        this.selectedStructureId &&
        o.structureId !== this.selectedStructureId
      )
        return false;
      if (this.selectedPartId && o.mainPartId !== this.selectedPartId)
        return false;
      if (search) {
        const hay =
          `${o.name ?? ''} ${o.mainPartName ?? ''} ${(o as any).strucutreName ?? ''} ${o.categoryTypeName ?? ''}`.toLowerCase();

        if (!hay.includes(search)) return false;
      }

      return true;
    });

    this.totalCount = this.filteredPartOptions.length;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  /* ================= PAGINATION ================= */

  updatePagedData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    this.PartOptions = this.filteredPartOptions.slice(
      start,
      start + this.pageSize,
    );
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
    formData.append('mainPartId', this.crateForm.value.mainPartId!);
    formData.append('description', this.crateForm.value.description!);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.partOptionService.createPartOption(formData).subscribe((res) => {
      if (res.success) {
        this.toast.show(res.message, 'success');
        this.loadPartOptions();
        this.crateForm.reset();
        this.previewUrl = null;
        this.selectedFile = null;
      } else {
        this.toast.show(res.message, 'error');
      }
    });
  }

  onEdit(option: PartOption): void {
    const dialogRef = this.dialog.open(EditPartOptionDialogComponent, {
      data: {
        id: option.id,
        name: option.name,
        file: option.fileUrl,

        categoryId: option.categoryId,
        categoryTypeId: option.categoryTypeId,
        structureId: option.structureId,
        mainPartId: option.mainPartId,
        description: option.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('mainPartId', String(result.mainPartId));
      formData.append('description', String(result.description));
      if (result.file) formData.append('file', result.file);

      this.partOptionService
        .updatePartOption(result.id, formData)
        .subscribe((res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadPartOptions();
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
        this.partOptionService.deletePartOption(id).subscribe((res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadPartOptions();
          }
        });
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }
}
