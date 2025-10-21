import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  template: `
   <header class="header">
  <div class="brand">Admin Panel</div>
  <div class="actions">
    <button class="logout-btn" (click)="logout()">Logout</button>
  </div>
</header>

  `,
  styles: `.header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.brand {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b; // dark slate/gray
}

.actions {
  display: flex;
  align-items: center;
}

.logout-btn {
  background: #ef4444;   /* red-500 */
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.logout-btn:hover {
  background: #dc2626;   /* darker red */
}
`
})
export class PageHeaderComponent {
  constructor(private router:Router){}
logout() {
  localStorage.removeItem('app_token'); // or your JWT storage
  // optionally clear user state
  // redirect to login
  this.router.navigate(['/login']);
}

}
