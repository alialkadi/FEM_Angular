import { WishlistService } from './../../../Services/wishlist.service';
import { Router } from '@angular/router';
import { ServiceService } from './../../../../admin/Services/service-service.service';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AdvertisedServiceListItemDto } from '../../../../Models/Advertised.model';
import { AdvertiseService } from './../../../Services/advertise.service';
import { CategoryService } from '../../../../admin/Services/CategoryService';
import { Category } from '../../../../Models/Category';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { TechnicalConsultationService } from './../../../Services/technical-consultation.service';
import { MapGeocodingService } from './../../../Services/map-geocoding.service';

import * as L from 'leaflet';
import { CreateTechnicalConsultationRequest } from '../../../Models/Consultation.model';

@Component({
  selector: 'app-landing-body',
  templateUrl: './landing-body.component.html',
  styleUrls: ['./landing-body.component.scss'],
})
export class LandingBodyComponent implements OnInit, AfterViewInit, OnDestroy {
  services = [
    {
      title: 'Repair',
      description:
        'Window & Door Hardware Replacement Sealed Unit Replacement Screen Replacement Weatherproofing Renewal Frame Repair.',
      imageUrl: './assets/landing-page/maintenance.jpg',
    },
    {
      title: 'Installation',
      description:
        'Windows & Doors Installation Patio Sliding & French Doors installation Custom & Retrofit Installation New Construction Installation Finishing, Sealing & Detail Work.',
      imageUrl: './assets/landing-page/installation.jpg',
    },
    {
      title: 'Inspection',
      description:
        '"Three Distinctive InspectionTiers" Comprehensive tiers of draft detection and risk assessment to optimize efficiency and prevent structural moisture damage.',
      imageUrl: './assets/landing-page/replacement.jpg',
    },
    {
      title: 'Maintenance',
      description:
        '"Three Distinctive InspectionTiers" Scheduled preventative care including hardware lubrication and alignment to enhance the functional lifespan of systems.',
      imageUrl: './assets/landing-page/maintenance.jpg',
    },
  ];

  data: AdvertisedServiceListItemDto[] = [];
  currentSlide = 0;
  cardsPerView = 3;
  categories: Category[] = [];
  categoriesLoading = false;

  consultationForm!: FormGroup;
  consultationSubmitting = false;
  consultationSuccessMessage = '';
  consultationErrorMessage = '';

  portfolioOptions = ['Residential', 'Commercial'];
  serviceScopeOptions = ['Repair', 'Installation', 'Inspection', 'Maintenance'];

  private map!: L.Map;
  private marker!: L.Marker;
  private readonly defaultLat = 43.6532; // Toronto, Canada
  private readonly defaultLng = -79.3832;
  private readonly defaultZoom = 10;

  constructor(
    private _advertiseService: AdvertiseService,
    private serviceService: ServiceService,
    private router: Router,
    private wishlist: WishlistService,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private technicalConsultationService: TechnicalConsultationService,
    private mapGeocodingService: MapGeocodingService,
  ) {}

  ngOnInit(): void {
    this.buildConsultationForm();
    this.updateCardsPerView();
    this.getAll();
    this.loadCategories();
    window.addEventListener('resize', this.updateCardsPerViewBound, true);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateCardsPerViewBound, true);

