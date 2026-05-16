import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './Auth/auth.interceptor';
import { ForgetrPasswordComponent } from './reset-password/forgetr-password/forgetr-password.component';
import { OtpComponent } from './reset-password/otp/otp.component';
import { ResetPasswordComponent } from './reset-password/reset-password/reset-password.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, FormsModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule loaded twice.');
  }
}
