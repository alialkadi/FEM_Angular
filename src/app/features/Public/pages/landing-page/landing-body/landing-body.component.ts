import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import * as L from 'leaflet';

import { ServiceService } from './../../../../admin/Services/service-service.service';
import { CategoryService } from '../../../../admin/Services/CategoryService';
import { AppSettingService } from '../../../../admin/Services/app-setting.service';

import { WishlistService } from './../../../Services/wishlist.service';
import { AdvertiseService } from './../../../Services/advertise.service';
import { TechnicalConsultationService } from './../../../Services/technical-consultation.service';
import { MapGeocodingService } from './../../../Services/map-geocoding.service';

import { Category } from '../../../../Models/Category';
import { AdvertisedServiceListItemDto } from '../../../../Models/Advertised.model';
import { CreateTechnicalConsultationRequest } from '../../../Models/Consultation.model';

@Component({
  selector: 'app-landing-body',
  templateUrl: './landing-body.component.html',
  styleUrls: ['./landing-body.component.scss'],
})
export class LandingBodyComponent implements OnInit, AfterViewInit, OnDestroy {
  categories: Category[] = [];
  categoriesLoading = false;

  advertisedServices: AdvertisedServiceListItemDto[] = [];
  // featuredIndex = 0;
  // featuredItemsPerView = 3;
  // private featuredTimer: ReturnType<typeof setInterval> | null = null;

  consultationForm!: FormGroup;
  consultationSubmitting = false;
  consultationSuccessMessage = '';
  consultationErrorMessage = '';
  consultationPrice = 0;

  portfolioOptions = ['Residential', 'Commercial'];
  serviceScopeOptions = ['Repair', 'Installation', 'Inspection', 'Maintenance'];

  private map?: L.Map;
  private marker?: L.Marker;

  private readonly defaultLat = 43.6532;
  private readonly defaultLng = -79.3832;
  private readonly defaultZoom = 10;

  private readonly resizeHandler = () => this.handleFeaturedResize();

  constructor(
    private advertiseService: AdvertiseService,
    private serviceService: ServiceService,
    private router: Router,
    private wishlist: WishlistService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private technicalConsultationService: TechnicalConsultationService,
    private mapGeocodingService: MapGeocodingService,
    private appSettingService: AppSettingService,
  ) {}

  ngOnInit(): void {
    this.buildConsultationForm();
    this.setFeaturedItemsPerView();

    this.loadAdvertisedServices();
    this.loadCategories();
    this.getConsultationPrice();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
  }

  ngAfterViewInit(): void {
    // Enable only when the map HTML is visible.
    // this.initMap();
  }

  ngOnDestroy(): void {
    this.pauseFeaturedCarousel();
    window.removeEventListener('resize', this.resizeHandler);

    if (this.map) {
      this.map.remove();
    }
  }

  // =========================
  // Featured services carousel
  // =========================

  featuredIndex = 0;
  // featuredItemsPerView = 3;
  disableFeaturedAnimation = false;
  private featuredTimer: any;

  featuredItemsPerView = 3;

  featuredRows: {
    categoryName: string;
    services: AdvertisedServiceListItemDto[];
    index: number;
    disableAnimation: boolean;
    timer: any;
  }[] = [];

  get hasFeaturedRows(): boolean {
    return this.featuredRows.some((row) => row.services.length > 0);
  }

  getFeaturedDots(row: { services: AdvertisedServiceListItemDto[] }): number[] {
    return Array.from({ length: row.services.length }, (_, index) => index);
  }

  getDisplayedFeaturedServices(row: {
    services: AdvertisedServiceListItemDto[];
  }): AdvertisedServiceListItemDto[] {
    if (!row.services.length) return [];

    if (row.services.length <= this.featuredItemsPerView) {
      return row.services;
    }

    return [
      ...row.services,
      ...row.services.slice(0, this.featuredItemsPerView),
    ];
  }

  getFeaturedTranslate(row: { index: number }): string {
    return `translateX(-${row.index * (100 / this.featuredItemsPerView)}%)`;
  }

  private setFeaturedItemsPerView(): void {
    const width = window.innerWidth;

    if (width < 768) {
      this.featuredItemsPerView = 1;
    } else if (width < 1100) {
      this.featuredItemsPerView = 2;
    } else {
      this.featuredItemsPerView = 3;
    }
  }

  private handleFeaturedResize(): void {
    this.setFeaturedItemsPerView();

    this.featuredRows.forEach((row) => {
      if (row.index >= row.services.length) {
        row.index = 0;
      }
    });
  }

