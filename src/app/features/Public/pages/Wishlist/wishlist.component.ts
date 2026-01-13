import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WishlistItem, WishlistService } from '../../Services/wishlist.service';

@Component({
  selector: 'app-wishlist',
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.scss'

})
export class WishlistComponent implements OnInit {

  items: WishlistItem[] = [];

  constructor(
    private wishlist: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
      this.items = this.wishlist.getAll();
      console.log(this.items)
  }

  remove(id: number) {
    this.wishlist.remove(id);
    this.items = this.wishlist.getAll();
  }

  backToExplorer() {
    this.router.navigate(['/FenetrationMaintainence/Home/service-explorer']);
  }
}
