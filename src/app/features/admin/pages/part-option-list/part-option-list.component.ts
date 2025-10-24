import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Part } from '../../../Models/Part.Models';
import { createUpdatePartOption, PartOption } from '../../../Models/PartOption.Model';
import { PartOptionService } from '../../Services/part-option-service.service';
import { PartService } from '../../Services/part-service.service';

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
    newPartOption: createUpdatePartOption = { name: '', mainPartId: 0 };
  
    get totalPage(): number{
      return Math.ceil(this.totalCount / this.pageSize) || 1;
    }
  
    constructor(private _PartOptionOptionservice: PartOptionService, private _partService : PartService){}
  
    ngOnInit(): void {
      this.loadPartOptionOptions();
      this.loadParts()
      
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
  
    onSave(form: any) {
      if (form.valid) {
        this.newPartOption = form.value;
        console.log(form)
      }
      this._PartOptionOptionservice.CreatePartOption(this.newPartOption).subscribe({
        next:(value) => {
          console.log(value)
          this.loadPartOptionOptions();
        },
        error: (err) => {
          console.log(err)
        }
      })
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

}