  private buildFeaturedRows(): void {
    const map = new Map<string, Map<number, AdvertisedServiceListItemDto>>();

    this.advertisedServices.forEach((service) => {
      const categoryName =
        (service as any).categoryName ||
        (service as any).CategoryName ||
        'Other Services';

      if (!map.has(categoryName)) {
        map.set(categoryName, new Map<number, AdvertisedServiceListItemDto>());
      }

      map.get(categoryName)!.set(service.id, service);
    });

    this.featuredRows = Array.from(map.entries()).map(
      ([categoryName, servicesMap]) => ({
        categoryName,
        services: Array.from(servicesMap.values()).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
        index: 0,
        disableAnimation: false,
        timer: null,
      }),
    );
  }

  startFeaturedCarousel(row?: any): void {
    if (row) {
      this.startFeaturedRowCarousel(row);
      return;
    }

    this.featuredRows.forEach((featuredRow) => {
      this.startFeaturedRowCarousel(featuredRow);
    });
  }

  private startFeaturedRowCarousel(row: any): void {
    this.pauseFeaturedCarousel(row);

    if (row.services.length <= this.featuredItemsPerView) return;

    row.timer = setInterval(() => {
      this.nextFeatured(row);
    }, 3500);
  }

  pauseFeaturedCarousel(row?: any): void {
    if (row) {
      if (!row.timer) return;

      clearInterval(row.timer);
      row.timer = null;
      return;
    }

    this.featuredRows.forEach((featuredRow) => {
      if (featuredRow.timer) {
        clearInterval(featuredRow.timer);
        featuredRow.timer = null;
      }
    });
  }

