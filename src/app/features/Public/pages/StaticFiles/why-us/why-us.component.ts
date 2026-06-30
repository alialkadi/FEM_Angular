import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../Services/seo.service';

@Component({
  selector: 'app-why-us',
  templateUrl: './why-us.component.html',
  styleUrl: './why-us.component.scss',
})
export class WhyUsComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Why Choose Fenestration Services | Window & Door Experts Calgary',
      'Discover why homeowners and businesses choose Fenestration Services for window and door repair in Calgary, including real-time quotes, technical expertise, repair-first solutions, and long-term value.',
      'index, follow',
    );
  }
}
