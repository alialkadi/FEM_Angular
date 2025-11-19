import { Component } from '@angular/core';
import { AuthService } from '../../../../core/Auth/auth.service';
import { DashboardUserSection, DASHBOARD_SECTIONS } from './Dashboard-user-section';

@Component({
  selector: 'app-user-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent {
sections : DashboardUserSection[] = [];
  constructor(private auth: AuthService) { }
  ngOnInit(): void {
    const role = this.auth.getUserRole();
    console.log(role)
    this.sections = DASHBOARD_SECTIONS.filter(s=> s.roles.includes(role))
    
  }
}
