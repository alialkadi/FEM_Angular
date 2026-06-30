import { ServiceExplorerComponent } from './pages/service-explorer/service-explorer.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page/landing-page.component';
import { HomeComponent } from './pages/Home/home/home.component';
import { ServiceExplorerOptionAComponent } from './pages/service-explorer-option-a/service-explorer-option-a.component';
import { ServiceExplorerOptionBComponent } from './pages/service-explorer-option-b/service-explorer-option-b.component';
import { ServiceExplorerOptionCComponent } from './pages/service-explorer-option-c/service-explorer-option-c.component';
import { ServiceRequestReviewComponent } from './pages/service-request-review/service-request-review.component';
import { ServiceUserFormComponent } from './pages/service-user-form/service-user-form.component';
import { WishlistComponent } from './pages/Wishlist/wishlist.component';
import { ServiceAdvertisedDetailComponent } from './pages/service-advertised-detail/service-advertised-detail.component';
import { LoginComponent } from '../login/login.component';
import { AboutUsComponent } from './pages/StaticFiles/about-us/about-us.component';
import { FaqComponent } from './pages/StaticFiles/faq/faq.component';
import { OurProcessComponent } from './pages/StaticFiles/our-process/our-process.component';
import { PrivacyPolicyComponent } from './pages/StaticFiles/privacy-policy/privacy-policy.component';
import { WhyUsComponent } from './pages/StaticFiles/why-us/why-us.component';
import { ForgetrPasswordComponent } from '../../core/reset-password/forgetr-password/forgetr-password.component';
import { OtpComponent } from '../../core/reset-password/otp/otp.component';
import { ResetPasswordComponent } from '../../core/reset-password/reset-password/reset-password.component';

const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  {
    path: 'Home',
    component: HomeComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'serviceexplorer', component: ServiceExplorerOptionCComponent },
      { path: 'service-review', component: ServiceRequestReviewComponent },
      { path: 'service-user-form', component: ServiceUserFormComponent },
      { path: 'Wishlist', component: WishlistComponent },
      { path: 'login', component: LoginComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'why-us', component: WhyUsComponent },
      { path: 'our-process', component: OurProcessComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'privacy-policy', component: PrivacyPolicyComponent },
      { path: 's/:slug', component: ServiceAdvertisedDetailComponent },
      {
        path: 'forgot-password',
        component: ForgetrPasswordComponent,
      },
      {
        path: 'verify-otp',
        component: OtpComponent,
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRoutingModule {}
