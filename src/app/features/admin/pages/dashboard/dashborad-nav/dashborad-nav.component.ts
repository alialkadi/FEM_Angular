import { Component } from '@angular/core';
import { AuthService } from '../../../../../core/Auth/auth.service';
import { DASHBOARD_SECTIONS, DashboardSection } from './Dashboard-section';

@Component({
  selector: 'app-dashborad-nav',
  templateUrl: './dashborad-nav.component.html',
  styleUrl: './dashborad-nav.component.scss'
})
export class DashboradNavComponent {
  sections : DashboardSection[] = [];
  constructor(private auth: AuthService) { }
  ngOnInit(): void {
    const role = this.auth.getUserRole();
    console.log(role)
    this.sections = DASHBOARD_SECTIONS.filter(s=> s.roles.includes(role))
    
  }
}
