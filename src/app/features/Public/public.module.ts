import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LandingPageComponent } from './pages/landing-page/landing-page/landing-page.component';
import { LandingNavbarComponent } from './pages/landing-page/landing-navbar/landing-navbar.component';
import { LandingBannerComponent } from './pages/landing-page/landing-banner/landing-banner.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from '../admin/admin-routing.module';
import { LandingFooterComponent } from './pages/landing-page/landing-footer/landing-footer.component';
import { HomeComponent } from './pages/Home/home/home.component';
import { LandingBodyComponent } from './pages/landing-page/landing-body/landing-body.component';
import { ServiceExplorerComponent } from './pages/service-explorer/service-explorer.component';
import { ServiceExplorerOptionAComponent } from './pages/service-explorer-option-a/service-explorer-option-a.component';
import { ServiceExplorerOptionBComponent } from './pages/service-explorer-option-b/service-explorer-option-b.component';
import { ServiceExplorerOptionCComponent } from './pages/service-explorer-option-c/service-explorer-option-c.component';
import { ServiceUserFormComponent } from './pages/service-user-form/service-user-form.component';
import { WishlistComponent } from './pages/Wishlist/wishlist.component';


@NgModule({
  declarations: [
    LandingPageComponent,
    LandingNavbarComponent,
    LandingBannerComponent,
    LandingFooterComponent,
    HomeComponent,
    LandingBodyComponent,
    ServiceExplorerComponent,
    ServiceExplorerOptionAComponent,
    ServiceExplorerOptionBComponent,
    ServiceExplorerOptionCComponent,
    ServiceUserFormComponent,
    WishlistComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule, AdminRoutingModule, MatIcon ,MatPaginatorModule,FormsModule, ReactiveFormsModule  
  ]
})
export class PublicModule { }
