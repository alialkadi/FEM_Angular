import { CategoryTypeService } from './../../../Services/categoryTypeService.service';
import { Component } from '@angular/core';
import { CategoryType, CreateCategoryType } from '../../../../Models/CategoryType';
import { Category } from '../../../../Models/Category';
import { CategoryService } from '../../../Services/CategoryService';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditCateogyTypeComponent } from '../../../../../shared/Dialogs/edit-cateogy-type/edit-cateogy-type.component';
import { ToastService } from '../../../../../shared/Services/toast.service';

@Component({
  selector: 'app-category-types',
  templateUrl: './category-types.component.html',
  styleUrl: './category-types.component.scss'
})
export class CategoryTypesComponent {

  createType: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  totalCount = 0;
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];

  categoryTypes: CategoryType[] = [];
  categories: Category[] = [];
  newType: CreateCategoryType = { name: '', categoryId: 0 };

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(
    private dialog: MatDialog,
    private _catogryTypeService: CategoryTypeService,
    private categoryService: CategoryService,
    private toast: ToastService
  ) {
    this.createType = new FormGroup({
      name: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loadCategoryTypes();
    this.loadCategories();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data.categories;
          this.totalCount = res.data.totalCount;
          this.toast.show(res.message, 'success');
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => {
        this.toast.show('Failed to load categories.', 'error');
      }
    });
  }

  loadCategoryTypes(): void {
    this._catogryTypeService
      .getAllCategoriestypes(false, this.pageIndex, this.pageSize)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.categoryTypes = res.data.categoryTypes;
            this.totalCount = res.data.totalCount;
            // this.toast.show(res.message, 'success');
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.toast.show('Failed to load category types.', 'error');
        }
      });
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageIndex = newPage;
      this.loadCategoryTypes();
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = +select.value;
    this.pageIndex = 1;
    this.loadCategoryTypes();
  }

  onSave() {
    if (this.createType.valid) {
      const formData = new FormData();
      formData.append('name', this.createType.value.name);
      formData.append('categoryId', this.createType.value.categoryId);

      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this._catogryTypeService.CreateCategoryType(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadCategoryTypes();
            this.createType.reset();
            this.previewUrl = null;
            this.selectedFile = null;
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.toast.show('Failed to create category type.', 'error');
        },
      });
    }
  }

  onDelete(id: number) {
    this._catogryTypeService.deleteCategoryType(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.show(res.message, 'success');
          this.loadCategoryTypes();
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => {
        this.toast.show('Failed to delete category type.', 'error');
      }
    });
  }

  onEdit(categoryType: CategoryType): void {
    const dialogRef = this.dialog.open(EditCateogyTypeComponent, {
      data: {
        id: categoryType.id,
        name: categoryType.name,
        file: categoryType.fileUrl,
        categoryId: categoryType.categoryId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('file', result.file);
      formData.append('categoryId', result.categoryId);

      this._catogryTypeService.updateCategoryType(result.id, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadCategoryTypes();
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.toast.show('Failed to update category type.', 'error');
        }
      });
    });
  }
}
