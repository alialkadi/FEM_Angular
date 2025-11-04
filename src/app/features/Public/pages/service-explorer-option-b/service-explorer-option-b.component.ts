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
type ExplorerStep = 'category' | 'type' | 'structure' | 'part' | 'partOption' | 'service';

@Component({
  selector: 'app-service-explorer-option-b',
  templateUrl: './service-explorer-option-b.component.html',
  styleUrl: './service-explorer-option-b.component.scss'
})
export class ServiceExplorerOptionBComponent {
// data lists
  categories: Category[] = [];
  types: CategoryType[] = [];
  structures: Structure[] = [];
  parts: Part[] = [];
  partOptions: PartOption[] = [];
  services: ServiceResponse[] = [];

  // selections
  selectedCategory?: Category;
  selectedType?: CategoryType;
  selectedStructure?: Structure;
  selectedPart?: Part;
  selectedPartOption?: PartOption;

  // selected services
  selectedServices: ServiceResponse[] = [];

  // UI
  loading = false;
  errorMessage = '';
  // track which accordion steps are expanded (keeps order and allows multiple open if you want)
  expanded: Set<ExplorerStep> = new Set<ExplorerStep>(['category']);

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
  // Loaders
  // --------------------------
  private setLoading<T>(obs: any, onSuccess: (res: any) => void) {
    this.loading = true;
    obs.subscribe({
      next: (res: any) => {
        onSuccess(res);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  loadCategories(): void {
    this.setLoading(
      this.categoryService.getAllCategories(true),
      (res) => (this.categories = res.data?.categories ?? [])
    );
  }

  loadTypes(categoryId: number): void {
    this.setLoading(
      this.typeService.getTypesByCategory(categoryId),
      (res) => (this.types = res.data?.categoryTypes ?? [])
    );
  }

  loadStructures(typeId: number): void {
    this.setLoading(
      this.structureService.getStructuresByType(typeId),
      (res) => (this.structures = res.data?.structures ?? [])
    );
  }

  loadParts(structureId: number): void {
    this.setLoading(
      this.partService.getPartsByStructure(structureId),
      (res) => (this.parts = res.data?.parts ?? [])
    );
  }

  loadPartOptions(partId: number): void {
    this.setLoading(
      this.optionService.getOptionsByPart(partId),
      (res) => (this.partOptions = res.data?.partOptions ?? [])
    );
  }

  loadServicesByStructure(structureId: number): void {
    this.setLoading(
      this.serviceService.getServicesByStructure(structureId),
      (res) => (this.services = res.data?.services ?? [])
    );
  }

  loadServicesByPart(partId: number): void {
    this.setLoading(
      this.serviceService.getServicesByPart(partId),
      (res) => (this.services = res.data?.services ?? [])
    );
  }

  loadServicesByPartOption(partOptionId: number): void {
    this.setLoading(
      this.serviceService.getServicesByPartOption(partOptionId),
      (res) => (this.services = res.data?.services ?? [])
    );
  }

  // --------------------------
  // Selection handlers
  // --------------------------
  selectCategory(cat: Category): void {
    if (!cat) return;
    this.selectedCategory = cat;
    // clear deeper selections
    this.selectedType = this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.parts = this.partOptions = this.structures = this.services = [];
    this.selectedServices = [];
    // expand next step and load
    this.expand('type');
    this.loadTypes(cat.id!);
    // ensure category is expanded too
    this.expand('category');
  }

  selectType(type: CategoryType): void {
    if (!type) return;
    this.selectedType = type;
    this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.parts = this.partOptions = this.services = [];
    this.selectedServices = [];
    this.expand('structure');
    this.loadStructures(type.id);
  }

  selectStructure(s: Structure): void {
    if (!s) return;
    this.selectedStructure = s;
    this.selectedPart = this.selectedPartOption = undefined;
    this.partOptions = this.services = [];
    this.selectedServices = [];
    // Load parts and structure-level services
    this.loadParts(s.id);
    this.loadServicesByStructure(s.id);
    this.expand('part');
  }

  selectPart(p: Part): void {
    if (!p) return;
    this.selectedPart = p;
    this.selectedPartOption = undefined;
    this.partOptions = this.services = [];
    this.selectedServices = [];
    this.expand('partOption');
    this.loadPartOptions(p.id);
    this.loadServicesByPart(p.id);
  }

  selectPartOption(po: PartOption): void {
    if (!po) return;
    this.selectedPartOption = po;
    this.services = [];
    this.selectedServices = [];
    this.expand('service');
    this.loadServicesByPartOption(po.id);
  }

  // --------------------------
  // Accordion control
  // --------------------------
  toggle(step: ExplorerStep): void {
    if (this.expanded.has(step)) this.expanded.delete(step);
    else this.expanded.add(step);
  }

  expand(step: ExplorerStep): void {
    this.expanded.add(step);
    // automatically scroll or focus could be added here (optional)
  }

  isExpanded(step: ExplorerStep): boolean {
    return this.expanded.has(step);
  }

  // --------------------------
  // Services selection
  // --------------------------
  toggleService(s: ServiceResponse): void {
    const idx = this.selectedServices.findIndex(x => x.id === s.id);
    if (idx >= 0) this.selectedServices.splice(idx, 1);
    else this.selectedServices.push(s);
  }

  isSelected(s: ServiceResponse): boolean {
    return this.selectedServices.some(x => x.id === s.id);
  }

  get totalCost(): number {
    return this.selectedServices.reduce((sum, s) => sum + (s.baseCost ?? 0), 0);
  }

  // --------------------------
  // Actions
  // --------------------------
  reset(): void {
    this.selectedCategory = this.selectedType = this.selectedStructure = this.selectedPart = this.selectedPartOption = undefined;
    this.categories = this.types = this.structures = this.parts = this.partOptions = this.services = [];
    this.selectedServices = [];
    this.expanded = new Set<ExplorerStep>(['category']);
    this.loadCategories();
  }

  requestServices(): void {
    // placeholder: wire this to your service request modal / route
    const payload = {
      path: {
        category: this.selectedCategory,
        type: this.selectedType,
        structure: this.selectedStructure,
        part: this.selectedPart,
        partOption: this.selectedPartOption
      },
      services: this.selectedServices,
      total: this.totalCost
    };
    // For now just log — integrate with your RequestService or modal
    console.log('Request payload', payload);
    // You can open a modal, or emit an event, or call a ServiceRequest API here.
  }

  // --------------------------
  // Error handling
  // --------------------------
  private handleError(err: any): void {
    console.error('Service explorer error', err);
    this.errorMessage = err?.message ?? 'Unexpected error loading data';
    // keep UI responsive
    this.loading = false;
  }

  // trackBy
  trackById(_i: number, item: any) {
    return item?.id ?? _i;
  }
}
