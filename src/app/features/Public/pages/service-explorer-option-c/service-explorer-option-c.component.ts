import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CategoryService } from '../../../admin/Services/CategoryService';
import { CategoryTypeService } from '../../../admin/Services/categoryTypeService.service';
import { ServiceService } from '../../../admin/Services/service-service.service';
import { MetadataExplorerService, ExplorerItem, MetadataFilter } from '../../../admin/Services/MetadataExplorerService.service';

import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { Structure } from '../../../Models/Structure.Model';
import { Part } from '../../../Models/Part.Models';
import { PartOption } from '../../../Models/PartOption.Model';
import { ServiceResponse } from '../../../Models/service.Model';

@Component({
  selector: 'app-service-explorer-option-c',
  templateUrl: './service-explorer-option-c.component.html',
  styleUrls: ['./service-explorer-option-c.component.scss']
})
export class ServiceExplorerOptionCComponent implements OnInit {

  // ===============================
  // DATA
  // ===============================
  categories: Category[] = [];
  types: CategoryType[] = [];

  structures: Structure[] = [];
  parts: Part[] = [];
  options: PartOption[] = [];

  services: ServiceResponse[] = [];

  // ===============================
  // EXPLORER RAW ITEMS
  // ===============================
  structureItems: ExplorerItem[] = [];
  partItems: ExplorerItem[] = [];
  optionItems: ExplorerItem[] = [];

  // ===============================
  // FILTERS
  // ===============================
  structureFilters: MetadataFilter[] = [];
  partFilters: MetadataFilter[] = [];
  optionFilters: MetadataFilter[] = [];

  selectedStructureFilters: Record<string, string[]> = {};
  selectedPartFilters: Record<string, string[]> = {};
  selectedOptionFilters: Record<string, string[]> = {};

  // ===============================
  // SELECTION
  // ===============================
  selectedCategory?: Category;
  selectedType?: CategoryType;
  selectedStructure?: Structure;
  selectedPart?: Part;
  selectedOption?: PartOption;

  selectedServices: ServiceResponse[] = [];
  totalCost = 0;

  constructor(
    private categoryService: CategoryService,
    private typeService: CategoryTypeService,
    private metadataExplorer: MetadataExplorerService,
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ===============================
  // LOADERS
  // ===============================
  loadCategories() {
    this.categoryService.getAllCategories(true).subscribe(res => {
      this.categories = res.data?.categories ?? [];
    });
  }

  selectCategory(c: Category) {
    this.resetAll();
    this.selectedCategory = c;

    this.typeService.getTypesByCategory(c.id!).subscribe(res => {
      this.types = res.data?.categoryTypes ?? [];
    });
  }

  selectType(t: CategoryType) {
    this.resetBelow('type');
    this.selectedType = t;

    this.metadataExplorer.getStructuresExplorer(t.id).subscribe(res => {
      this.structureFilters = res.filters;
      this.structureItems = res.items;
      this.applyStructureFilters();
    });
  }

  selectStructure(s: Structure) {
    this.resetBelow('structure');
    this.selectedStructure = s;

    this.metadataExplorer.getPartsExplorer(s.id).subscribe(res => {
      this.partFilters = res.filters;
      this.partItems = res.items;
      this.applyPartFilters();
    });

    this.loadServices('structure', s.id);
  }

  selectPart(p: Part) {
    this.resetBelow('part');
    this.selectedPart = p;

    this.metadataExplorer.getPartOptionsExplorer(p.id).subscribe(res => {
      this.optionFilters = res.filters;
      this.optionItems = res.items;
      this.applyOptionFilters();
    });

    this.loadServices('part', p.id);
  }

  selectOption(o: PartOption) {
    this.selectedOption = o;
    this.loadServices('option', o.id);
  }

  // ===============================
  // FILTERING
  // ===============================
  toggleFilter(scope: 'structure' | 'part' | 'option', code: string, value: string) {
    const map =
      scope === 'structure'
        ? this.selectedStructureFilters
        : scope === 'part'
        ? this.selectedPartFilters
        : this.selectedOptionFilters;

    map[code] ??= [];
    const idx = map[code].indexOf(value);
    idx >= 0 ? map[code].splice(idx, 1) : map[code].push(value);

    scope === 'structure'
      ? this.applyStructureFilters()
      : scope === 'part'
      ? this.applyPartFilters()
      : this.applyOptionFilters();
  }

  private applyStructureFilters() {
    this.structures = this.filterItems(this.structureItems, this.selectedStructureFilters)
      .map(i => ({ id: i.id, name: i.name, fileUrl: i.fileUrl })) as Structure[];
  }

  private applyPartFilters() {
    this.parts = this.filterItems(this.partItems, this.selectedPartFilters)
      .map(i => ({ id: i.id, name: i.name, fileUrl: i.fileUrl })) as Part[];
  }

  private applyOptionFilters() {
    this.options = this.filterItems(this.optionItems, this.selectedOptionFilters)
      .map(i => ({ id: i.id, name: i.name, fileUrl: i.fileUrl })) as PartOption[];
  }

  private filterItems(items: ExplorerItem[], selected: Record<string, string[]>) {
    if (!items?.length) return [];
    return items.filter(item =>
      Object.entries(selected).every(([code, values]) =>
        !values.length ||
        item.metadata?.some(m => m.attributeCode === code && values.includes(m.value ?? ''))
      )
    );
  }

  // ===============================
  // SERVICES
  // ===============================
  loadServices(level: 'structure' | 'part' | 'option', id: number) {
    const call =
      level === 'structure'
        ? this.serviceService.getServicesByStructure(id)
        : level === 'part'
        ? this.serviceService.getServicesByPart(id)
        : this.serviceService.getServicesByPartOption(id);

    call.subscribe(res => {
      this.services = res.data?.services ?? [];
      this.services.forEach(s => this.loadServiceTotal(s));
    });
  }

  loadServiceTotal(s: ServiceResponse) {
    this.serviceService.getCalculatedTotal(s.id).subscribe(res => {
      s.calculatedTotal = res.response?.total ?? s.baseCost;
    });
  }

  toggleService(s: ServiceResponse) {
    const idx = this.selectedServices.findIndex(x => x.id === s.id);
    idx >= 0 ? this.selectedServices.splice(idx, 1) : this.selectedServices.push(s);
    this.totalCost = this.selectedServices.reduce((sum, sv) => sum + (sv.calculatedTotal ?? 0), 0);
  }

  // ===============================
  // RESET
  // ===============================
  resetAll() {
    this.types = [];
    this.resetBelow('category');
    this.selectedCategory = undefined;
  }

  resetBelow(level: 'category' | 'type' | 'structure' | 'part') {
    if (level === 'category') this.selectedType = undefined;
    if (level === 'type') {
      this.structures = [];
      this.structureFilters = [];
      this.selectedStructureFilters = {};
    }
    if (level === 'structure') {
      this.parts = [];
      this.partFilters = [];
      this.selectedPartFilters = {};
    }
    if (level === 'part') {
      this.options = [];
      this.optionFilters = [];
      this.selectedOptionFilters = {};
    }
    this.services = [];
    this.selectedServices = [];
    this.totalCost = 0;
  }

  // ===============================
  // SUBMIT
  // ===============================
  requestServices() {
    this.router.navigate(
      ['/FenetrationMaintainence/Home/service-review'],
      { state: { selectedServices: this.selectedServices } }
    );
  }
}
