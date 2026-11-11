import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefijo = 'clink_';

  set(clave: string, valor: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.prefijo + clave, valor);
    }
  }

  get(clave: string): string | null {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.prefijo + clave)
      : null;
  }

  remove(clave: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.prefijo + clave);
    }
  }
}
