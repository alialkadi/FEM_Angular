import { Component } from '@angular/core';
import {
  LandingPageNavbar_SECTIONS,
  LandingPageNavbarSection,
} from './Landing-navbar-section';
import { WishlistService } from '../../../Services/wishlist.service';

@Component({
  selector: 'app-landing-navbar',
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss',
})
export class LandingNavbarComponent {
  sections: LandingPageNavbarSection[] = [];
  mobileOpen = false;

  // routes (adjust to your real app)
  homeRoute = ['/public/FenestrationMaintainence/home'];
  cartRoute = ['/FenetrationMaintainence/Home/Wishlist']; // TODO: change to your real Cart route
  quoteRoute = ['/public/FenestrationMaintainence/contact'];

  constructor(private wishlist: WishlistService) {}

  ngOnInit(): void {
    this.sections = LandingPageNavbar_SECTIONS;
  }

  // rename for UI (still uses your existing wishlist storage/service)
  get cartCount(): number {
    return this.wishlist.count();
  }

  toggleMenu(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMenu(): void {
    this.mobileOpen = false;
  }
}
