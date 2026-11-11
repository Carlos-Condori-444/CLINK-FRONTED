import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IconComponent } from './icon.component';
@Component({
  selector: 'app-metric-card',
  imports: [DecimalPipe, IconComponent],
  template: `<article><div class="metric-top"><span>{{ titulo() }}</span><span class="icon" [style.color]="color()"><app-icon [name]="icono()" /></span></div><strong>{{ valor() | number }}</strong><p>{{ detalle() }}</p></article>`,
  styles: `:host { display:block; } article { background:white; border:1px solid #e9eaf2; border-radius:12px; padding:20px 22px; height:100%; } .metric-top { display:flex; justify-content:space-between; align-items:center; gap:10px; color:#787c90; font-size:12px; } .icon { display:grid; place-items:center; border-radius:9px; background:#f6f4fc; width:35px; height:35px; } strong { display:block; font-size:31px; letter-spacing:-1px; font-weight:650; margin:8px 0 6px; line-height:1.2; } p { margin:0; font-size:11px; color:#9094a4; }`
})
export class MetricCardComponent {
  readonly titulo = input.required<string>();
  readonly valor = input.required<number>();
  readonly detalle = input('');
  readonly icono = input('link');
  readonly color = input('#7154ce');
}
