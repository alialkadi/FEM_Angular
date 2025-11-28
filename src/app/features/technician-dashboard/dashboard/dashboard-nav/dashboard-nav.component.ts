import { Component } from '@angular/core';
import { AuthService } from '../../../../core/Auth/auth.service';
import { DASHBOARD_SECTIONS, DashboardSection } from '../../../admin/pages/dashboard/dashborad-nav/Dashboard-section';

@Component({
  selector: 'app-tech-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent {
  sections : DashboardSection[] = [];
  
constructor(private auth: AuthService) { }
  ngOnInit(): void {
    const role = this.auth.getUserRole();
    console.log(role)
    this.sections = DASHBOARD_SECTIONS.filter(s=> s.roles.includes(role))
    console.log(this.sections,role)
  }
}
