import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../Services/seo.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss',
})
export class AboutUsComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'About Fenestration Services | Window & Door Experts Alberta',
      'Learn about Fenestration Services, Alberta window and door repair experts focused on maintenance, restoration, inspections, hardware replacement, and long-term performance.',
      'index, follow',
    );
  }
}
