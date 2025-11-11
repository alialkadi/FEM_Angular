import { CategoryTypeService } from './../../../Services/categoryTypeService.service';
import { Component } from '@angular/core';
import { CategoryType, CreateCategoryType } from '../../../../Models/CategoryType';
import { Category } from '../../../../Models/Category';
import { CategoryService } from '../../../Services/CategoryService';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditCategoryDialogComponent } from '../../../../../shared/Dialogs/edit-category-dialog/edit-category-dialog.component';
import { EditCateogyTypeComponent } from '../../../../../shared/Dialogs/edit-cateogy-type-dialog/edit-cateogy-type.component';

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
  
  get totalPages(): number{
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(private dialog: MatDialog,private _catogryTypeService: CategoryTypeService, private categoryService: CategoryService) {
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
          console.log("from types here is categories",res)
          this.categories = res.data.categories;
          this.totalCount = res.data.totalCount;
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  loadCategoryTypes(): void{
     this._catogryTypeService.getAllCategoriestypes(false,this.pageIndex,this.pageSize).subscribe({
      next: (res) => {
         console.log(res);
         this.categoryTypes = res.data.categoryTypes;
         this.totalCount = res.data.totalCount;
          console.log(
          `Loaded page ${this.pageIndex} of ${this.totalPages} (totalCount=${this.totalCount})`
        );
      },
      error: (err) => {
        console.error('Error loading categoryTypes:', err)
      }
    })
  }

  onPageChange(newPage:number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageIndex = newPage;
      this.loadCategoryTypes();
    }
  }

  onPageSizeChange(event: Event):void {
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
          console.log('Created category type:', res);
          this.loadCategoryTypes();
          this.createType.reset();
          this.previewUrl = null;
          this.selectedFile = null;
        },
        error: (err) => {
          console.error('Error creating category type', err);
        },
      });
    }
  }


  onDelete(id: number) {
    this._catogryTypeService.deleteCategoryType(id).subscribe({
      next: (res) => {
        console.log("delete Type Success", res);
        this.loadCategoryTypes();
      },
      error: (err) => {
        console.log("delete Type Failed",err)
      }
    })
  }

    onEdit(categoryType: CategoryType): void {
      const dialogRef = this.dialog.open(EditCateogyTypeComponent, {
        data: { id: categoryType.id, name: categoryType.name, file: categoryType.fileUrl,categoryId: categoryType.categoryId }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const formData = new FormData();
          console.log("Fron update Formdata", result)
          formData.append('name', result.name);
          formData.append('file', result.file);
          formData.append('categoryId', result.categoryId);
          console.log("formdata after result", formData)
          this._catogryTypeService.updateCategoryType(result.id, formData).subscribe({
            next: (res) => {
              if (res.success) {
                console.log("formdata after result res", formData)
  
                const index = this.categoryTypes.findIndex(c => c.id === result.id);
                if (index !== -1) {
                  this.loadCategoryTypes()
                }
              }
            }
          });
        }
      });
    }
}
