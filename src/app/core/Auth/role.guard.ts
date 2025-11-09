import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // roles expected from route data
    const expectedRoles: string[] = route.data['roles'] || [];
    const userRole = this.auth.getRole();

    console.log("expected roles", expectedRoles);
    console.log("user role", userRole);

    if (this.auth.isLoggedIn() && userRole && expectedRoles.includes(userRole)) {
      return true;
    }

    // not authorized
    this.router.navigate(['/FenetrationMaintainence']);
    return false;
  }
}
