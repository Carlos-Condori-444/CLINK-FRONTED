import { Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { IconComponent } from './icon.component';
@Component({ selector: 'app-dashboard-analytics', imports: [DecimalPipe, IconComponent], templateUrl: './dashboard-analytics.component.html', styleUrl: './dashboard-analytics.component.scss' })
export class DashboardAnalyticsComponent {
  readonly data = inject(DashboardService);
  readonly donut = computed(() => {
    if (!this.data.totalClics()) return '#efedf6';
    let inicio = 0;
    return `conic-gradient(${this.data.dispositivos().map(d => {
      const fin = inicio + this.porcentaje(d.valor);
      const tramo = `${d.color} ${inicio}% ${fin}%`;
      inicio = fin;
      return tramo;
    }).join(',')})`;
  });
  porcentaje(valor: number): number { return this.data.totalClics() ? valor / this.data.totalClics() * 100 : 0; }
  porcentajeFuente(valor: number): number {
    const total = this.data.canales().reduce((s, c) => s + c.valor, 0);
    return total ? valor / total * 100 : 0;
  }
}
