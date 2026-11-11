import { ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
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
  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    effect(onCleanup => {
      const subscription = this.control()?.events.subscribe(() => this.changeDetector.markForCheck());
      onCleanup(() => subscription?.unsubscribe());
    });
  }

  mensaje(): string | null {
    const ctrl = this.control();
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return null;
    const errores = ctrl.errors;
    if (!errores) return null;
    const reglas = this.reglas();
    for (const clave of Object.keys(reglas)) {
      if (errores[clave]) return reglas[clave];
    }
    return null;
  }
}
