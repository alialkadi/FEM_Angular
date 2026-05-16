import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../Services/seo.service';

@Component({
  selector: 'app-our-process',
  templateUrl: './our-process.component.html',
  styleUrl: './our-process.component.scss',
})
export class OurProcessComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Our Window & Door Service Process | Fenestration Services Calgary',
      'Learn how Fenestration Services works, from instant online quote to free on-site visit, written quote, approval, deposit, service completion, and final payment.',
      'index, follow',
    );
  }
}
