import { Component } from '@angular/core';
import { LandingPageNavbar_SECTIONS, LandingPageNavbarSection } from './Landing-navbar-section';
import { WishlistService } from '../../../Services/wishlist.service';

@Component({
  selector: 'app-landing-navbar',
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent {
  sections: LandingPageNavbarSection[] = [];
  constructor(private wishlist: WishlistService) { }
  ngOnInit(): void {
    
    this.sections = LandingPageNavbar_SECTIONS;
    
  }
  get wishlistCount(): number {
    return this.wishlist.count();
  }
}
 