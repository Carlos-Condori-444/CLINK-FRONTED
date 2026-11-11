export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'ADMIN';
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'CLIENTE' | 'ADMIN';
  activo: boolean;
  planNombre: string;
  limiteRecursos: number;
  recursosUsados: number;
}
