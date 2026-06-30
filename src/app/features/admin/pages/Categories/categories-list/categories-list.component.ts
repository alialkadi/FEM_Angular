import { isPlatformBrowser } from '@angular/common';
import { Component } from '@angular/core';
import { CategoryService } from '../../../Services/CategoryService';
import { Category, CreateCategory } from '../../../../Models/Category';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditCategoryDialogComponent } from '../../../../../shared/Dialogs/edit-category-dialog/edit-category-dialog.component';
import { ToastService } from '../../../../../shared/Services/toast.service';
import { ConfirmDialogComponent } from '../../../../../shared/Dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss',
})
export class CategoriesListComponent {
  totalCount = 0;
  pageIndex = 1; // start at page 1
  pageSize = 15;
  pageSizes = [15, 25, 50, 100];
  categories: Category[] = [];
  newCategory: CreateCategory = { name: '' };
  sortingCategoryId: number | null = null;
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private toast: ToastService,
    private confirmDialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService
      .getAllCategories(false, this.pageIndex, this.pageSize)
      .subscribe({
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
        },
      });
  }

  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageIndex = newPage;
      this.loadCategories();
    }
  }

  onPageSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = +select.value;
    this.pageIndex = 1; // reset to first page
    this.loadCategories();
  }

  createForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
  });

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSave() {
    if (this.createForm.valid) {
      const formData = new FormData();
      formData.append('name', this.createForm.value.name);
      formData.append('description', this.createForm.value.description);
      console.log(this.createForm.value.description);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.categoryService.CreateCategory(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadCategories();
            this.createForm.reset();
            this.previewUrl = null;
            this.selectedFile = null;
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.toast.show('Failed to create category.', 'error');
        },
      });
    }
  }

  onDelete(id: number, name: string) {
    const confirmRef = this.confirmDialog.open(ConfirmDialogComponent, {
      width: `350px`,
      data: { message: `Are you sure you want to delete "${name}"` },
    });
    confirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.categoryService.DeleteCategory(id).subscribe({
          next: (res) => {
            if (res.success) {
              this.toast.show(res.message, 'success');
              this.loadCategories();
            } else {
              this.toast.show(res.message, 'error');
            }
          },
          error: () => {
            this.toast.show('Failed to delete category.', 'error');
          },
        });
      }
    });
  }

  onEdit(category: Category): void {
    const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
      data: {
        id: category.id,
        name: category.name,
        file: category.fileUrl,
        description: category.description,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      console.log(result);
      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('file', result.file);
      formData.append('description', result.description);

      this.categoryService.updateCategory(result.id, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toast.show(res.message, 'success');
            this.loadCategories();
          } else {
            this.toast.show(res.message, 'error');
          }
        },
        error: () => {
          this.toast.show('Failed to update category.', 'error');
        },
      });
    });
  }

  isFirstCategory(index: number): boolean {
    return this.pageIndex === 1 && index === 0;
  }

  isLastCategory(index: number): boolean {
    return (
      this.pageIndex === this.totalPages && index === this.categories.length - 1
    );
  }

  moveUp(category: Category, index: number): void {
    if (this.isFirstCategory(index)) return;

    this.sortingCategoryId = category.id;

    this.categoryService.moveUp(category.id).subscribe({
      next: (res) => {
        console.log(res);
        this.sortingCategoryId = null;
        if (res.success) {
          this.loadCategories();
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => {
        this.sortingCategoryId = null;
        this.toast.show('Failed to move category up.', 'error');
      },
    });
  }
  moveDown(category: Category, index: number): void {
    if (this.isLastCategory(index)) return;

    this.sortingCategoryId = category.id;

    this.categoryService.moveDown(category.id).subscribe({
      next: (res) => {
        this.sortingCategoryId = null;

        if (res.success) {
          this.loadCategories();
        } else {
          this.toast.show(res.message, 'error');
        }
      },
      error: () => {
        this.sortingCategoryId = null;
        this.toast.show('Failed to move category down.', 'error');
      },
    });
  }
}
