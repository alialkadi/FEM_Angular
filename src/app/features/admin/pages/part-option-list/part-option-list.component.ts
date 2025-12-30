import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Part } from '../../../Models/Part.Models';
import { PartOption, createUpdatePartOption } from '../../../Models/PartOption.Model';
import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { Structure } from '../../../Models/Structure.Model';
import { MetadataTargetType } from '../../../Models/MetadataTargetType';

import { PartOptionService } from '../../Services/part-option-service.service';
import { PartService } from '../../Services/part-service.service';
import { CategoryService } from '../../Services/CategoryService';
import { CategoryTypeService } from '../../Services/categoryTypeService.service';
import { StructureService } from '../../Services/structure-service.service';
import { EditPartOptionDialogComponent } from '../../../../shared/Dialogs/edit-part-option-dialog/edit-part-option-dialog.component';

@Component({
  selector: 'app-part-option-list',
  templateUrl: './part-option-list.component.html',
  styleUrl: './part-option-list.component.scss'
})
export class PartOptionListComponent implements OnInit {

  // ================= METADATA =================
  selectedPartOptionForMetadata: PartOption | null = null;
  MetadataTargetType = MetadataTargetType;

  // ================= TABLE =================
  PartOptions: PartOption[] = [];
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];
  totalCount = 0;

  // ================= FORM =================
  crateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    mainPartId: new FormControl('')
  });

  Parts: Part[] = [];
  Structures: Structure[] = [];
  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private partOptionService: PartOptionService,
    private partService: PartService,
    private structureService: StructureService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPartOptions();
    this.loadCategories();
  }

  // ================= METADATA =================
  openMetadata(option: PartOption): void {
    this.selectedPartOptionForMetadata = option;
  }

  closeMetadata(): void {
    this.selectedPartOptionForMetadata = null;
  }

  // ================= LOADERS =================
  loadPartOptions(): void {
    this.partOptionService
      .getAllPartOptions(false, this.pageIndex, this.pageSize)
      .subscribe(res => {
        this.PartOptions = res.data.partOptions;
        this.totalCount = res.data.totalCount;
      });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories(true).subscribe(res => {
      this.categories = res.data.categories;
    });
  }

  onCategoryChange(event: Event): void {
    const categoryId = +(event.target as HTMLSelectElement).value;
    if (!categoryId) return;

    this.categoryTypeService.getTypesByCategory(categoryId).subscribe(res => {
      this.categoryTypes = res.data.categoryTypes;
    });
  }

  onCategoryTypeChange(event: Event): void {
    const typeId = +(event.target as HTMLSelectElement).value;
    if (!typeId) return;

    this.structureService.getStructuresByType(typeId).subscribe(res => {
      this.Structures = res.data.structures;
    });
  }

  onStructureChange(event: Event): void {
    const structureId = +(event.target as HTMLSelectElement).value;
    if (!structureId) return;

    this.partService.getPartsByStructure(structureId).subscribe(res => {
      this.Parts = res.data.parts;
    });
  }

  // ================= CRUD =================
  onSave(): void {
    if (!this.crateForm.valid) return;

    const formData = new FormData();
    formData.append('name', this.crateForm.value.name!);
    formData.append('mainPartId', this.crateForm.value.mainPartId!);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.partOptionService.CreatePartOption(formData).subscribe(() => {
      this.loadPartOptions();
      this.crateForm.reset();
      this.previewUrl = null;
      this.selectedFile = null;
    });
  }

  onDelete(id: number): void {
    this.partOptionService.deletePartOption(id).subscribe(() => {
      this.loadPartOptions();
    });
  }

  onEdit(option: PartOption): void {
    const dialogRef = this.dialog.open(EditPartOptionDialogComponent, {
      data: option
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('mainPartId', result.mainPartId);
      if (result.file) formData.append('file', result.file);

      this.partOptionService.updatePartOption(result.id, formData)
        .subscribe(() => this.loadPartOptions());
    });
  }

  // ================= UI =================
  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (!this.selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPage) return;
    this.pageIndex = page;
    this.loadPartOptions();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.pageIndex = 1;
    this.loadPartOptions();
  }

  get totalPage(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }
}
