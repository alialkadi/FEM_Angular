import { Component } from '@angular/core';
import { LandingPageNavbar_SECTIONS, LandingPageNavbarSection } from './Landing-navbar-section';

@Component({
  selector: 'app-landing-navbar',
  templateUrl: './landing-navbar.component.html',
  styleUrl: './landing-navbar.component.scss'
})
export class LandingNavbarComponent {
 sections : LandingPageNavbarSection[] = [];
  constructor() { }
  ngOnInit(): void {
    
    this.sections = LandingPageNavbar_SECTIONS;
    
  }
}
 