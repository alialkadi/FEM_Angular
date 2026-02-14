import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-body',
  templateUrl: './landing-body.component.html',
  styleUrl: './landing-body.component.scss',
})
export class LandingBodyComponent {
  services = [
    {
      title: 'Installation',
      description:
        'Professional installation of windows and doors with precise alignment, sealing, and clean finishing.',
      imageUrl: './assets/landing-page/installation.jpg',
    },
    {
      title: 'Replacement',
      description:
        'Upgrade old frames and glass with modern energy-efficient systems for better comfort and appearance.',
      imageUrl: './assets/landing-page/replacement.jpg',
    },
    {
      title: 'Maintenance',
      description:
        'Track repair, sealing, lock and roller adjustments, and performance tuning to extend system lifespan.',
      imageUrl: './assets/landing-page/maintenance.jpg',
    },
  ];
}
