import { WishlistService } from './../../../Services/wishlist.service';
import { Router } from '@angular/router';
import { ServiceService } from './../../../../admin/Services/service-service.service';
import { Component, OnInit } from '@angular/core';
import { AdvertisedServiceListItemDto } from '../../../../Models/Advertised.model';
import { AdvertiseService } from './../../../Services/advertise.service';

@Component({
  selector: 'app-landing-body',
  templateUrl: './landing-body.component.html',
  styleUrls: ['./landing-body.component.scss'],
})
export class LandingBodyComponent implements OnInit {
  services = [
    {
      title: 'Repair',
      description:
        'Track repair, sealing, lock and roller adjustments, and performance tuning to extend system lifespan.',
      imageUrl: './assets/landing-page/maintenance.jpg',
    },
    {
      title: 'Installation',
      description:
        'Professional installation of windows and doors with precise alignment, sealing, and clean finishing.',
      imageUrl: './assets/landing-page/installation.jpg',
    },
    {
      title: 'Inspection',
      description:
        'Upgrade old frames and glass with modern energy-efficient systems for better comfort and appearance.',
      imageUrl: './assets/landing-page/replacement.jpg',
    },
    {
      title: 'Maintenance',
      description:
        'Track repair, sealing, lock and roller adjustments, and performance tuning to extend system lifespan.',
      imageUrl: './assets/landing-page/maintenance.jpg',
    },
  ];

  data: AdvertisedServiceListItemDto[] = [];
  currentSlide = 0;
  cardsPerView = 3;

  constructor(
    private _advertiseService: AdvertiseService,
    private serviceService: ServiceService,
    private router: Router,
    private wishlist: WishlistService,
  ) {}

  ngOnInit(): void {
    this.updateCardsPerView();
    this.getAll();
    window.addEventListener('resize', this.updateCardsPerViewBound, true);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateCardsPerViewBound, true);
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

        // // ✅ Store metadata ONLY
        // metadata: s.metadata?.map((m) => ({
        //   attributeCode: m.attributeCode,
        //   name: m.value || m.valueText || m.valueName,
        //   value: m.value,
        //   valueText: m.valueText,
        // })),
      });
    }
  }
  removeFromReview(item: AdvertisedServiceListItemDto) {
    this.data = this.data.filter((r) => r.id !== item.id);

    // Optional: also remove from wishlist
    this.wishlist.remove(item.id);

    // this.overallTotal = this.requestedServices.reduce(
    //   (sum, r) => sum + (r.calculation?.total ?? 0),
    //   0,
    // );
  }
  trackByAdvertised(index: number, item: AdvertisedServiceListItemDto): number {
    return item.id;
  }
}
