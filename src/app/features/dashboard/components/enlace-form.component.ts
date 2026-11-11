import { Component, inject, input, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CrearEnlace } from '../dashboard.models';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { IconComponent } from './icon.component';

export function urlHttp(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    const url = new URL(String(control.value));
    return ['http:', 'https:'].includes(url.protocol) && !!url.hostname ? null : { url: true };
  } catch { return { url: true }; }
}

@Component({
  selector: 'app-enlace-form',
  imports: [ReactiveFormsModule, FormErrorComponent, IconComponent],
  template: `
    <section aria-labelledby="crear-titulo">
      <header><div><h2 id="crear-titulo">Crea una nueva conexión</h2><p>Convierte una URL larga en un enlace fácil de compartir.</p></div><button type="button" (click)="cancelar.emit()" [disabled]="guardando()" aria-label="Cerrar formulario"><app-icon name="close" /></button></header>
      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="fields">
          <div class="wide"><label for="url-original">URL de destino <span>*</span></label><input id="url-original" class="form-control" formControlName="urlOriginal" type="url" placeholder="https://tu-sitio.com/una-gran-idea" autocomplete="url" [readOnly]="guardando()" /><app-form-error [control]="form.controls.urlOriginal" [reglas]="reglasUrl" /></div>
          <div><label for="nombre-enlace">Nombre del enlace</label><input id="nombre-enlace" class="form-control" formControlName="nombrePersonal" maxlength="100" placeholder="Ej. Lanzamiento de noviembre" [readOnly]="guardando()" /></div>
          <div><label for="alias-enlace">Alias personalizado <small>Opcional</small></label><input id="alias-enlace" class="form-control" formControlName="alias" maxlength="100" placeholder="mi-campana" [readOnly]="guardando()" /><app-form-error [control]="form.controls.alias" [reglas]="reglasAlias" /></div>
          <div class="wide"><label for="fuente-enlace">Canal de la campaña <small>Opcional</small></label><input id="fuente-enlace" class="form-control" formControlName="fuente" maxlength="100" placeholder="Ej. Instagram, WhatsApp, newsletter" [readOnly]="guardando()" /></div>
        </div>
        @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
        <footer><small>La disponibilidad del alias y el cupo se verifican al crear.</small><button class="save" type="submit" [disabled]="guardando() || !permitido()">{{ guardando() ? 'Creando…' : 'Crear enlace' }} <app-icon name="arrow" /></button></footer>
      </form>
    </section>`,
  styles: `section { border:1px solid #ded5f4; background:white; border-radius:12px; padding:24px; margin-bottom:24px; } header { display:flex; justify-content:space-between; gap:16px; margin-bottom:20px; } h2 { font-size:17px; font-weight:650; margin:0 0 6px; } p, small { font-size:12px; color:#85899d; margin:0; } header button { align-self:start; border:0; background:none; color:#73788b; } .fields { display:grid; grid-template-columns:1fr 1fr; gap:16px; } .wide { grid-column:1/-1; } label { font-size:12px; font-weight:600; margin-bottom:7px; display:block; } label small { font-size:10px; font-weight:400; margin-left:5px; } label span { color:#7154ce; } input { font-size:13px; padding:11px 13px; border-color:#e1e2eb; } footer { display:flex; justify-content:space-between; gap:16px; align-items:center; margin-top:22px; } .save { border:0; background:#7154ce; color:white; padding:11px 17px; border-radius:7px; font-size:12px; display:flex; gap:10px; align-items:center; white-space:nowrap; } button:disabled { opacity:.55; } .error { color:#a33349; margin-top:16px; } @media(max-width:560px) { .fields { grid-template-columns:1fr; } footer { align-items:start; flex-direction:column; } }`
})
export class EnlaceFormComponent {
  readonly guardando = input(false);
  readonly permitido = input(true);
  readonly error = input('');
  readonly guardar = output<CrearEnlace>();
  readonly cancelar = output<void>();
  readonly form = inject(FormBuilder).nonNullable.group({
    urlOriginal: ['', [Validators.required, urlHttp]],
    nombrePersonal: ['', Validators.maxLength(100)],
    alias: ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
    fuente: ['', Validators.maxLength(100)]
  });
  readonly reglasUrl = { required: 'Ingresa la URL de destino.', url: 'Usa una URL completa que comience con http:// o https://.' };
  readonly reglasAlias = { pattern: 'Usa letras, números, guiones o guiones bajos.', maxlength: 'Máximo 100 caracteres.' };
  enviar(): void {
    if (this.guardando() || !this.permitido()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const valor = this.form.getRawValue();
    this.guardar.emit({ urlOriginal: valor.urlOriginal.trim(), nombrePersonal: valor.nombrePersonal.trim() || undefined, alias: valor.alias.trim() || undefined, fuente: valor.fuente.trim() || undefined });
  }
}
