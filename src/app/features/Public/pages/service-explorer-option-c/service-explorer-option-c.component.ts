import { Router } from '@angular/router';
import { Component, OnInit } from "@angular/core";
import { CategoryService } from "../../../admin/Services/CategoryService";
import { CategoryTypeService } from "../../../admin/Services/categoryTypeService.service";
import { ExplorerItem, MetadataFilter, ExplorerItemType, MetadataExplorerService, ServiceExplorerRequest } from "../../../admin/Services/MetadataExplorerService.service";
import { Category } from "../../../Models/Category";
import { CategoryType } from "../../../Models/CategoryType";

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
    this.router.navigate(
      ['/FenetrationMaintainence/Home/service-review'],
      { state: { selectedServices: this.selectedServices } }
    );
  }
}
