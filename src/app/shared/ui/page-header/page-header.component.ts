import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  template: `
<header class="header">
  <div class="brand">
    <i class="bi bi-grid"></i> Admin Panel
  </div>

  <div class="actions">
    <div class="menu-container" (click)="toggleDropdown()">
      <i class="bi bi-person-circle user-icon"></i>
      <i class="bi bi-caret-down-fill caret" [class.open]="dropdownOpen"></i>

      <ul class="dropdown" *ngIf="dropdownOpen">
        <li (click)="openSettings()">
          <i class="bi bi-gear-fill"></i> Settings
        </li>
        <li class="logout" (click)="logout()">
          <i class="bi bi-box-arrow-right"></i> Logout
        </li>
      </ul>
    </div>
  </div>
</header>
  `,
  styles: [`
/* Header Layout */
.header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.brand {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  gap: 8px;
}

/* Actions and Icons */
.actions {
  display: flex;
  align-items: center;
}

.menu-container {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-icon {
  font-size: 1.6rem;
  color: #475569;
}

.caret {
  font-size: 0.75rem;
  color: #64748b;
  transition: transform 0.2s ease;
}

.caret.open {
  transform: rotate(180deg);
}

/* Dropdown Menu */
.dropdown {
  position: absolute;
  top: 48px;
  right: 0;
  width: 170px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  list-style: none;
  padding: 8px 0;
  margin: 0;
  z-index: 10;
  animation: fadeIn 0.2s ease-in-out;
}

.dropdown li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 0.95rem;
  color: #334155;
  transition: background 0.2s ease;
}

.dropdown li:hover {
  background: #f8fafc;
}

.dropdown li i {
  font-size: 1rem;
}

.dropdown li.logout {
  color: #dc2626;
  font-weight: 500;
}

/* Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
  `]
})
export class PageHeaderComponent {
  dropdownOpen = false;

  constructor(private router: Router) {}

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  logout() {
    localStorage.removeItem('app_token');
    this.router.navigate(['/FenetrationMaintainence']);
  }

  openSettings() {
    this.router.navigate(['/admin/dashboard/setting']);
  }
}
