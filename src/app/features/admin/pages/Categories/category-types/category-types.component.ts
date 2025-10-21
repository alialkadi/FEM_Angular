import { Component } from '@angular/core';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { CategoryType, CreateCategoryType } from '../../../../Models/CategoryType';
import { Category } from '../../../../Models/Category';
import { CategoryService } from '../../../Services/CategoryService';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

  constructor(private _catogryTypeService: CategoryTypeService, private categoryService: CategoryService) {
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
}