    if (this.map) {
      this.map.remove();
    }
  }

  // =========================
  // VALIDATORS
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

      // letters + spaces + apostrophe + hyphen
      const valid = /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value);
      return valid ? null : { invalidName: true };
    };
  }

  private phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control.value ?? '').toString().trim();
      if (!value) return null;

      // allows international numbers, spaces, +, -, ()
      const valid = /^\+?[0-9\s\-()]{7,20}$/.test(value);
      return valid ? null : { invalidPhone: true };
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
      message: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator(),
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
      serviceScopes: [[], [this.arrayRequiredValidator()]],
    });
  }

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

    this.consultationForm.patchValue({
      latitude: this.defaultLat,
      longitude: this.defaultLng,
    });

    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.handleMapSelection(position.lat, position.lng);
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.handleMapSelection(e.latlng.lat, e.latlng.lng);
    });
  }

  private handleMapSelection(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }

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

  openCategory(category: Category): void {
    if (!category?.id) return;

    this.router.navigate(['/FenetrationMaintainence/Home/serviceexplorer'], {
      queryParams: { categoryId: category.id },
    });
  }

  private updateCardsPerViewBound = () => this.updateCardsPerView();

  updateCardsPerView(): void {
    const width = window.innerWidth;

    if (width < 768) {
      this.cardsPerView = 1;
    } else if (width < 1100) {
      this.cardsPerView = 2;
    } else {
      this.cardsPerView = 3;
    }

    const max = this.maxSlideIndex;
    if (this.currentSlide > max) {
      this.currentSlide = max;
    }
  }

  get maxSlideIndex(): number {
    if (!this.data.length) return 0;
    return Math.max(0, this.data.length - this.cardsPerView);
  }

  get trackTranslate(): string {
    const cardWidth = 100 / this.cardsPerView;
    return `translateX(-${this.currentSlide * cardWidth}%)`;
  }

  getAll() {
    this._advertiseService.getAll().subscribe({
      next: (res) => {
        this.data = (res.data || []).sort((a, b) => a.sortOrder - b.sortOrder);
      },
      error: (err) => {
        console.error('Failed to load advertised services', err);
      },
    });
  }

  nextSlide(): void {
    if (this.currentSlide >= this.maxSlideIndex) {
      this.currentSlide = 0;
      return;
    }
    this.currentSlide++;
  }

  prevSlide(): void {
    if (this.currentSlide <= 0) {
      this.currentSlide = this.maxSlideIndex;
      return;
    }
    this.currentSlide--;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  get visibleDots(): number[] {
    return Array.from({ length: this.maxSlideIndex + 1 }, (_, i) => i);
  }

  requestAdvertisedService(item: AdvertisedServiceListItemDto) {
    this.serviceService.getServicesById(item.id).subscribe({
      next: (res) => {
        const fullService = res.data;
        this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
          state: { selectedServices: [fullService] },
        });
      },
    });
  }

  addAdvertisedToWishlist(item: AdvertisedServiceListItemDto) {
    this.wishlist.add({
      serviceId: item.id,
      name: item.name,
      description: item.description,
      fileUrl: item.fileUrl,
      metadata: [],
    });
  }

  isWishlisted(serviceId: number): boolean {
    return this.wishlist.isWishlisted(serviceId);
  }

  toggleWishlist(item: AdvertisedServiceListItemDto) {
    const s = item;

    if (this.isWishlisted(s.id)) {
      this.wishlist.remove(s.id);
    } else {
      this.wishlist.add({
        serviceId: s.id,
        name: s.name,
        description: s.description,
        fileUrl: s.fileUrl,
      });
    }
  }

  removeFromReview(item: AdvertisedServiceListItemDto) {
    this.data = this.data.filter((r) => r.id !== item.id);
    this.wishlist.remove(item.id);
  }

  trackByAdvertised(index: number, item: AdvertisedServiceListItemDto): number {
    return item.id;
  }

  isScopeSelected(scope: string): boolean {
    const current: string[] =
      this.consultationForm.get('serviceScopes')?.value ?? [];
    return current.includes(scope);
  }

  toggleScope(scope: string): void {
    const control = this.consultationForm.get('serviceScopes');
    const current: string[] = control?.value ?? [];

    if (current.includes(scope)) {
      control?.setValue(current.filter((x) => x !== scope));
    } else {
      control?.setValue([...current, scope]);
    }

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
      next: (res) => {
        this.consultationSubmitting = false;
        this.consultationSuccessMessage =
          res?.message || 'Consultation request submitted successfully.';

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
          message: '',
          serviceScopes: [],
        });

        this.consultationForm.markAsPristine();
        this.consultationForm.markAsUntouched();

        if (this.marker) {
          this.marker.setLatLng([this.defaultLat, this.defaultLng]);
          this.map.setView(
            [this.defaultLat, this.defaultLng],
            this.defaultZoom,
          );
        }
      },
      error: (err) => {
        this.consultationSubmitting = false;
        this.consultationErrorMessage =
          err?.error?.message || 'Failed to submit consultation request.';
      },
    });
  }

  get f() {
    return this.consultationForm.controls;
  }

  hasError(controlName: string, errorName?: string): boolean {
    const control = this.consultationForm.get(controlName);
    if (!control) return false;

    if (errorName) {
      return !!(control.touched && control.hasError(errorName));
    }

    return !!(control.touched && control.invalid);
  }
}
