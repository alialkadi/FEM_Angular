import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-body',
  templateUrl: './landing-body.component.html',
  styleUrl: './landing-body.component.scss'
})
export class LandingBodyComponent {
services: any[] = [
  {
    icon: 'tools',
    title: 'Window Repair',
    description:
      'Expert repair for all types of window damage, from minor cracks to full glass replacement.',
    imageUrl:
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80'
  },
  {
    icon: 'door-open',
    title: 'Door Installation',
    description:
      'Professional installation of new doors, ensuring security and perfect fit for your property.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
  },
  {
    icon: 'gear-wide-connected',
    title: 'Preventative Maintenance',
    description:
      'Regular check-ups and maintenance to extend the lifespan of your windows and doors.',
    imageUrl:
      'https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=800&q=80'
  }
];

}
