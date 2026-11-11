import { Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  template: `
    @if (mensaje(); as texto) {
      <small class="text-danger d-block">{{ texto }}</small>
    }
  `
})
export class FormErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly reglas = input.required<Record<string, string>>();

  readonly mensaje = computed(() => {
    const ctrl = this.control();
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return null;
    const errores = ctrl.errors;
    if (!errores) return null;
    const reglas = this.reglas();
    for (const clave of Object.keys(reglas)) {
      if (errores[clave]) return reglas[clave];
    }
    return null;
  });
}
