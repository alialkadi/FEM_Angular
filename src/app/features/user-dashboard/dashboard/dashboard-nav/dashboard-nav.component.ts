import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../../../core/Auth/auth.service';
import { DashboardUserSection, DASHBOARD_SECTIONS } from './Dashboard-user-section';

@Component({
  selector: 'app-user-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrl: './dashboard-nav.component.scss'
})
export class DashboardNavComponent {
sections : DashboardUserSection[] = [];

  /** Controls the off-canvas drawer state on tablet/mobile. */
  @Input() open = false;

  /** Emitted when a nav link is tapped so the shell can close the drawer. */
  @Output() linkClicked = new EventEmitter<void>();

  constructor(private auth: AuthService) { }
  ngOnInit(): void {
    const role = this.auth.getUserRole();
    console.log(role)
    this.sections = DASHBOARD_SECTIONS.filter(s=> s.roles.includes(role))

  }

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}
