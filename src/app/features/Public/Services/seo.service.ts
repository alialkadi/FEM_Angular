import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  update(
    title: string,
    description: string,
    robots: string = 'index, follow',
  ): void {
    this.title.setTitle(title);

    this.meta.updateTag({
      name: 'description',
      content: description,
    });

    this.meta.updateTag({
      name: 'robots',
      content: robots,
    });
  }
}
