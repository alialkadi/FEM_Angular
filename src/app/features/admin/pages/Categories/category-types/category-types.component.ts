import { CategoryTypeService } from './../../../Services/categoryTypeService.service';
import { Component } from '@angular/core';
import {
  CategoryType,
  CreateCategoryType,
} from '../../../../Models/CategoryType';
import { Category } from '../../../../Models/Category';
import { CategoryService } from '../../../Services/CategoryService';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditCateogyTypeComponent } from '../../../../../shared/Dialogs/edit-cateogy-type/edit-cateogy-type.component';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-category-types',
  templateUrl: './category-types.component.html',
  styleUrl: './category-types.component.scss',
})
export class CategoryTypesComponent {
  createType: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  /* ================= DATA ================= */
  allCategoryTypes: CategoryType[] = []; // full dataset
  filteredCategoryTypes: CategoryType[] = []; // after filters
  categoryTypes: CategoryType[] = []; // paginated view

  categories: Category[] = [];

  /* ================= FILTER STATE ================= */
  selectedCategoryId?: number;
  searchText = '';

  /* ================= PAGINATION ================= */
  totalCount = 0;
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];

  newType: CreateCategoryType = { name: '', categoryId: 0 };

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(
    private dialog: MatDialog,
    private _catogryTypeService: CategoryTypeService,
    private categoryService: CategoryService,
    private toast: ToastService,
  ) {
    this.createType = new FormGroup({
      name: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllCategoryTypes(); // ✅ load all once
  }

  /* ================= FILE ================= */

  onFileSelected(event: any) {
    this.selectedFile = event.target.files?.[0] ?? null;
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result);
    reader.readAsDataURL(this.selectedFile);
  }

  /* ================= LOADERS ================= */

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }
        this.categories = res.data.categories ?? [];
      },
      error: () => this.toast.show('Failed to load categories.', 'error'),
    });
  }

  loadAllCategoryTypes(): void {
    // ✅ same pattern as PartList: get all, filter + paginate locally
    this._catogryTypeService.getAllCategoriestypes(true, 1, 1000).subscribe({
      next: (res) => {
        if (!res.success) {
          this.toast.show(res.message, 'error');
          return;
        }

        this.allCategoryTypes = res.data.categoryTypes ?? [];
        this.applyFilters();
      },
      error: () => this.toast.show('Failed to load category types.', 'error'),
    });
  }

  /* ================= FILTERS ================= */

  onCategoryFilterChange(event: Event): void {
    this.selectedCategoryId =
      +(event.target as HTMLSelectElement).value || undefined;
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategoryId = undefined;
    this.searchText = '';
    this.applyFilters();
  }

  applyFilters(): void {
    const s = (this.searchText || '').trim().toLowerCase();

    this.filteredCategoryTypes = this.allCategoryTypes.filter((t) => {
      if (this.selectedCategoryId && t.categoryId !== this.selectedCategoryId)
        return false;

      if (s) {
        const hay = `${t.name ?? ''} ${t.categoryName ?? ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      return true;
    });

    this.totalCount = this.filteredCategoryTypes.length;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  /* ================= PAGINATION ================= */

  updatePagedData(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.categoryTypes = this.filteredCategoryTypes.slice(start, end);
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.pageIndex = newPage;
    this.updatePagedData();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.pageIndex = 1;
    this.updatePagedData();
  }

  /* ================= CRUD ================= */

  onSave() {
    if (!this.createType.valid) return;

    const formData = new FormData();
    formData.append('name', this.createType.value.name);
    formData.append('categoryId', this.createType.value.categoryId);

    if (this.selectedFile) formData.append('file', this.selectedFile);

    this._catogryTypeService.CreateCategoryType(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.loadAllCategoryTypes(); // ✅ refresh full list
          this.createType.reset();
          this.previewUrl = null;
          this.selectedFile = null;
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => this.toast.show('Failed to create category type.', 'error'),
    });
  }

  onDelete(id: number) {
    this._catogryTypeService.deleteCategoryType(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.loadAllCategoryTypes();
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => this.toast.show('Failed to delete category type.', 'error'),
    });
  }

  onEdit(categoryType: CategoryType): void {
    const dialogRef = this.dialog.open(EditCateogyTypeComponent, {
      data: {
        id: categoryType.id,
        name: categoryType.name,
        file: categoryType.fileUrl,
        categoryId: categoryType.categoryId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      if (result.file) formData.append('file', result.file);
      formData.append('categoryId', result.categoryId);

      this._catogryTypeService
        .updateCategoryType(result.id, formData)
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.toast.show(res.message, 'success');
              this.loadAllCategoryTypes();
            } else {
              this.toast.show(res.message, 'error');
            }
          },
          error: () =>
            this.toast.show('Failed to update category type.', 'error'),
        });
    });
  }
}
