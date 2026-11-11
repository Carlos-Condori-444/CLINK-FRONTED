import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CodigoQr } from '../dashboard.models';
import { IconComponent } from './icon.component';
@Component({ selector: 'app-dashboard-qr', imports: [DatePipe, DecimalPipe, IconComponent], templateUrl: './dashboard-qr.component.html', styleUrl: './dashboard-qr.component.scss' })
export class DashboardQrComponent {
  readonly qrs = input.required<CodigoQr[]>();
  readonly descargando = input<number | null>(null);
  readonly descargar = output<CodigoQr>();
}