  nextFeatured(row: any): void {
    if (row.services.length <= this.featuredItemsPerView) return;

    row.disableAnimation = false;
    row.index++;

    if (row.index >= row.services.length) {
      setTimeout(() => {
        row.disableAnimation = true;
        row.index = 0;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            row.disableAnimation = false;
          });
        });
      }, 500);
    }
  }

  prevFeatured(row: any): void {
    if (row.services.length <= this.featuredItemsPerView) return;

    if (row.index === 0) {
      row.disableAnimation = true;
      row.index = row.services.length;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.disableAnimation = false;
          row.index--;
        });
      });

      return;
    }

    row.disableAnimation = false;
    row.index--;
  }

  goToFeatured(row: any, index: number): void {
    row.disableAnimation = false;
    row.index = index;
  }

  trackByFeaturedRow(index: number, row: any): string {
    return row.categoryName;
  }

  // =========================
  // Data loading
  // =========================

  loadAdvertisedServices(): void {
    this.advertiseService.getAll().subscribe({
      next: (res) => {
        this.advertisedServices = (res?.data ?? []).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );

        this.setFeaturedItemsPerView();
        this.buildFeaturedRows();
        this.startFeaturedCarousel();
      },
      error: (err) => {
        console.error('Failed to load advertised services', err);
        this.advertisedServices = [];
        this.featuredRows = [];
        this.pauseFeaturedCarousel();
      },
    });
  }

  loadCategories(): void {
    this.categoriesLoading = true;

    this.categoryService.getAllCategories(true).subscribe({
      next: (res) => {
        this.categories = res?.data?.categories ?? [];
        this.categoriesLoading = false;
      },
      error: () => {
        this.categories = [];
        this.categoriesLoading = false;
      },
    });
  }

  getConsultationPrice(): void {
    this.appSettingService.getConsultationPrice().subscribe({
      next: (res) => {
        this.consultationPrice = res?.data ?? 0;
      },
      error: () => {
        this.consultationPrice = 0;
      },
    });
  }

  // =========================
  // Navigation / actions
  // =========================

  openCategory(category: Category): void {
    if (!category?.id) return;

    this.router.navigate(['/FenetrationMaintainence/Home/serviceexplorer'], {
      queryParams: { categoryId: category.id },
    });
  }

  requestAdvertisedService(item: AdvertisedServiceListItemDto): void {
    this.serviceService.getServiceExplorerItem(item.id).subscribe({
      next: (res) => {
        console.log(res);
        const fullService = res.response;

        this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
          state: { selectedServices: [fullService] },
        });
      },
    });
  }

  isWishlisted(serviceId: number): boolean {
    return this.wishlist.isWishlisted(serviceId);
  }

  toggleWishlist(item: AdvertisedServiceListItemDto): void {
    if (this.isWishlisted(item.id)) {
      this.wishlist.remove(item.id);
      return;
    }

    this.wishlist.add({
      serviceId: item.id,
      name: item.name,
      description: item.description,
      fileUrl: item.fileUrl,
    });
  }

  // =========================
  // Consultation form
  // =========================

  private buildConsultationForm(): void {
    this.consultationForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          this.nameValidator(),
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          this.nameValidator(),
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      phoneNumber: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          this.phoneValidator(),
          Validators.minLength(7),
          Validators.maxLength(30),
        ],
      ],
      email: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          Validators.email,
          Validators.maxLength(150),
        ],
      ],
      address: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
      latitude: [
        this.defaultLat,
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        this.defaultLng,
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
      placeId: [null, [Validators.maxLength(200)]],
      portfolioType: ['', [Validators.required]],
      serviceScopes: [[], [this.arrayRequiredValidator()]],
      message: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
    });
  }

  isScopeSelected(scope: string): boolean {
    const current: string[] =
      this.consultationForm.get('serviceScopes')?.value ?? [];

    return current.includes(scope);
  }

  toggleScope(scope: string): void {
    const control = this.consultationForm.get('serviceScopes');
    const current: string[] = control?.value ?? [];

    control?.setValue(
      current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope],
    );

    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  submitConsultation(): void {
    this.consultationSuccessMessage = '';
    this.consultationErrorMessage = '';

    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      return;
    }

    const formValue = this.consultationForm.getRawValue();

    const payload: CreateTechnicalConsultationRequest = {
      firstName: formValue.firstName?.trim(),
      lastName: formValue.lastName?.trim(),
      phoneNumber: formValue.phoneNumber?.trim(),
      email: formValue.email?.trim(),
      address: formValue.address?.trim(),
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      placeId: formValue.placeId,
      portfolioType: formValue.portfolioType,
      serviceScopes: formValue.serviceScopes,
      message: formValue.message?.trim(),
    };

    this.consultationSubmitting = true;

    this.technicalConsultationService.submit(payload).subscribe({
      next: () => {
        this.consultationSubmitting = false;
        this.consultationSuccessMessage =
          'Service Call request submitted successfully.';

        this.resetConsultationForm();
      },
      error: (err) => {
        this.consultationSubmitting = false;
        this.consultationErrorMessage =
          err?.error?.message || 'Failed to submit consultation request.';
      },
    });
  }

  private resetConsultationForm(): void {
    this.consultationForm.reset({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      latitude: this.defaultLat,
      longitude: this.defaultLng,
      placeId: null,
      portfolioType: '',
      serviceScopes: [],
      message: '',
    });

    this.consultationForm.markAsPristine();
    this.consultationForm.markAsUntouched();

    if (this.marker && this.map) {
      this.marker.setLatLng([this.defaultLat, this.defaultLng]);
      this.map.setView([this.defaultLat, this.defaultLng], this.defaultZoom);
    }
  }

  get f() {
    return this.consultationForm.controls;
  }

  hasError(controlName: string, errorName?: string): boolean {
    const control = this.consultationForm.get(controlName);
    if (!control) return false;

    return errorName
      ? !!(control.touched && control.hasError(errorName))
      : !!(control.touched && control.invalid);
  }

  // =========================
  // Validators
  // =========================

  private noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString();
      return value.trim().length === 0 ? { whitespace: true } : null;
    };
  }

  private nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return null;

      return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value) ? null : { invalidName: true };
    };
  }

  private phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return null;

      return /^\+?[0-9\s\-()]{7,20}$/.test(value)
        ? null
        : { invalidPhone: true };
    };
  }

  private arrayRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      return Array.isArray(value) && value.length > 0
        ? null
        : { required: true };
    };
  }

  // =========================
  // Optional map support
  // =========================

  private initMap(): void {
    const mapContainer = document.getElementById('consultation-map');
    if (!mapContainer) return;

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('consultation-map', {
      center: [this.defaultLat, this.defaultLng],
      zoom: this.defaultZoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = L.marker([this.defaultLat, this.defaultLng], {
      draggable: true,
    }).addTo(this.map);

    this.marker.on('dragend', () => {
      const position = this.marker?.getLatLng();
      if (!position) return;

      this.handleMapSelection(position.lat, position.lng);
    });

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.handleMapSelection(event.latlng.lat, event.latlng.lng);
    });
  }

  private handleMapSelection(lat: number, lng: number): void {
    this.marker?.setLatLng([lat, lng]);

    this.consultationForm.patchValue({
      latitude: lat,
      longitude: lng,
    });

    this.consultationForm.get('latitude')?.markAsTouched();
    this.consultationForm.get('longitude')?.markAsTouched();

    this.reverseGeocode(lat, lng);
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.mapGeocodingService.reverseGeocode(lat, lng).subscribe({
      next: (res) => {
        this.consultationForm.patchValue({
          address: res?.display_name ?? '',
        });

        this.consultationForm.get('address')?.markAsTouched();
        this.consultationForm.get('address')?.updateValueAndValidity();
      },
      error: (err) => {
        console.error('Reverse geocoding failed', err);
      },
    });
  }
}
