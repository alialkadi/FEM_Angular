import { Component } from '@angular/core';
import { CategoryService } from '../../../Services/CategoryService';
import { Category, CreateCategory } from '../../../../Models/Category';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditCategoryDialogComponent } from '../../../../../shared/Dialogs/edit-category-dialog/edit-category-dialog.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent {
 totalCount = 0;
pageIndex = 1;     // start at page 1
pageSize = 5;      // default per page
  pageSizes = [5, 10, 25]; // options
  categories: Category[] = [];
  newCategory: CreateCategory = { name: '' };

get totalPages(): number {
  return Math.ceil(this.totalCount / this.pageSize) || 1;
}
  constructor(private dialog: MatDialog,private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

loadCategories(): void {
  this.categoryService.getAllCategories(false,this.pageIndex, this.pageSize).subscribe({
    next: (res) => {
      if (res.success) {
        this.categories = res.data.categories;
        this.totalCount = res.data.totalCount;
console.log('Error loading categories:', this.categories)
        console.log(
          `Loaded page ${this.pageIndex} of ${this.totalPages} (totalCount=${this.totalCount})`
        );
      }
    },
    error: (err) => console.error('Error loading categories:', err)
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
    name: new FormControl('',Validators.required)
  })
  onSave(form: any) {
    if (form.valid) {
      this.newCategory = form.value;
    }
    this.categoryService.CreateCategory(this.newCategory).subscribe({
      next: (res) => {
        console.log("the create", this.newCategory)
        console.log("posting category", res)
        this.loadCategories();
      },
      error: (err) => {

        console.log("the create", form)
        console.log("error posting category", err)
      }
    })
  }

  onDelete(id: number) {
    this.categoryService.DeleteCategory(id).subscribe({
      next: (res) => {
        console.log(res)
        this.loadCategories()
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  
onEdit(category: Category): void {
  const dialogRef = this.dialog.open(EditCategoryDialogComponent, {
    width: '400px',
    maxWidth: '95vw',
  autoFocus: true,
    disableClose: true,
  panelClass: 'custom-dialog-container',
    data: { id: category.id, name: category.name }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.categoryService.updateCategory(result.id, { name: result.name } ).subscribe({
        next: (res) => {
          if (res.success) {
            const index = this.categories.findIndex(c => c.id === result.id);
            if (index !== -1) {
              this.loadCategories()
            }
          }
        }
      });
    }
  });
}
}
