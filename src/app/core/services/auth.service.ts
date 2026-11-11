import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegistroRequest,
  Usuario
} from '../models/usuario.model';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);
  private readonly api = `${environment.apiUrl}/api/v1/auth`;

  registrar(data: RegistroRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.api}/registro`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, data).pipe(
      tap(res => this.storage.set('token', res.token))
    );
  }

  isAuthenticated(): boolean {
    return !!this.storage.get('token');
  }

  logout(): void {
    this.storage.remove('token');
  }
}
