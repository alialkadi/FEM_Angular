import { Component } from '@angular/core';
import { CategoryService } from '../../../admin/Services/CategoryService';
import { CategoryTypeService } from '../../../admin/Services/categoryTypeService.service';
import { PartOptionService } from '../../../admin/Services/part-option-service.service';
import { PartService } from '../../../admin/Services/part-service.service';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { StructureService } from '../../../admin/Services/structure-service.service';
import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { Part } from '../../../Models/Part.Models';
import { PartOption } from '../../../Models/PartOption.Model';
import { ServiceResponse } from '../../../Models/service.Model';
import { Structure } from '../../../Models/Structure.Model';

@Component({
  selector: 'app-service-explorer-option-c',
  templateUrl: './service-explorer-option-c.component.html',
  styleUrl: './service-explorer-option-c.component.scss'
})
export class ServiceExplorerOptionCComponent {
 categories: Category[] = [];
  types: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];
  services: ServiceResponse[] = [];

  selectedCategory?: Category;
  selectedType?: CategoryType;
  selectedStructure?: Structure;
  selectedPart?: Part;
  selectedPartOption?: PartOption;

  selectedServices: ServiceResponse[] = [];
  totalCost = 0;
  loading = false;

  constructor(
    private categoryService: CategoryService,
    private typeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private optionService: PartOptionService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  // ---------------------- Loaders ----------------------
  private fetchCategories() {
    this.loading = true;
    this.categoryService.getAllCategories(true).subscribe({
      next: res => {
        this.categories = res.data?.categories ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  fetchTypes(categoryId: number) {
    this.typeService.getTypesByCategory(categoryId).subscribe({
      next: res => (this.types = res.data?.categoryTypes ?? [])
    });
  }

  fetchStructures(typeId: number) {
    this.structureService.getStructuresByType(typeId).subscribe({
      next: res => (this.structures = res.data?.structures ?? [])
    });
  }

  fetchParts(structureId: number) {
    this.partService.getPartsByStructure(structureId).subscribe({
      next: res => (this.parts = res.data?.parts ?? [])
    });
  }

  fetchPartOptions(partId: number) {
    this.optionService.getOptionsByPart(partId).subscribe({
      next: res => (this.partOptions = res.data?.partOptions ?? [])
    });
  }

  fetchServicesByStructure(structureId: number) {
    this.serviceService.getServicesByStructure(structureId).subscribe({
      next: res => (this.services = res.data?.services ?? [])
    });
  }

  fetchServicesByPart(partId: number) {
    this.serviceService.getServicesByPart(partId).subscribe({
      next: res => (this.services = res.data?.services ?? [])
    });
  }

  fetchServicesByPartOption(partOptionId: number) {
    this.serviceService.getServicesByPartOption(partOptionId).subscribe({
      next: res => (this.services = res.data?.services ?? [])
    });
  }

  // ---------------------- Selection ----------------------
  selectCategory(c: Category) {
    this.selectedCategory = c;
    this.types = this.structures = this.parts = this.partOptions = this.services = [];
    this.selectedType = this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.fetchTypes(c.id!);
  }

  selectType(t: CategoryType) {
    this.selectedType = t;
    this.structures = this.parts = this.partOptions = this.services = [];
    this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.fetchStructures(t.id);
  }

  selectStructure(s: Structure) {
    this.selectedStructure = s;
    this.parts = this.partOptions = [];
    this.selectedPart = this.selectedPartOption = undefined;
    this.fetchParts(s.id);
    this.fetchServicesByStructure(s.id);
  }

  selectPart(p: Part) {
    this.selectedPart = p;
    this.partOptions = [];
    this.selectedPartOption = undefined;
    this.fetchPartOptions(p.id);
    this.fetchServicesByPart(p.id);
  }

  selectPartOption(po: PartOption) {
    this.selectedPartOption = po;
    this.fetchServicesByPartOption(po.id);
  }

  toggleService(s: ServiceResponse) {
    const idx = this.selectedServices.findIndex(x => x.id === s.id);
    if (idx >= 0) this.selectedServices.splice(idx, 1);
    else this.selectedServices.push(s);
    this.totalCost = this.selectedServices.reduce((sum, sv) => sum + (sv.baseCost ?? 0), 0);
  }

  isSelected(s: ServiceResponse) {
    return this.selectedServices.some(x => x.id === s.id);
  }

  reset() {
    this.selectedCategory = this.selectedType = this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.types = this.structures = this.parts = this.partOptions = this.services = [];
    this.selectedServices = [];
    this.totalCost = 0;
    this.fetchCategories();
  }

  requestServices() {
    const payload = {
      category: this.selectedCategory,
      type: this.selectedType,
      structure: this.selectedStructure,
      part: this.selectedPart,
      partOption: this.selectedPartOption,
      services: this.selectedServices,
      total: this.totalCost
    };
    console.log('Request payload', payload);
  }
}
