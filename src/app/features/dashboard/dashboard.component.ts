import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from './dashboard.service';
import { IconComponent } from './components/icon.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  providers: [DashboardService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly data = inject(DashboardService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuAbierto = signal(false);
  readonly navegacion = [
    { ruta: '/dashboard', titulo: 'Vista general', icono: 'grid', exacta: true },
    { ruta: '/dashboard/enlaces', titulo: 'Mis enlaces', icono: 'link', exacta: false },
    { ruta: '/dashboard/estadisticas', titulo: 'Estadísticas', icono: 'chart', exacta: false },
    { ruta: '/dashboard/qr', titulo: 'Códigos QR', icono: 'qr', exacta: false }
  ];
  ngOnInit(): void { this.data.cargar(); }
  logout(): void { this.auth.logout(); void this.router.navigate(['/login']); }
}
