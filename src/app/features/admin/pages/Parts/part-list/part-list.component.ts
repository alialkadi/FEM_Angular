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

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.scss'
})
export class PartListComponent implements OnInit {

  /* ================= DATA ================= */
  allParts: Part[] = [];        // full dataset
  filteredParts: Part[] = [];   // after filters
  Parts: Part[] = [];           // paginated view

  Structures: Structure[] = [];
  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];

  /* ================= FILTER STATE ================= */
  selectedCategoryId?: number;
  selectedCategoryTypeId?: number;
  selectedStructureId?: number;

  /* ================= PAGINATION ================= */
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];
  totalCount = 0;

  /* ================= FORM ================= */
  crateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    structureId: new FormControl('', Validators.required)
  });

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private partService: PartService,
    private structureService: StructureService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadParts();
    this.loadCategories();
  }

  /* ================= LOADERS ================= */

  loadParts(): void {
    this.partService.getAllParts(true, 1, 1000).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }

        this.allParts = res.data.parts;
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to load parts', 'error')
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: res => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }
        this.categories = res.data.categories;
      },
      error: () => this.toast.show('Failed to load categories', 'error')
    });
  }

  /* ================= FILTER HANDLERS ================= */

  onCategoryChange(event: Event): void {
    this.selectedCategoryId = +(event.target as HTMLSelectElement).value || undefined;
    this.selectedCategoryTypeId = undefined;
    this.selectedStructureId = undefined;
    this.categoryTypes = [];
    this.Structures = [];

    if (!this.selectedCategoryId) {
      this.applyFilters();
      return;
    }

    this.categoryTypeService.getTypesByCategory(this.selectedCategoryId).subscribe(res => {
      if (res.success) this.categoryTypes = res.data.categoryTypes;
    });

    this.applyFilters();
  }

  onCategoryTypeChange(event: Event): void {
    this.selectedCategoryTypeId = +(event.target as HTMLSelectElement).value || undefined;
    this.selectedStructureId = undefined;
    this.Structures = [];

    if (!this.selectedCategoryTypeId) {
      this.applyFilters();
      return;
    }

    this.structureService.getStructuresByType(this.selectedCategoryTypeId).subscribe(res => {
      if (res.success) this.Structures = res.data.structures;
    });

    this.applyFilters();
  }

  onStructureChange(event: Event): void {
    this.selectedStructureId = +(event.target as HTMLSelectElement).value || undefined;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredParts = this.allParts.filter(p => {

      if (this.selectedCategoryId && p.categoryId !== this.selectedCategoryId)
        return false;

      if (this.selectedCategoryTypeId && p.categoryTypeId !== this.selectedCategoryTypeId)
        return false;

      if (this.selectedStructureId && p.structureId !== this.selectedStructureId)
        return false;

      return true;
    });

    this.totalCount = this.filteredParts.length;
    this.pageIndex = 1;
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
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.partService.createPart(formData).subscribe(res => {
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
    const dialogRef = this.dialog.open(EditPartDialogComponent, { data: part });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('structureId', result.structureId);
      if (result.file) formData.append('file', result.file);

      this.partService.updatePart(result.id, formData).subscribe(res => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.loadParts();
        } else {
          this.toast.show(res.message, 'error');
        }
      });
    });
  }

  onDelete(id: number): void {
    this.partService.deletePart(id).subscribe(res => {
      if (res.success) {
        this.toast.show(res.message, 'success');
        this.loadParts();
      } else {
        this.toast.show(res.message, 'error');
      }
    });
  }

  /* ================= FILE ================= */

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }
}
