import { HttpErrorResponse } from '@angular/common/http';

export function extraerMensajeError(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object') {
      const mensaje = (body as { mensaje?: unknown; message?: unknown }).mensaje
        ?? (body as { message?: unknown }).message;
      if (typeof mensaje === 'string' && mensaje.trim()) {
        return mensaje;
      }
    }
  }
  return fallback;
}
