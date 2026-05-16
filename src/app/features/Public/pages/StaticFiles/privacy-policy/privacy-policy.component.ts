import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../Services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss',
})
export class PrivacyPolicyComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Privacy Policy | Fenestration Services Calgary',
      'Read the Fenestration Services privacy policy covering customer information, payment security, cookies, analytics, personal data handling, and Canadian privacy compliance.',
      'index, follow',
    );
  }
}
