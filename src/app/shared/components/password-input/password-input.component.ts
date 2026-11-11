import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-password-input',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PasswordInputComponent), multi: true }
  ],
  template: `
    <div class="input-group">
      <input
        [type]="oculto() ? 'password' : 'text'"
        class="form-control"
        [class.is-invalid]="invalid()"
        [placeholder]="placeholder()"
        [autocomplete]="autocomplete()"
        [value]="valor"
        (input)="onInput($event)"
        (blur)="touched()">
      <button
        type="button"
        class="btn btn-outline-secondary"
        (click)="alternar()"
        [attr.aria-label]="oculto() ? 'Mostrar contraseña' : 'Ocultar contraseña'">
        {{ oculto() ? '👁️' : '🙈' }}
      </button>
    </div>
  `
})
export class PasswordInputComponent implements ControlValueAccessor {
  readonly placeholder = input('Contraseña');
  readonly autocomplete = input('current-password');
  readonly invalid = input(false);

  valor = '';
  oculto = signal(true);

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: string): void {
    this.valor = v ?? '';
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(e: Event): void {
    this.valor = (e.target as HTMLInputElement).value;
    this.onChange(this.valor);
  }

  touched(): void {
    this.onTouched();
  }

  alternar(): void {
    this.oculto.update(v => !v);
  }
}
