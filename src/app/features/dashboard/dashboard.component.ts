import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <nav class="navbar navbar-light bg-light px-3 mb-4 shadow-sm">
      <span class="navbar-brand fw-bold mb-0">CLINK</span>
      <button class="btn btn-outline-danger btn-sm" (click)="logout()">
        Cerrar sesión
      </button>
    </nav>
    <div class="container py-5 text-center">
      <p class="text-muted">Dashboard — próximamente</p>
    </div>
  `
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
