import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Part, createUpdatePart } from '../../../../Models/Part.Models';
import { PartService } from '../../../Services/part-service.service';
import { Structure } from '../../../../Models/Structure.Model';
import { StructureService } from '../../../Services/structure-service.service';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.scss'
})
export class PartListComponent {


  totalCount = 0;
    pageIndex = 1;
    pageSize = 5;
    pageSizes = [5, 10, 25];
    Parts: Part[] = []
    Structures: Structure[] = [];
    newPart: createUpdatePart = { name: '', id: 0 };
  
    get totalPage(): number{
      return Math.ceil(this.totalCount / this.pageSize) || 1;
    }
  
    constructor(private _PartService: PartService, private _StructureService : StructureService){}
  
    ngOnInit(): void {
      this.loadParts();
      this.loadStructures()
      
    }
  
    loadStructures(): void{
       this._StructureService.getAllStructures(true).subscribe({
        next: (res) => {
           console.log(res);
           this.Structures = res.data.structures;
           this.totalCount = res.data.totalCount;
           console.log(this.Structures)
            
        },
        error: (err) => {
          console.error('Error loading Structures:', err)
        }
      })
    }
    loadParts(): void{
      this._PartService.getAllParts(false, this.pageIndex, this.pageSize).subscribe({
        next: (res) => {
          console.log(res.data.parts)
          this.Parts = res.data.parts
          this.totalCount = res.data.totalNumber
        },
        error(err) {
            console.log(err)
        },
      })
    }
  
    onPageChange(newPage: number) {
      if (newPage >= 1 && newPage <= this.totalPage) {
        this.pageIndex = newPage;
        this.loadParts();
      }
    }
    onPageSizeChange(event: Event):void {
      const select = event.target as HTMLSelectElement;
      this.pageSize = +select.value;
      this.pageIndex = 1;
      this.loadParts();
    }
        
    crateForm: FormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      structureId: new FormControl('')
    })
  
    onSave(form: any) {
      if (form.valid) {
        this.newPart = form.value;
        console.log(form)
      }
      this._PartService.CreatePart(this.newPart).subscribe({
        next:(value) => {
          console.log(value)
          this.loadParts();
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  
    onDelete(id: number) {
      this._PartService.deletePart(id).subscribe({
        next: (res) => {
          console.log("delete Part Success", res);
          this.loadStructures();
          this.loadParts()
        },
        error: (err) => {
          console.log("delete Part Failed",err)
        }
      })
    }


}
