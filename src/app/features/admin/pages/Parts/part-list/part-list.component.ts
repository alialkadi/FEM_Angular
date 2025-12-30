import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { Part, createUpdatePart } from '../../../../Models/Part.Models';
import { Structure } from '../../../../Models/Structure.Model';
import { Category } from '../../../../Models/Category';
import { CategoryType } from '../../../../Models/CategoryType';
import { MetadataTargetType } from '../../../../Models/MetadataTargetType';

import { PartService } from '../../../Services/part-service.service';
import { StructureService } from '../../../Services/structure-service.service';
import { CategoryService } from '../../../Services/CategoryService';
import { CategoryTypeService } from '../../../Services/categoryTypeService.service';
import { EditPartDialogComponent } from '../../../../../shared/Dialogs/edit-part-dialog/edit-part-dialog.component';

@Component({
  selector: 'app-part-list',
  templateUrl: './part-list.component.html',
  styleUrl: './part-list.component.scss'
})
export class PartListComponent implements OnInit {

  // ================= METADATA =================
  selectedPartForMetadata: Part | null = null;
  MetadataTargetType = MetadataTargetType;

  // ================= TABLE =================
  Parts: Part[] = [];
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 25];
  totalCount = 0;

  // ================= FORM =================
  crateForm = new FormGroup({
    name: new FormControl('', Validators.required),
    structureId: new FormControl('')
  });

  Structures: Structure[] = [];
  categories: Category[] = [];
  categoryTypes: CategoryType[] = [];

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private partService: PartService,
    private structureService: StructureService,
    private categoryService: CategoryService,
    private categoryTypeService: CategoryTypeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadParts();
    this.loadCategories();
  }

  // ================= METADATA =================
  openMetadata(part: Part): void {
    this.selectedPartForMetadata = part;
  }

  closeMetadata(): void {
    this.selectedPartForMetadata = null;
  }

  // ================= LOADERS =================
  loadParts(): void {
    this.partService.getAllParts(false, this.pageIndex, this.pageSize).subscribe(res => {
      this.Parts = res.data.parts;
      this.totalCount = res.data.totalNumber;
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

  // ================= CRUD =================
  onSave(): void {
    if (!this.crateForm.valid) return;

    const formData = new FormData();
    formData.append('name', this.crateForm.value.name!);
    formData.append('structureId', this.crateForm.value.structureId!);

    if (this.selectedFile)
      formData.append('file', this.selectedFile);

    this.partService.CreatePart(formData).subscribe(() => {
      this.loadParts();
      this.crateForm.reset();
      this.previewUrl = null;
      this.selectedFile = null;
    });
  }

  onDelete(id: number): void {
    this.partService.deletePart(id).subscribe(() => this.loadParts());
  }

  onEdit(part: Part): void {
    const dialogRef = this.dialog.open(EditPartDialogComponent, {
      data: part
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const formData = new FormData();
      formData.append('name', result.name);
      formData.append('structureId', result.structureId);
      if (result.file) formData.append('file', result.file);

      this.partService.updatePart(result.id, formData)
        .subscribe(() => this.loadParts());
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
    this.loadParts();
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = +(event.target as HTMLSelectElement).value;
    this.pageIndex = 1;
    this.loadParts();
  }

  get totalPage(): number {
    return Math.ceil(this.totalCount / this.pageSize) || 1;
  }
}
