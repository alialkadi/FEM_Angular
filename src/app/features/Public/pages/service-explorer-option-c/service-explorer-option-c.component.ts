import { Router } from '@angular/router';
import { Component, OnInit } from "@angular/core";
import { CategoryService } from "../../../admin/Services/CategoryService";
import { CategoryTypeService } from "../../../admin/Services/categoryTypeService.service";
import { ExplorerItem, MetadataFilter, ExplorerItemType, MetadataExplorerService, ServiceExplorerRequest } from "../../../admin/Services/MetadataExplorerService.service";
import { Category } from "../../../Models/Category";
import { CategoryType } from "../../../Models/CategoryType";
interface ExplorerCrumb {
  label: string;
  level: 'category' | 'type' | 'structure' | 'part' | 'option';
}

@Component({
  selector: 'app-service-explorer-option-c',
  templateUrl: './service-explorer-option-c.component.html',
  styleUrls: ['./service-explorer-option-c.component.scss']
})
export class ServiceExplorerOptionCComponent implements OnInit {

  categories: Category[] = [];
  types: CategoryType[] = [];

  selectedCategory?: Category;
  selectedType?: CategoryType;

  structureId?: number;
  partId?: number;
  optionId?: number;

  explorerItems: ExplorerItem[] = [];
  filters: MetadataFilter[] = [];

  selectedFilters: Record<string, number[]> = {};
  selectedServices: ExplorerItem[] = [];

  ExplorerItemType = ExplorerItemType; // 👈 expose enum to template

  constructor(
    private categoryService: CategoryService,
    private typeService: CategoryTypeService,
    private explorerService: MetadataExplorerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories(true).subscribe(r => {
      this.categories = r.data?.categories ?? [];
    });
  }

  selectCategory(c: Category) {
    this.resetAll();
    this.selectedCategory = c;

    this.typeService.getTypesByCategory(c.id!)
      .subscribe(r => {
        this.types = r.data?.categoryTypes ?? [];
      });
  }

  selectType(t: CategoryType) {
    this.resetBelow('type');
    this.selectedType = t;
    this.loadExplorer();
  }

  selectItem(item: ExplorerItem) {
    switch (item.itemType) {

      case ExplorerItemType.Structure:
        this.resetBelow('structure');
        this.structureId = item.id;
        break;

      case ExplorerItemType.Part:
        this.resetBelow('part');
        this.partId = item.id;
        break;

      case ExplorerItemType.PartOption:
        this.optionId = item.id;
        this.selectedFilters = {};
        break;

      case ExplorerItemType.Service:
        this.toggleService(item);
        return;
    }

    this.loadExplorer();
  }

  loadExplorer() {
    if (!this.selectedType) return;

    const request: ServiceExplorerRequest = {
      categoryTypeId: this.selectedType.id,
      structureId: this.structureId,
      partId: this.partId,
      partOptionId: this.optionId,
      metadataFilters: this.buildMetadataFilters()
    };

    this.explorerService.explore(request).subscribe({
      next: res => {
        this.explorerItems = res?.items ?? [];
        this.filters = res?.filters ?? [];
        console.log(res)
      },
      error: _ => {
        this.explorerItems = [];
        this.filters = [];
      }
    });
  }

  buildMetadataFilters() {
    return Object.entries(this.selectedFilters)
      .filter(([_, values]) => values.length)
      .map(([code, values]) => ({
        attributeCode: code,
        valueIds: values
      }));
  }

  toggleFilter(code: string, valueId: number) {
    this.selectedFilters[code] ??= [];

    const idx = this.selectedFilters[code].indexOf(valueId);
    idx >= 0
      ? this.selectedFilters[code].splice(idx, 1)
      : this.selectedFilters[code].push(valueId);

    this.loadExplorer();
  }

  get structures() {
    return this.explorerItems.filter(i => i.itemType === ExplorerItemType.Structure);
  }

  get parts() {
    return this.explorerItems.filter(i => i.itemType === ExplorerItemType.Part);
  }

  get options() {
    return this.explorerItems.filter(i => i.itemType === ExplorerItemType.PartOption);
  }

  get services() {
    return this.explorerItems.filter(i => i.itemType === ExplorerItemType.Service);
  }

  toggleService(service: ExplorerItem) {
    const idx = this.selectedServices.findIndex(s => s.id === service.id);
    idx >= 0
      ? this.selectedServices.splice(idx, 1)
      : this.selectedServices.push(service);
  }

  isServiceSelected(service: ExplorerItem): boolean {
    return this.selectedServices.some(s => s.id === service.id);
  }

  resetAll() {
    this.types = [];
    this.selectedCategory = undefined;
    this.resetBelow('category');
  }

  resetBelow(level: 'category' | 'type' | 'structure' | 'part') {
    if (level === 'category') this.selectedType = undefined;
    if (level === 'type') this.structureId = undefined;
    if (level === 'structure') this.partId = undefined;
    if (level === 'part') this.optionId = undefined;

    this.explorerItems = [];
    this.filters = [];
    this.selectedFilters = {};
    this.selectedServices = [];
  }

  requestServices() {
    console.log("before route ",this.selectedServices)
    this.router.navigate(
      ['/FenetrationMaintainence/Home/service-review'],
      { state: { selectedServices: this.selectedServices } }
    );

  }

  get breadcrumbs(): ExplorerCrumb[] {
  const crumbs: ExplorerCrumb[] = [];

  if (this.selectedCategory) {
    crumbs.push({ label: this.selectedCategory.name, level: 'category' });
  }

  if (this.selectedType) {
    crumbs.push({ label: this.selectedType.name, level: 'type' });
  }

  const structure = this.explorerItems.find(
    i => i.itemType === ExplorerItemType.Structure && i.id === this.structureId
  );
  if (structure) {
    crumbs.push({ label: structure.name, level: 'structure' });
  }

  const part = this.explorerItems.find(
    i => i.itemType === ExplorerItemType.Part && i.id === this.partId
  );
  if (part) {
    crumbs.push({ label: part.name, level: 'part' });
  }

  const option = this.explorerItems.find(
    i => i.itemType === ExplorerItemType.PartOption && i.id === this.optionId
  );
  if (option) {
    crumbs.push({ label: option.name, level: 'option' });
  }

  return crumbs;
}
goToCrumb(level: ExplorerCrumb['level']) {
  switch (level) {
    case 'category':
      this.resetAll();
      break;

    case 'type':
      this.resetBelow('type');
      this.loadExplorer();
      break;

    case 'structure':
      this.resetBelow('structure');
      this.loadExplorer();
      break;

    case 'part':
      this.resetBelow('part');
      this.loadExplorer();
      break;

    case 'option':
      this.optionId = undefined;
      this.selectedFilters = {};
      this.loadExplorer();
      break;
  }
}
goBack() {
  if (this.optionId) {
    this.optionId = undefined;
  } else if (this.partId) {
    this.partId = undefined;
  } else if (this.structureId) {
    this.structureId = undefined;
  } else if (this.selectedType) {
    this.selectedType = undefined;
  } else if (this.selectedCategory) {
    this.selectedCategory = undefined;
  }

  this.selectedFilters = {};
  this.loadExplorer();
}

}
