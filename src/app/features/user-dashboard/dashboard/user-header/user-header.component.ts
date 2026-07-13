import {
  Component,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/Auth/auth.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.scss',
})
export class UserHeaderComponent {
  /** Emitted when the hamburger is pressed so the shell can toggle the sidebar. */
  @Output() menuToggle = new EventEmitter<void>();

  dropdownOpen = false;

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/user/dashboard/profile']);
  }

  logout(): void {
    this.dropdownOpen = false;
    this.auth.logout();
    this.router.navigate(['/FenetrationMaintainence']);
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
