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
  selector: 'app-service-explorer-option-a',
  templateUrl: './service-explorer-option-a.component.html',
  styleUrl: './service-explorer-option-a.component.scss'
})
export class ServiceExplorerOptionAComponent {
  categories: Category[] = [];
  types: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];
  services: ServiceResponse[] = [];

  // Selected nodes
  selectedCategory?: Category;
  selectedType?: CategoryType;
  selectedStructure?: Structure;
  selectedPart?: Part;
  selectedPartOption?: PartOption;

  // Service selection
  selectedServices: ServiceResponse[] = [];
  totalCost = 0;

  // UI state
  currentLevel: 'category' | 'type' | 'structure' | 'part' | 'partOption' | 'service' = 'category';
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
    this.loadCategories();
  }

  // --------------------------
  // LOADERS
  // --------------------------
  loadCategories() {
    this.loading = true;
    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        this.categories = res.data?.categories ?? [];
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  selectCategory(cat: Category) {
    this.selectedCategory = cat;
    this.clearAfter('category');
    this.loading = true;
    this.typeService.getTypesByCategory(cat.id!).subscribe({
      next: (res) => {
        this.types = res.data?.categoryTypes ?? [];
        this.loading = false;
        this.currentLevel = 'type';
      },
      error: () => (this.loading = false)
    });
  }

  selectType(type: CategoryType) {
    this.selectedType = type;
    this.clearAfter('type');
    this.loading = true;
    this.structureService.getStructuresByType(type.id).subscribe({
      next: (res) => {
        this.structures = res.data?.structures ?? [];
        this.loading = false;
        this.currentLevel = 'structure';
      },
      error: () => (this.loading = false)
    });
  }

  selectStructure(structure: Structure) {
    this.selectedStructure = structure;
    this.clearAfter('structure');
    this.loading = true;

    this.partService.getPartsByStructure(structure.id).subscribe({
      next: (res) => (this.parts = res.data?.parts ?? []),
      error: () => {}
    });

    this.serviceService.getServicesByStructure(structure.id).subscribe({
      next: (res) => {
        this.services = res.data?.services ?? [];
        this.loading = false;
        this.currentLevel = 'part';
      },
      error: () => (this.loading = false)
    });
  }

  selectPart(part: Part) {
    this.selectedPart = part;
    this.clearAfter('part');
    this.loading = true;
    this.optionService.getOptionsByPart(part.id).subscribe({
      next: (res) => (this.partOptions = res.data?.partOptions ?? []),
      error: () => {}
    });
    this.serviceService.getServicesByPart(part.id).subscribe({
      next: (res) => {
        this.services = res.data?.services ?? [];
        this.loading = false;
        this.currentLevel = 'partOption';
      },
      error: () => (this.loading = false)
    });
  }

  selectPartOption(option: PartOption) {
    this.selectedPartOption = option;
    this.clearAfter('option');
    this.loading = true;
    this.serviceService.getServicesByPartOption(option.id).subscribe({
      next: (res) => {
        this.services = res.data?.services ?? [];
        this.loading = false;
        this.currentLevel = 'service';
      },
      error: () => (this.loading = false)
    });
  }

  // --------------------------
  // SERVICE SELECTION
  // --------------------------
  toggleService(service: ServiceResponse) {
    const idx = this.selectedServices.findIndex((s) => s.id === service.id);
    if (idx >= 0) this.selectedServices.splice(idx, 1);
    else this.selectedServices.push(service);

    this.totalCost = this.selectedServices.reduce((sum, s) => sum + (s.baseCost ?? 0), 0);
  }

  isSelected(service: ServiceResponse) {
    return this.selectedServices.some((s) => s.id === service.id);
  }

  // --------------------------
  // UTILITIES
  // --------------------------
  clearAfter(level: 'category' | 'type' | 'structure' | 'part' | 'option') {
    if (level === 'category') this.types = this.structures = this.parts = this.partOptions = this.services = [];
    else if (level === 'type') this.structures = this.parts = this.partOptions = this.services = [];
    else if (level === 'structure') this.parts = this.partOptions = this.services = [];
    else if (level === 'part') this.partOptions = this.services = [];
    else if (level === 'option') this.services = [];
  }

goBack(level: 'category' | 'type' | 'structure' | 'part' | 'partOption' | 'service') {
  this.currentLevel = level;
}

  reset() {
    this.selectedCategory =
      this.selectedType =
      this.selectedStructure =
      this.selectedPart =
      this.selectedPartOption =
        undefined;
    this.services = [];
    this.selectedServices = [];
    this.totalCost = 0;
    this.currentLevel = 'category';
    this.loadCategories();
  }
}
