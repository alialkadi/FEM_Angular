import { Component } from '@angular/core';
import { Structure } from '../../../../Models/Structure.Model';
import { CategoryType } from '../../../../Models/CategoryType';
import { StructureService } from '../../../Services/structure-service.service';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditStructureDialogComponent } from '../../../../../shared/Dialogs/edit-structure-dialog/edit-structure-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../../Services/CategoryService';
import { Category } from '../../../../Models/Category';
import { MetadataTargetType } from '../../../../Models/MetadataTargetType';
import { ConfirmDialogComponent } from '../../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-structure-list',
  templateUrl: './structure-list.component.html',
  styleUrl: './structure-list.component.scss',
})
export class StructureListComponent {
  selectedStructureForMetadata: any | null = null;
  MetadataTargetType = MetadataTargetType;

  /* ================= DATA ================= */
  allStructures: Structure[] = [];
  filteredStructures: Structure[] = [];
  structures: Structure[] = [];

  categories: Category[] = [];

  // ✅ filter dropdown types
  filterCategoryTypes: CategoryType[] = [];

  // ✅ create form dropdown types
  createCategoryTypes: CategoryType[] = [];

  /* ================= FILTER STATE (TABLE) ================= */
  selectedCategoryId?: number;
  selectedCategoryTypeId?: number;
  searchText: string = '';

  /* ================= CREATE STATE (FORM) ================= */
  createSelectedCategoryId?: number;

  /* ================= PAGINATION ================= */
  totalCount = 0;
  pageIndex = 1;
  pageSize = 15;
  pageSizes = [15, 25, 50, 100];

  get totalPage(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(
    private dialog: MatDialog,
    private _structureService: StructureService,
    private _categoryTypeService: CategoryTypeService,
    private _categoryServie: CategoryService,
  ) {}

  ngOnInit(): void {
    this.loadAllStructures();
    this.loadCategories();
  }

  /* ================= LOADERS ================= */

  loadAllStructures(): void {
    this._structureService.getAllStructures(true, 1, 1000).subscribe({
      next: (res) => {
        console.log(res);
        this.allStructures = res.data?.structures ?? [];
        console.log(res);
        this.applyFilters();
      },
      error: () => console.log('Failed to load structures'),
    });
  }

  loadCategories(): void {
    this._categoryServie.getAllCategories(true).subscribe({
      next: (res) => {
        this.categories = res.data?.categories ?? [];
      },
    });
  }

  /* ================= FILTER HANDLERS (TABLE ONLY) ================= */

  onFilterCategoryChange(event: Event): void {
    const categoryId = +(event.target as HTMLSelectElement).value || undefined;

    this.selectedCategoryId = categoryId;
    this.selectedCategoryTypeId = undefined;
    this.filterCategoryTypes = [];

    if (!this.selectedCategoryId) {
      this.applyFilters();
      return;
    }

    this._categoryTypeService
      .getTypesByCategory(this.selectedCategoryId)
      .subscribe({
        next: (res) => {
          if (res.success)
            this.filterCategoryTypes = res.data.categoryTypes ?? [];
          this.applyFilters();
        },
        error: () => this.applyFilters(),
      });
  }

  onFilterCategoryTypeChange(event: Event): void {
    this.selectedCategoryTypeId =
      +(event.target as HTMLSelectElement).value || undefined;

    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategoryId = undefined;
    this.selectedCategoryTypeId = undefined;
    this.searchText = '';
    this.filterCategoryTypes = [];
    this.applyFilters();
  }

  applyFilters(): void {
    const search = (this.searchText || '').trim().toLowerCase();

    this.filteredStructures = this.allStructures.filter((s) => {
      // Category filter
      if (this.selectedCategoryId) {
        const sid = (s as any).categoryId as number | undefined;
        const sname = (s as any).categoryName as string | undefined;

        if (typeof sid === 'number') {
          if (sid !== this.selectedCategoryId) return false;
        } else {
          const selectedCategoryName =
            this.categories
              .find((c) => c.id === this.selectedCategoryId)
              ?.name?.toLowerCase() ?? '';
          if (
            selectedCategoryName &&
            (sname ?? '').toLowerCase() !== selectedCategoryName
          )
            return false;
        }
      }

      // Type filter
      if (this.selectedCategoryTypeId) {
        if ((s as any).typeId !== this.selectedCategoryTypeId) return false;
      }

      // Search
      if (search) {
        const hay =
          `${s.name ?? ''} ${(s as any).typeName ?? ''} ${(s as any).categoryName ?? ''}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }

      return true;
    });

    this.totalCount = this.filteredStructures.length;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  /* ================= PAGINATION ================= */

  updatePagedData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.structures = this.filteredStructures.slice(start, end);
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPage) return;
    this.pageIndex = newPage;
    this.updatePagedData();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  /* ================= CREATE FORM (NO FILTERING) ================= */

  crateForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    typeId: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  onCreateCategoryChange(event: Event): void {
    const categoryId = +(event.target as HTMLSelectElement).value || undefined;

    this.createSelectedCategoryId = categoryId;
    this.createCategoryTypes = [];

    // reset type when category changes
    this.crateForm.patchValue({ typeId: '' });

    if (!this.createSelectedCategoryId) return;

    this._categoryTypeService
      .getTypesByCategory(this.createSelectedCategoryId)
      .subscribe({
        next: (res) => {
          if (res.success)
            this.createCategoryTypes = res.data.categoryTypes ?? [];
        },
      });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] ?? null;
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }

  onSave() {
    if (!this.crateForm.valid) return;

    const formData = new FormData();
    formData.append('name', this.crateForm.value.name);
    formData.append('typeId', this.crateForm.value.typeId);
    formData.append('description', this.crateForm.value.description);

    if (this.selectedFile) formData.append('file', this.selectedFile);

    this._structureService.CreateStructure(formData).subscribe({
      next: () => {
        this.loadAllStructures();
        this.crateForm.reset();
        this.previewUrl = null;
        this.selectedFile = null;
        this.createSelectedCategoryId = undefined;
        this.createCategoryTypes = [];
      },
      error: (err) => console.log(err),
    });
  }

  onCancelCreate(): void {
    this.crateForm.reset();
    this.previewUrl = null;
    this.selectedFile = null;
    this.createSelectedCategoryId = undefined;
    this.createCategoryTypes = [];
  }

  /* ================= CRUD (same logic) ================= */

  onEdit(item: any): void {
    console.log(item);
    const dialogRef = this.dialog.open(EditStructureDialogComponent, {
      data: {
        id: item.id,
        name: item.name,
        file: item.fileUrl,
        description: item.description,
        // ✅ MUST exist on the item (prefer backend returns it)
        categoryId: item.categoryId,
        typeId: item.typeId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('typeId', result.typeId);
      formData.append('description', result.description);
      if (result.file) formData.append('file', result.file);

      this._structureService.updateStructure(result.id, formData).subscribe({
        next: (res) => res.success && this.loadAllStructures(),
      });
    });
  }

  onDelete(id: number) {
    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: `350px`,
      data: { message: `Are you sure you want to delete "${name}"` },
    });
    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this._structureService.deleteStructure(id).subscribe({
          next: (res) => {
            if (res.success) this.loadAllStructures();
          },
          error: (err) => console.log(err),
        });
      }
    });
  }

  /* ================= METADATA PANEL ================= */

  openMetadata(structure: any): void {
    this.selectedStructureForMetadata = structure;
  }

  closeMetadata(): void {
    this.selectedStructureForMetadata = null;
  }
}
