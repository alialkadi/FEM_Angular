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


const routes: Routes = [
  { path: '', redirectTo: 'Home', pathMatch: 'full' },
  {
    path: 'Home', component: HomeComponent, children: [
      { path: '', component: LandingPageComponent },
      { path: 'serviceexplorer', component: ServiceExplorerOptionCComponent },
      { path: 'service-review', component: ServiceRequestReviewComponent },
      { path: 'service-user-form', component: ServiceUserFormComponent },
      { path: 'Wishlist', component: WishlistComponent }

    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
