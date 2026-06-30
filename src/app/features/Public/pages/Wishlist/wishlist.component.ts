import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WishlistItem, WishlistService } from '../../Services/wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.scss',
})
export class WishlistComponent implements OnInit {
  items: WishlistItem[] = [];

  constructor(
    private wishlist: WishlistService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.items = this.wishlist.getAll();
    console.log(this.items);
  }
  proceedToReview() {
    const wishlistItems = this.wishlist.getAll();

    if (!wishlistItems.length) {
      return;
    }

    const selectedServices = wishlistItems.map((w) => ({
      id: w.serviceId,
      name: w.name,
      description: w.description,
      fileUrl: w.fileUrl,
      baseCost: 0,
      metadata: w.metadata ?? [],
      inputs: [],
    }));

    this.router.navigate(['/FenetrationMaintainence/Home/service-review'], {
      state: { selectedServices },
    });
  }
  remove(id: number) {
    this.wishlist.remove(id);
    this.items = this.wishlist.getAll();
  }

  backToExplorer() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-explorer']);
  }
}
