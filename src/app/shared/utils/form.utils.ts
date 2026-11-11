import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordsIguales(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmar = group.get('confirmarPassword')?.value;
  if (password && confirmar && password !== confirmar) {
    group.get('confirmarPassword')?.setErrors({ noCoincide: true });
    return { noCoincide: true };
  }
  return null;
}
