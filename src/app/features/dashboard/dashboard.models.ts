export type EstadoEnlace = 'ACTIVO' | 'INACTIVO' | 'EXPIRADO' | 'ELIMINADO';
export interface Enlace {
  id: number;
  urlOriginal: string;
  urlCorta: string;
  codigo: string;
  alias: string | null;
  nombrePersonal: string | null;
  fuente: string | null;
  clicsTotal: number;
  clicsMovil: number;
  clicsDesktop: number;
  fechaExpiracion: string | null;
  fechaCreacion: string;
  estado: EstadoEnlace;
}
export interface CrearEnlace {
  urlOriginal: string;
  alias?: string;
  nombrePersonal?: string;
  fuente?: string;
}
export interface CodigoQr {
  id: number;
  tipo: 'INDEPENDIENTE' | 'ENLACE';
  urlDestino: string;
  codigo: string;
  imagenBase64: string;
  clicsTotal: number;
  fechaCreacion: string;
  activo: boolean;
}
export function estadoActual(enlace: Enlace, ahora = Date.now()): EstadoEnlace {
  if (enlace.estado === 'ACTIVO' && enlace.fechaExpiracion &&
      new Date(enlace.fechaExpiracion).getTime() <= ahora) return 'EXPIRADO';
  return enlace.estado;
}
