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
  selector: 'app-service-explorer',
  templateUrl: './service-explorer.component.html',
  styleUrl: './service-explorer.component.scss'
})
export class ServiceExplorerComponent {
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

  constructor(
    private categoryService: CategoryService,
    private typeService: CategoryTypeService,
    private structureService: StructureService,
    private partService: PartService,
    private optionService: PartOptionService,
    private serviceService: ServiceService
  ) {}

  ngOnInit() {
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => this.categories = res.data?.categories ?? [],
    });
    console.log(this.categories)
  }

  selectCategory(cat: Category) {
    this.selectedCategory = cat;
    this.typeService.getTypesByCategory(cat.id!).subscribe({
      next: (res) => this.types = res.data?.categoryTypes ?? [],
    });
    this.clearAfter('category');
  }

  selectType(type: CategoryType) {
    this.selectedType = type;
    this.structureService.getStructuresByType(type.id).subscribe({
      next: (res) => this.structures = res.data?.structures ?? [],
    });
    this.clearAfter('type');
  }

  selectStructure(structure: Structure) {
    this.selectedStructure = structure;
    this.partService.getPartsByStructure(structure.id).subscribe({
      next: (res) => this.parts = res.data?.parts ?? [],
    });
    this.serviceService.getServicesByStructure(structure.id).subscribe({
      next: (res) => this.services = res.data?.services ?? [],
    });
    this.clearAfter('structure');
  }

  selectPart(part: Part) {
    this.selectedPart = part;
    this.optionService.getOptionsByPart(part.id).subscribe({
      next: (res) => this.partOptions = res.data?.partOptions ?? [],
    });
    this.serviceService.getServicesByPart(part.id).subscribe({
      next: (res) => this.services = res.data?.services ?? [],
    });
    this.clearAfter('part');
  }

  selectPartOption(option: PartOption) {
    this.selectedPartOption = option;
    this.serviceService.getServicesByPartOption(option.id).subscribe({
      next: (res) => this.services = res.data?.services ?? [],
    });
    this.clearAfter('option');
  }

  toggleService(service: ServiceResponse) {
    const idx = this.selectedServices.findIndex(s => s.id === service.id);
    if (idx >= 0) this.selectedServices.splice(idx, 1);
    else this.selectedServices.push(service);
    this.totalCost = this.selectedServices.reduce((sum, s) => sum + (s.baseCost ?? 0), 0);
  }

  isSelected(service: ServiceResponse) {
    return this.selectedServices.some(s => s.id === service.id);
  }

  clearAfter(level: 'category' | 'type' | 'structure' | 'part' | 'option') {
    if (level === 'category') this.types = this.structures = this.parts = this.partOptions = this.services = [];
    else if (level === 'type') this.structures = this.parts = this.partOptions = this.services = [];
    else if (level === 'structure') this.parts = this.partOptions = this.services = [];
    else if (level === 'part') this.partOptions = this.services = [];
    else if (level === 'option') this.services = [];
  }
}
