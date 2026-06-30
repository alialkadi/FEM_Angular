import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.setSeoMetadata();
  }

  private setSeoMetadata(): void {
    const pageTitle =
      'Window & Door Repair Services Calgary | Fenestration Services';

    const description =
      'Professional residential and commercial window and door repair services in Calgary, including hardware replacement, foggy glass replacement, patio door repair, storefront glazing, curtain wall systems, and sealant inspection.';

    const url = 'https://fenestrationservices.ca/';
    const image =
      'https://fenestrationservices.ca/assets/landing-page/icon.png';

    this.title.setTitle(pageTitle);

    this.meta.updateTag({
      name: 'description',
      content: description,
    });

    this.meta.updateTag({
      name: 'keywords',
      content:
        'window repair Calgary, door repair Calgary, foggy glass replacement Calgary, window hardware replacement Calgary, patio door repair Calgary, commercial glazing Calgary, curtain wall services Calgary, storefront glazing Calgary',
    });

    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: pageTitle,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: image,
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: pageTitle,
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: description,
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: image,
    });
  }
}
