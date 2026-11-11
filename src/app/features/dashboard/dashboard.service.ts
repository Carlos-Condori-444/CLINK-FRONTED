import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';
import { extraerMensajeError } from '../../core/models/api-error.model';
import { CodigoQr, CrearEnlace, Enlace, estadoActual } from './dashboard.models';

@Injectable()
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = `${environment.apiUrl}/api/v1`;
  readonly perfil = signal<Usuario | null>(null);
  readonly enlaces = signal<Enlace[]>([]);
  readonly qrs = signal<CodigoQr[]>([]);
  readonly fuentes = signal<Record<string, number> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly sesionIncompleta = computed(() => !this.auth.getUsuarioId());
  readonly totalClics = computed(() => this.enlaces().reduce((s, e) => s + e.clicsTotal, 0));
  readonly activos = computed(() => this.enlaces().filter(e => estadoActual(e) === 'ACTIVO').length);
  // El perfil actual cuenta solo enlaces; el requisito incluye QR activos.
  readonly usados = computed(() => this.enlaces().length + this.qrs().filter(q => q.activo).length);
  readonly limite = computed(() => this.perfil()?.limiteRecursos ?? 0);
  readonly puedeCrear = computed(() => !!this.perfil() && !this.error() && !this.cargando() && this.usados() < this.limite());
  readonly dispositivos = computed(() => {
    const movil = this.enlaces().reduce((s, e) => s + e.clicsMovil, 0);
    const desktop = this.enlaces().reduce((s, e) => s + e.clicsDesktop, 0);
    return [
      { nombre: 'Móvil', valor: movil, color: '#7560db' },
      { nombre: 'Escritorio', valor: desktop, color: '#b8a8ef' },
      { nombre: 'Otros', valor: Math.max(0, this.totalClics() - movil - desktop), color: '#e4def6' }
    ];
  });
  readonly canales = computed(() => Object.entries(this.fuentes() ?? {})
    .map(([nombre, valor]) => ({ nombre: nombre === 'null' || !nombre ? 'Directo / sin referencia' : nombre, valor }))
    .sort((a, b) => b.valor - a.valor));

  cargar(): void {
    if (this.cargando()) return;
    const id = this.auth.getUsuarioId();
    if (!id) { this.error.set('Vuelve a iniciar sesión para cargar los datos de tu cuenta.'); return; }
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      perfil: this.http.get<Usuario>(`${this.api}/auth/perfil/${id}`),
      enlaces: this.http.get<Enlace[]>(`${this.api}/enlaces`),
      qrs: this.http.get<CodigoQr[]>(`${this.api}/qr`)
    }).pipe(
      switchMap(datos => {
        const consultas = datos.enlaces.map(e => this.http.get<Record<string, number>>(`${this.api}/clicks/enlace/${e.id}/fuente`));
        const fuentes$ = consultas.length ? forkJoin(consultas).pipe(
          map(resultados => {
            const total: Record<string, number> = Object.create(null);
            for (const fuente of resultados) for (const [nombre, valor] of Object.entries(fuente)) {
              total[nombre] = (total[nombre] ?? 0) + valor;
            }
            return total;
          }), catchError(() => of(null))
        ) : of({} as Record<string, number>);
        return fuentes$.pipe(map(fuentes => ({ ...datos, fuentes })));
      }),
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.cargando.set(false))
    ).subscribe({
      next: datos => {
        this.perfil.set(datos.perfil);
        this.enlaces.set([...datos.enlaces].sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)));
        this.qrs.set(datos.qrs);
        this.fuentes.set(datos.fuentes);
      },
      error: err => this.error.set(extraerMensajeError(err, 'No pudimos cargar tu dashboard. Comprueba la conexión e inténtalo de nuevo.'))
    });
  }
  crear(data: CrearEnlace) { return this.http.post<Enlace>(`${this.api}/enlaces`, data); }
  eliminar(id: number) { return this.http.delete<void>(`${this.api}/enlaces/${id}`); }
  descargarQr(id: number) { return this.http.get(`${this.api}/qr/${id}/descargar`, { responseType: 'blob' }); }
}
