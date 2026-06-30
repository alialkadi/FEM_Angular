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
import { ServiceAdvertisedDetailComponent } from './pages/service-advertised-detail/service-advertised-detail.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApiTimingInterceptor } from './Interceptors/api-timing.interceptor';
import { AboutUsComponent } from './pages/StaticFiles/about-us/about-us.component';
import { FaqComponent } from './pages/StaticFiles/faq/faq.component';
import { OurProcessComponent } from './pages/StaticFiles/our-process/our-process.component';
import { PrivacyPolicyComponent } from './pages/StaticFiles/privacy-policy/privacy-policy.component';
import { WhyUsComponent } from './pages/StaticFiles/why-us/why-us.component';
import { ForgetrPasswordComponent } from '../../core/reset-password/forgetr-password/forgetr-password.component';
import { OtpComponent } from '../../core/reset-password/otp/otp.component';
import { ResetPasswordComponent } from '../../core/reset-password/reset-password/reset-password.component';

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
    WishlistComponent,
    ServiceAdvertisedDetailComponent,
    AboutUsComponent,
    WhyUsComponent,
    OurProcessComponent,
    FaqComponent,
    PrivacyPolicyComponent,
    ForgetrPasswordComponent,
    OtpComponent,
    ResetPasswordComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule,
    AdminRoutingModule,
    MatIcon,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class PublicModule {}
