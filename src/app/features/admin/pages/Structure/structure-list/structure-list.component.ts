import { Component } from '@angular/core';
import { createUpdateStructure, Structure } from '../../../../Models/Structure.Model';
import { CategoryType } from '../../../../Models/CategoryType';
import { StructureService } from '../../../Services/structure-service.service';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EditStructureDialogComponent } from '../../../../../shared/Dialogs/edit-structure-dialog/edit-structure-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../../Services/CategoryService';
import { Category } from '../../../../Models/Category';
import { MetadataTargetType } from '../../../../Models/MetadataTargetType';

@Component({
  selector: 'app-structure-list',
  templateUrl: './structure-list.component.html',
  styleUrl: './structure-list.component.scss'
})
export class StructureListComponent {
selectedStructureForMetadata: any | null = null;
MetadataTargetType = MetadataTargetType; // expose enum to template

  totalCount = 0;
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];
  structures: Structure[] = []
  categoryTypes: CategoryType[] = [];
  newStructure: createUpdateStructure = { name: '', typeId: 0 };
  categories: Category[] = [];
  get totalPage(): number{
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(private dialog: MatDialog,
    private _structureService: StructureService,
    private _categoryTypeService: CategoryTypeService,
    private _categoryServie : CategoryService) { }

  ngOnInit(): void {
    this.loadStructures();
    this.loadCategories()
    
  }
  loadCategories() {
    this._categoryServie.getAllCategories(true).subscribe({
      next: (res) => {
        console.log("Categories From Structure", res)
        this.categories = res.data.categories;
      }
    })
  }
openMetadata(structure: any): void {
  this.selectedStructureForMetadata = structure;
}

closeMetadata(): void {
  this.selectedStructureForMetadata = null;
}

  onCategoryChange(event: Event) {
    console.log("changing category from structure ", event);
    console.log("event target form strucutre ", event.target);
    const categoryId = Number((event.target as HTMLSelectElement)?.value);
    if (!categoryId) return;

    this._categoryTypeService.getTypesByCategory(categoryId).subscribe({
      next: (res) => {
        console.log(`Fetching types by category id: ${categoryId}`, res);
        if (res.success && res.data) {
          this.categoryTypes = res.data.categoryTypes;
        }
      }
    })
  }

  loadCategoryTypes(): void{
     this._categoryTypeService.getAllCategoriestypes(true).subscribe({
      next: (res) => {
         console.log(res);
         this.categoryTypes = res.data.categoryTypes;
         this.totalCount = res.data.totalCount;
          
      },
      error: (err) => {
        console.error('Error loading categoryTypes:', err)
      }
    })
  }
  loadStructures(): void{
    this._structureService.getAllStructures(false, this.pageIndex, this.pageSize).subscribe({
      next: (res) => {
        console.log(res)
        this.structures = res.data.structures
        this.totalCount = res.data.totalCount
      },
      error(err) {
          console.log(err)
      },
    })
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPage) {
      this.pageIndex = newPage;
      this.loadStructures();
    }
  }
  onPageSizeChange(event: Event):void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = +select.value;
    this.pageIndex = 1;
    this.loadStructures();
  }
      
  crateForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    typeId: new FormControl('')
  })
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
   if (this.crateForm.valid) {
      const formData = new FormData();
      formData.append('name', this.crateForm.value.name);
      formData.append('typeId', this.crateForm.value.typeId);
      if (this.selectedFile) {
        formData.append('file',this.selectedFile)
      }
      this._structureService.CreateStructure(formData).subscribe({
        next:(value) => {
          console.log(value)
          this.loadStructures();
          this.crateForm.reset();
          this.previewUrl = null;
          this.selectedFile = null;
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }
  onEdit(structure: Structure): void {
    console.log(structure )
      const dialogRef = this.dialog.open(EditStructureDialogComponent, {
        data: { id: structure.id, name: structure.name, file: structure.fileUrl, typeId: structure.typeId }
        
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const formData = new FormData();
          console.log("Fron update Formdata", result)
          formData.append('name', result.name);
          formData.append('file', result.file);
          formData.append('typeId', result.typeId);
          console.log("formdata after result", formData)
          this._structureService.updateStructure(result.id, formData).subscribe({
            next: (res) => {
              if (res.success) {
                console.log("formdata after result res", formData)
  
                const index = this.structures.findIndex(c => c.id === result.id);
                if (index !== -1) {
                  this.loadStructures()
                }
              }
            }
          });
        }
      });
    }
  onDelete(id: number) {
    this._structureService.deleteStructure(id).subscribe({
      next: (res) => {
        console.log("delete structure Success", res);
        this.loadCategoryTypes();
        this.loadStructures()
      },
      error: (err) => {
        console.log("delete structure Failed",err)
      }
    })
  }
}
