import { Component } from '@angular/core';
import { createUpdateStructure, Structure } from '../../../../Models/Structure.Model';
import { CategoryType } from '../../../../Models/CategoryType';
import { StructureService } from '../../../Services/structure-service.service';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-structure-list',
  templateUrl: './structure-list.component.html',
  styleUrl: './structure-list.component.scss'
})
export class StructureListComponent {

  totalCount = 0;
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];
  structures: Structure[] = []
  categoryTypes: CategoryType[] = [];
  newStructure: createUpdateStructure = { name: '', typeId: 0 };

  get totalPage(): number{
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }

  constructor(private _structureService: StructureService, private _categoryTypeService : CategoryTypeService){}

  ngOnInit(): void {
    this.loadStructures();
    this.loadCategoryTypes()
    
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

  onSave(form: any) {
    if (form.valid) {
      this.newStructure = form.value;
      console.log(form)
    }
    this._structureService.CreateStructure(this.newStructure).subscribe({
      next:(value) => {
        console.log(value)
        this.loadStructures();
      },
      error: (err) => {
        console.log(err)
      }
    })
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
