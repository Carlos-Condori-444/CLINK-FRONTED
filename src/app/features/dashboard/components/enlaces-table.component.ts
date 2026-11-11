import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Enlace, estadoActual } from '../dashboard.models';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-enlaces-table',
  imports: [DatePipe, DecimalPipe, IconComponent],
  template: `
    <div class="table-scroll" tabindex="0" role="region" aria-label="Lista de enlaces">
      <table><caption class="visually-hidden">Enlaces, métricas y acciones</caption><thead><tr><th scope="col">ENLACE</th><th scope="col">CANAL</th><th scope="col">CLICS</th><th scope="col">ESTADO</th><th scope="col">CREADO</th><th scope="col"><span class="visually-hidden">Acciones</span></th></tr></thead>
        <tbody>@for (enlace of enlaces(); track enlace.id) {
          <tr><td><div class="link-info"><span class="link-icon"><app-icon name="link" /></span><div><strong>{{ enlace.nombrePersonal || enlace.alias || 'Sin título' }}</strong><a [href]="urlSegura(enlace.urlCorta)" target="_blank" rel="noopener noreferrer">{{ enlace.urlCorta }}</a><small [title]="enlace.urlOriginal">{{ enlace.urlOriginal }}</small></div></div></td>
          <td><span class="channel">{{ enlace.fuente || 'Sin asignar' }}</span></td><td class="clicks">{{ enlace.clicsTotal | number }}</td>
          <td><span class="status" [class.active]="estado(enlace) === 'ACTIVO'" [class.expired]="estado(enlace) === 'EXPIRADO'"><span></span>{{ etiquetas[estado(enlace)] }}</span></td>
          <td class="date">{{ enlace.fechaCreacion | date:'dd/MM/yyyy' }}<small>{{ enlace.fechaExpiracion ? 'Vence ' + (enlace.fechaExpiracion | date:'dd/MM/yyyy') : 'Sin vencimiento' }}</small></td>
          <td><div class="actions"><button (click)="copiar.emit(enlace)" [attr.aria-label]="'Copiar enlace ' + (enlace.nombrePersonal || enlace.codigo)" title="Copiar enlace"><app-icon name="copy" /></button><button class="delete" (click)="eliminar.emit(enlace)" [disabled]="ocupado()" [attr.aria-label]="'Eliminar enlace ' + (enlace.nombrePersonal || enlace.codigo)" title="Eliminar enlace"><app-icon name="trash" /></button></div></td></tr>
        } @empty { <tr><td colspan="6"><div class="empty"><app-icon name="search" /><strong>No hay enlaces que mostrar</strong><span>{{ vacio() }}</span></div></td></tr> }</tbody>
      </table>
    </div>`,
  styles: `:host { display:block; } .table-scroll { overflow-x:auto; position:relative; } table { width:100%; border-collapse:collapse; text-align:left; } th { font-size:9px; letter-spacing:1px; color:#9295a7; font-weight:600; background:#fafafe; padding:13px 20px; white-space:nowrap; border-block:1px solid #eff0f5; } td { padding:18px 20px; border-bottom:1px solid #f0f1f6; font-size:12px; } tr:last-child td { border-bottom:0; } .link-info { display:flex; gap:12px; align-items:center; min-width:230px; } .link-icon { display:grid; place-items:center; width:37px; height:37px; color:#8a78bf; background:#f5f2fc; border:1px solid #ede8fa; border-radius:9px; flex-shrink:0; } .link-info strong { display:block; font-size:12px; font-weight:600; margin-bottom:3px; } .link-info a { color:#8065c8; text-decoration:none; font-size:11px; &:hover { text-decoration:underline; } } .link-info small { display:block; color:#9396a7; font-size:10px; max-width:240px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; margin-top:3px; } .channel { font-size:10px; padding:4px 8px; background:#f5f6fa; border:1px solid #eceef4; border-radius:5px; color:#7b8095; } .clicks { font-weight:650; } .status { display:inline-flex; align-items:center; gap:5px; font-size:10px; padding:4px 8px; border-radius:5px; background:#f0f1f5; color:#7c8195; white-space:nowrap; > span { width:4px; height:4px; border-radius:50%; background:currentColor; } &.active { background:#eaf7f0; color:#428665; } &.expired { background:#fff3e6; color:#ad7e44; } } .date { color:#808498; font-size:10px; white-space:nowrap; small { display:block; font-size:9px; margin-top:4px; color:#9c9faf; } } .actions { display:flex; gap:7px; button { border:0; background:none; color:#969aab; padding:5px; border-radius:5px; &:hover { background:#f1edfa; color:#7154ce; } &.delete:hover { color:#b2435a; background:#fff0f2; } &:disabled { opacity:.4; } } } .empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:42px 16px; color:#9094a7; strong { color:#555b74; font-size:13px; } span { font-size:12px; } }`
})
export class EnlacesTableComponent {
  readonly enlaces = input.required<Enlace[]>();
  readonly vacio = input('Crea tu primer enlace para comenzar.');
  readonly ocupado = input(false);
  readonly copiar = output<Enlace>();
  readonly eliminar = output<Enlace>();
  readonly estado = estadoActual;
  readonly etiquetas = { ACTIVO: 'Activo', INACTIVO: 'Inactivo', EXPIRADO: 'Expirado', ELIMINADO: 'Eliminado' };
  urlSegura(valor: string): string | null {
    try { return ['http:', 'https:'].includes(new URL(valor).protocol) ? valor : null; } catch { return null; }
  }
}
