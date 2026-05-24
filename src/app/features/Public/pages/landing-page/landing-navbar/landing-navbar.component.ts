import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  LandingPageNavbar_SECTIONS,
  LandingPageNavbarSection,
} from './Landing-navbar-section';
import { WishlistService } from '../../../Services/wishlist.service';
import { CategoryService } from '../../../../admin/Services/CategoryService';

export interface Category {
  id: number;
  name: string;
  types: any[];
  count: number;
  fileUrl?: string;
  typesCount: number;
  description: string;
}

@Component({
  selector: 'app-landing-navbar',
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss',
})
export class LandingNavbarComponent {
  sections: LandingPageNavbarSection[] = [];
  categories: Category[] = [];

  mobileOpen = false;

  homeRoute = ['/public/FenestrationMaintainence/home'];
  cartRoute = ['/FenetrationMaintainence/Home/Wishlist'];
  loginRoute = ['/FenetrationMaintainence/Home/login'];
  quoteRoute = ['/public/FenestrationMaintainence/contact'];

  constructor(
    private wishlist: WishlistService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sections = LandingPageNavbar_SECTIONS;
    this.loadCategories();
  }

  get cartCount(): number {
    return this.wishlist.count();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res?.data.categories ?? res ?? [];
        console.log(res)
      },
      error: () => {
        this.categories = [];
      },
    });
  }

  openCategory(category: Category): void {
    this.closeMenu();

    this.router.navigate(
      ['/FenetrationMaintainence/Home/serviceexplorer'],
      {
        queryParams: {
          categoryId: category.id,
        },
      }
    );
  }

  toggleMenu(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMenu(): void {
    this.mobileOpen = false;
  }
}