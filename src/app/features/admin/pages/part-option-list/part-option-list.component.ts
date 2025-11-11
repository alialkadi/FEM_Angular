import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Part } from '../../../Models/Part.Models';
import { createUpdatePartOption, PartOption } from '../../../Models/PartOption.Model';
import { PartOptionService } from '../../Services/part-option-service.service';
import { PartService } from '../../Services/part-service.service';
import { EditPartOptionDialogComponent } from '../../../../shared/Dialogs/edit-part-option-dialog/edit-part-option-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../Services/CategoryService';
import { CategoryTypeService } from '../../Services/categoryTypeService.service';
import { StructureService } from '../../Services/structure-service.service';
import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { Structure } from '../../../Models/Structure.Model';

@Component({
 selector: 'app-part-option-list',
  templateUrl: './part-option-list.component.html',
  styleUrl: './part-option-list.component.scss'
})
export class PartOptionListComponent {

  totalCount = 0;
    pageIndex = 1;
    pageSize = 5;
    pageSizes = [5, 10, 25];
    PartOptions: PartOption[] = []
  Parts: Part[] = [];
   Structures: Structure[] = [];
    categories: Category[] = [];
    categoryTypes: CategoryType[] = [];
    newPartOption: createUpdatePartOption = { name: '', mainPartId: 0 };
  
    get totalPage(): number{
      return Math.ceil(this.totalCount / this.pageSize) || 1;
    }
  
  constructor(private dialog: MatDialog,
    private _PartOptionOptionservice: PartOptionService,
    private _partService: PartService,
    private _StructureService: StructureService,
    private _categoryService: CategoryService,
    private _categoryTypeService: CategoryTypeService,) { }
  
    ngOnInit(): void {
      this.loadPartOptionOptions();
      this.loadCategories()
      
    }
   loadCategories() {
    this._categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        console.log("Categories From Structure", res)
        this.categories = res.data.categories;
      }
    })
  }
  
  onCategoryChange(event: Event) {
    console.log("changing category from part ", event);
    console.log("event target form part ", event.target);
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
  onCategoryTypeChange(event: Event) {
    console.log("changing category from part ", event);
    console.log("event target form part ", event.target);
    const categoryTypeId = Number((event.target as HTMLSelectElement)?.value);
    if (!categoryTypeId) return;

    this._StructureService.getStructuresByType(categoryTypeId).subscribe({
      next: (res) => {
        console.log(`Fetching types by category id: ${categoryTypeId}`, res);
        if (res.success && res.data) {
          this.Structures = res.data.structures;
        }
      }
    })
  }
  onStructureChange(event: Event) {
    console.log("changing category from part ", event);
    console.log("event target form part ", event.target);
    const strucutreId = Number((event.target as HTMLSelectElement)?.value);
    if (!strucutreId) return;

    this._partService.getPartsByStructure(strucutreId).subscribe({
      next: (res) => {
        console.log(`Fetching types by category id: ${strucutreId}`, res);
        if (res.success && res.data) {
          this.Parts = res.data.parts;
        }
      }
    })
  }
    loadParts(): void{
       this._partService.getAllParts(true).subscribe({
        next: (res) => {
           console.log(res);
           this.Parts = res.data.parts;
           this.totalCount = res.data.totalNumber;
           console.log(this.Parts)
            
        },
        error: (err) => {
          console.error('Error loading Parts:', err)
        }
      })
    }
    loadPartOptionOptions(): void{
      this._PartOptionOptionservice.getAllPartOptions(false, this.pageIndex, this.pageSize).subscribe({
        next: (res) => {
          console.log(res.data.partOptions)
          this.PartOptions = res.data.partOptions
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
        this.loadPartOptionOptions();
      }
    }
    onPageSizeChange(event: Event):void {
      const select = event.target as HTMLSelectElement;
      this.pageSize = +select.value;
      this.pageIndex = 1;
      this.loadPartOptionOptions();
    }
        
    crateForm: FormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      mainPartId: new FormControl('')
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
      formData.append('mainPartId', this.crateForm.value.mainPartId);
      if (this.selectedFile) {
        formData.append('file',this.selectedFile)
      }
        this._PartOptionOptionservice.CreatePartOption(formData).subscribe({
          next:(value) => {
            console.log(value)
            this.loadPartOptionOptions();
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
  
    onDelete(id: number) {
      this._PartOptionOptionservice.deletePartOption(id).subscribe({
        next: (res) => {
          console.log("delete PartOption Success", res);
          this.loadParts();
          this.loadPartOptionOptions()
        },
        error: (err) => {
          console.log("delete PartOption Failed",err)
        }
      })
    }
onEdit(partOption: PartOption): void {
      const dialogRef = this.dialog.open(EditPartOptionDialogComponent, {
        data: { id: partOption.id, name: partOption.name, file: partOption.fileUrl,mainPartId: partOption.mainPartId }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const formData = new FormData();
          console.log("Fron update Formdata", result)
          formData.append('name', result.name);
          formData.append('file', result.file);
          formData.append('mainPartId', result.mainPartId);
          console.log("formdata after result", formData)
          this._PartOptionOptionservice.updatePartOption(result.id, formData).subscribe({
            next: (res) => {
              if (res.success) {
                console.log("formdata after result res", formData)
  
                const index = this.PartOptions.findIndex(c => c.id === result.id);
                if (index !== -1) {
                  this.loadPartOptionOptions()
                }
              }
            }
          });
        }
      });
    }
}
