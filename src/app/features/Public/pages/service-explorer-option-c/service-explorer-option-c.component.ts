import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';import { CategoryService } from '../../../admin/Services/CategoryService';
import { CategoryTypeService } from '../../../admin/Services/categoryTypeService.service';
import {
  ExplorerItem,
  MetadataFilter,
  ExplorerItemType,
  MetadataExplorerService,
  ServiceExplorerRequest,
} from '../../../admin/Services/MetadataExplorerService.service';
import { Category } from '../../../Models/Category';
import { CategoryType } from '../../../Models/CategoryType';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiTimingInterceptor } from '../../Interceptors/api-timing.interceptor';
import { forkJoin, catchError, of } from 'rxjs';

interface ExplorerCrumb {
  label: string;
  level: 'category' | 'type' | 'structure' | 'part' | 'option';
}

@Component({
  selector: 'app-service-explorer-option-c',
  templateUrl: './service-explorer-option-c.component.html',
  styleUrls: ['./service-explorer-option-c.component.scss'],
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
  selectedStructureName?: string;
  selectedPartName?: string;
  selectedOptionName?: string;

  selectedFilters: Record<string, number[]> = {};
  selectedServices: ExplorerItem[] = [];
  filtersSheetOpen = false;

  ExplorerItemType = ExplorerItemType;

  constructor(
    private categoryService: CategoryService,
    private typeService: CategoryTypeService,
    private explorerService: MetadataExplorerService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
@ViewChild('explorerTop') explorerTop!: ElementRef<HTMLElement>;

private scrollExplorerToTop(): void {
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    this.explorerTop?.nativeElement?.scrollIntoView({
      block: 'start',
      inline: 'nearest',
      behavior: 'auto'
    });

    document
      .querySelectorAll('.shop-explorer, .content, .layout, .page-content, .main-content')
      .forEach((el: any) => {
        el.scrollTop = 0;
      });
  }, 0);
}
  ngOnInit(): void {
    this.loadCategoriesAndHandleRoute();
  }
  isExplorerLoading = false;
  hasExplorerLoaded = false;
  hasExplorerResultLoaded = false;

  loadInitialExplorer(): void {
    this.isExplorerLoading = true;
    this.hasExplorerLoaded = false;

    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        this.categories = res?.data.categories ?? [];

        this.hasExplorerLoaded = true;
        this.isExplorerLoading = false;
      },
      error: () => {
        this.categories = [];

        this.hasExplorerLoaded = true;
        this.isExplorerLoading = false;
      },
    });
  }
  private loadCategoriesAndHandleRoute(): void {
    this.isExplorerLoading = true;
    this.hasExplorerLoaded = false;

    this.categoryService.getAllCategories(true).subscribe({
      next: (r) => {
        this.categories = r?.data?.categories ?? [];

        this.hasExplorerLoaded = true;
        this.isExplorerLoading = false;

        this.handleInitialCategoryFromQuery();
      },
      error: () => {
        this.categories = [];
        this.hasExplorerLoaded = true;
        this.isExplorerLoading = false;
      },
    });
  }

  get showNoServicesAtLastLevel(): boolean {
    return (
      this.hasExplorerResultLoaded &&
      !this.isExplorerLoading &&
      !!this.selectedType &&
      this.hasAnyItems === 0
    );
  }
  private handleInitialCategoryFromQuery(): void {
    this.route.queryParamMap.subscribe((params) => {
      const categoryIdParam = params.get('categoryId');
      const categoryId = categoryIdParam ? Number(categoryIdParam) : 0;

      if (!categoryId) return;

      const matchedCategory = this.categories.find((c) => c.id === categoryId);
      if (!matchedCategory) return;

      this.selectCategory(matchedCategory, false);
    });
  }

  selectCategory(c: Category, updateUrl: boolean = true) {
    this.scrollExplorerToTop();
    this.resetAll();
    this.selectedCategory = c;

    this.isExplorerLoading = true;
    this.hasExplorerResultLoaded = false;
    if (updateUrl && c?.id) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoryId: c.id },
        queryParamsHandling: 'merge',
      });
    }

    this.typeService.getTypesByCategory(c.id!).subscribe({
      next: (r) => {
        this.types = r.data?.categoryTypes ?? [];
        this.isExplorerLoading = false;

      },
      error: () => {
        this.types = [];
        this.isExplorerLoading = false;
      },
    });
  }

  selectType(t: CategoryType) {
    this.scrollExplorerToTop();
    this.resetBelow('type');
    this.selectedType = t;
    this.loadExplorer();
  }

  selectItem(item: ExplorerItem) {
    switch (item.itemType) {
      case ExplorerItemType.Structure:
        this.resetBelow('type');
        this.structureId = item.id;
        this.selectedStructureName = item.name;
        this.scrollExplorerToTop();
        break;

      case ExplorerItemType.Part:
        this.resetBelow('structure');
        this.partId = item.id;
        this.selectedPartName = item.name;
        this.scrollExplorerToTop();
        break;

      case ExplorerItemType.PartOption:
        this.resetBelow('part');
        this.optionId = item.id;
        this.selectedOptionName = item.name;
        this.scrollExplorerToTop();
        break;

      case ExplorerItemType.Service:
        this.toggleService(item);
        this.scrollExplorerToTop();
        return;
    }

    this.loadExplorer();
  }

  loadExplorer() {
    if (!this.selectedType) return;

    this.isExplorerLoading = true;
    this.hasExplorerResultLoaded = false;

    const filteredRequest: ServiceExplorerRequest = {
      categoryTypeId: this.selectedType.id,
      structureId: this.structureId,
      partId: this.partId,
      partOptionId: this.optionId,
      metadataFilters: this.buildMetadataFilters(),
    };

    // This request ignores selected filters.
    // It keeps all possible filter values visible, even if services are hidden.
    const filtersOnlyRequest: ServiceExplorerRequest = {
      categoryTypeId: this.selectedType.id,
      structureId: this.structureId,
      partId: this.partId,
      partOptionId: this.optionId,
      metadataFilters: [],
    };

    forkJoin({
      filteredResult: this.explorerService
        .explore(filteredRequest)
        .pipe(catchError(() => of({ items: [], filters: [] }))),
      allFiltersResult: this.explorerService
        .explore(filtersOnlyRequest)
        .pipe(catchError(() => of({ items: [], filters: [] }))),
    }).subscribe({
      next: ({ filteredResult, allFiltersResult }) => {
        this.explorerItems = filteredResult?.items ?? [];

        // Important: filters come from unfiltered services
        this.filters = this.normalizeFilters(allFiltersResult?.filters ?? []);

        this.hasExplorerResultLoaded = true;
        this.isExplorerLoading = false;
      },
      error: () => {
        this.explorerItems = [];
        this.filters = [];

        this.hasExplorerResultLoaded = true;
        this.isExplorerLoading = false;
      },
    });
  }

  buildMetadataFilters() {
    return Object.entries(this.selectedFilters)
      .filter(([_, values]) => values.length)
      .map(([code, values]) => ({
        attributeCode: code,
        valueIds: values,
      }));
  }

  toggleFilter(code: string, valueId: number) {
    this.scrollExplorerToTop();
    this.selectedFilters[code] ??= [];

    const idx = this.selectedFilters[code].indexOf(valueId);
    idx >= 0
      ? this.selectedFilters[code].splice(idx, 1)
      : this.selectedFilters[code].push(valueId);

    this.loadExplorer();
  }

  get structures() {
    return this.explorerItems.filter(
      (i) => i.itemType === ExplorerItemType.Structure,
    );
  }

  get parts() {
    return this.explorerItems.filter(
      (i) => i.itemType === ExplorerItemType.Part,
    );
  }

  get options() {
    return this.explorerItems.filter(
      (i) => i.itemType === ExplorerItemType.PartOption,
    );
  }

  get services() {
    return this.explorerItems.filter(
      (i) => i.itemType === ExplorerItemType.Service,
    );
  }

  toggleService(service: ExplorerItem) {
    const idx = this.selectedServices.findIndex((s) => s.id === service.id);
    idx >= 0
      ? this.selectedServices.splice(idx, 1)
      : this.selectedServices.push(service);
  }

  isServiceSelected(service: ExplorerItem): boolean {
    return this.selectedServices.some((s) => s.id === service.id);
  }

  resetAll() {
    this.types = [];
    this.selectedCategory = undefined;
    this.selectedType = undefined;

    this.structureId = undefined;
    this.partId = undefined;
    this.optionId = undefined;

    this.selectedStructureName = undefined;
    this.selectedPartName = undefined;
    this.selectedOptionName = undefined;

    this.explorerItems = [];
    this.filters = [];
    this.selectedFilters = {};
    this.selectedServices = [];
    this.hasExplorerResultLoaded = false;
    this.isExplorerLoading = false;
  }

  resetBelow(level: 'category' | 'type' | 'structure' | 'part') {
    if (level === 'category') {
      this.selectedType = undefined;

      this.structureId = undefined;
      this.partId = undefined;
      this.optionId = undefined;

      this.selectedStructureName = undefined;
      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
    }

    if (level === 'type') {
      this.structureId = undefined;
      this.partId = undefined;
      this.optionId = undefined;

      this.selectedStructureName = undefined;
      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
    }

    if (level === 'structure') {
      this.partId = undefined;
      this.optionId = undefined;

      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
    }

    if (level === 'part') {
      this.optionId = undefined;
      this.selectedOptionName = undefined;
    }
    this.hasExplorerResultLoaded = false;
    this.isExplorerLoading = false;
    this.explorerItems = [];
    this.filters = [];
    this.selectedFilters = {};
    this.selectedServices = [];
  }

  requestServices() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
      state: { selectedServices: this.selectedServices },
    });
  }

  get breadcrumbs(): ExplorerCrumb[] {
    const crumbs: ExplorerCrumb[] = [];

    if (this.selectedCategory) {
      crumbs.push({
        label: this.selectedCategory.name,
        level: 'category',
      });
    }

    if (this.selectedType) {
      crumbs.push({
        label: this.selectedType.name,
        level: 'type',
      });
    }

    if (this.structureId && this.selectedStructureName) {
      crumbs.push({
        label: this.selectedStructureName,
        level: 'structure',
      });
    }

    if (this.partId && this.selectedPartName) {
      crumbs.push({
        label: this.selectedPartName,
        level: 'part',
      });
    }

    if (this.optionId && this.selectedOptionName) {
      crumbs.push({
        label: this.selectedOptionName,
        level: 'option',
      });
    }

    return crumbs;
  }

  goToCrumb(level: ExplorerCrumb['level']) {
    this.scrollExplorerToTop();
    switch (level) {
      case 'category':
        this.selectedType = undefined;
        this.structureId = undefined;
        this.partId = undefined;
        this.optionId = undefined;
        this.selectedStructureName = undefined;
        this.selectedPartName = undefined;
        this.selectedOptionName = undefined;
        this.explorerItems = [];
        this.filters = [];
        this.selectedFilters = {};
        this.selectedServices = [];
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
        this.selectedOptionName = undefined;
        this.selectedFilters = {};
        this.loadExplorer();
        break;
    }
  }

  goBack() {
    this.scrollExplorerToTop();
    if (this.optionId) {
      this.optionId = undefined;
      this.selectedOptionName = undefined;
    } else if (this.partId) {
      this.partId = undefined;
      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
    } else if (this.structureId) {
      this.structureId = undefined;
      this.selectedStructureName = undefined;
      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
    } else if (this.selectedType) {
      this.selectedType = undefined;
      this.selectedStructureName = undefined;
      this.selectedPartName = undefined;
      this.selectedOptionName = undefined;
      this.explorerItems = [];
      this.filters = [];
    } else if (this.selectedCategory) {
      this.selectedCategory = undefined;
      this.types = [];

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoryId: null },
        queryParamsHandling: 'merge',
      });
    }

    this.selectedFilters = {};
    this.selectedServices = [];

    if (this.selectedType) {
      this.loadExplorer();
    } else {
      this.explorerItems = [];
      this.filters = [];
    }
  }

  get hasFilters(): boolean {
    return (this.filters?.length ?? 0) > 0;
  }

  get hasSelectedFilters(): boolean {
    return Object.keys(this.selectedFilters).some(
      (k) => (this.selectedFilters[k]?.length ?? 0) > 0,
    );
  }

  private normalizeFilters(filters: MetadataFilter[] = []): MetadataFilter[] {
    const map = new Map<string, MetadataFilter>();

    for (const f of filters) {
      if (!f?.code) continue;

      if (!map.has(f.code)) {
        map.set(f.code, { ...f, values: [...(f.values ?? [])] });
        continue;
      }

      const existing = map.get(f.code)!;
      existing.values.push(...(f.values ?? []));
    }

    const result = Array.from(map.values()).map((f) => ({
      ...f,
      values: this.distinctById(f.values ?? []),
    }));

    result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

    return result;
  }

  private distinctById<T extends { id: number }>(arr: T[]): T[] {
    const seen = new Set<number>();
    const out: T[] = [];
    for (const x of arr) {
      if (!x || seen.has(x.id)) continue;
      seen.add(x.id);
      out.push(x);
    }
    return out;
  }

  openFiltersSheet() {
    this.filtersSheetOpen = true;
  }

  closeFiltersSheet() {
    this.filtersSheetOpen = false;
  }

  toggleFiltersSheet() {
    this.filtersSheetOpen = !this.filtersSheetOpen;
  }

  clearFilters() {
    this.scrollExplorerToTop();
    this.selectedFilters = {};
    this.loadExplorer();
  }

  get currentLevel(): 'structure' | 'part' | 'option' | 'service' {
    if (this.optionId) return 'service';
    if (this.partId) return 'option';
    if (this.structureId) return 'part';
    return 'structure';
  }

  get hasAnyItems(): any {
    return (
      this.structures.length ||
      this.parts.length ||
      this.options.length ||
      this.services.length
    );
  }

  get showEmptyState(): boolean {
    return !!this.selectedType && !this.hasAnyItems;
  }
}
