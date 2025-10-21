import { Component } from '@angular/core';
import { AuthService } from '../../core/Auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
 constructor(private auth: AuthService) {}
  loginIfNeeded(){ if (!this.auth.isLoggedIn()) this.auth.fakeLoginAsAdmin(); }
  logout(){ this.auth.logout(); location.href = '/'; }
}
