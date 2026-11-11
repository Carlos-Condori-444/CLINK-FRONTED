import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { extraerMensajeError } from '../../core/models/api-error.model';
import { DashboardService } from './dashboard.service';
import { CodigoQr, CrearEnlace, Enlace, estadoActual } from './dashboard.models';
import { DashboardWelcomeComponent } from './components/dashboard-welcome.component';
import { DashboardAnalyticsComponent } from './components/dashboard-analytics.component';
import { DashboardQrComponent } from './components/dashboard-qr.component';
import { IconComponent } from './components/icon.component';
import { MetricCardComponent } from './components/metric-card.component';
import { EnlaceFormComponent } from './components/enlace-form.component';
import { EnlacesTableComponent } from './components/enlaces-table.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DashboardQrComponent, DashboardWelcomeComponent, DashboardAnalyticsComponent, RouterLink, IconComponent, MetricCardComponent, EnlaceFormComponent, EnlacesTableComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  readonly data = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly vista: string = inject(ActivatedRoute).snapshot.data['vista'] ?? 'resumen';
  readonly titulos: Record<string, string> = { resumen: 'Vista general', enlaces: 'Mis enlaces', estadisticas: 'Estadísticas', qr: 'Códigos QR' };
  readonly descripciones: Record<string, string> = {
    resumen: 'Una mirada a tus enlaces y a las conexiones que generan.',
    enlaces: 'Crea, encuentra y comparte tus enlaces desde un solo lugar.',
    estadisticas: 'Conoce cómo llegan las personas a tus enlaces.',
    qr: 'Tus conexiones del mundo físico al digital.'
  };
  readonly mostrarFormulario = signal(false);
  readonly guardando = signal(false);
  readonly eliminando = signal(false);
  readonly descargando = signal<number | null>(null);
  readonly errorFormulario = signal('');
  readonly mensaje = signal('');
  readonly busqueda = signal('');
  readonly filtroEstado = signal('TODOS');
  readonly pagina = signal(1);
  readonly porPagina = 8;
  readonly filtrados = computed(() => {
    const busqueda = this.busqueda().trim().toLocaleLowerCase();
    return this.data.enlaces().filter(e => (this.filtroEstado() === 'TODOS' || estadoActual(e) === this.filtroEstado()) &&
      [e.nombrePersonal, e.alias, e.urlCorta, e.urlOriginal, e.fuente].some(v => v?.toLocaleLowerCase().includes(busqueda)));
  });
  readonly paginas = computed(() => Math.max(1, Math.ceil(this.filtrados().length / this.porPagina)));
  readonly paginaActual = computed(() => Math.min(this.pagina(), this.paginas()));
  readonly visibles = computed(() => this.vista === 'resumen' ? this.data.enlaces().slice(0, 5) :
    this.filtrados().slice((this.paginaActual() - 1) * this.porPagina, this.paginaActual() * this.porPagina));
  buscar(event: Event): void { this.busqueda.set((event.target as HTMLInputElement).value); this.pagina.set(1); }
  filtrar(event: Event): void { this.filtroEstado.set((event.target as HTMLSelectElement).value); this.pagina.set(1); }
  volverLogin(): void { this.auth.logout(); void this.router.navigate(['/login']); }
  crear(data: CrearEnlace): void {
    if (this.guardando() || !this.data.puedeCrear()) return;
    this.guardando.set(true);
    this.errorFormulario.set('');
    this.data.crear(data).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: () => { this.mostrarFormulario.set(false); this.mensaje.set('Tu enlace está listo para compartir.'); this.data.cargar(); },
      error: err => this.errorFormulario.set(extraerMensajeError(err, 'No pudimos crear el enlace. Inténtalo de nuevo.'))
    });
  }
  async eliminar(enlace: Enlace): Promise<void> {
    if (this.eliminando()) return;
    this.eliminando.set(true);
    const resultado = await Swal.fire({ icon: 'warning', title: '¿Eliminar este enlace?', text: enlace.nombrePersonal || enlace.urlCorta,
      showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b2435a' });
    if (this.destroyRef.destroyed) return;
    if (!resultado.isConfirmed) { this.eliminando.set(false); return; }
    this.data.eliminar(enlace.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.eliminando.set(false))).subscribe({
      next: () => { this.mensaje.set('Enlace eliminado. Tu cupo se actualizará al recargar los datos.'); this.data.cargar(); },
      error: err => this.mensaje.set(extraerMensajeError(err, 'No pudimos eliminar el enlace. Inténtalo de nuevo.'))
    });
  }
  async copiar(enlace: Enlace): Promise<void> {
    try { await navigator.clipboard.writeText(enlace.urlCorta); this.mensaje.set('Enlace copiado al portapapeles.'); }
    catch { this.mensaje.set('No se pudo copiar. Selecciona la dirección del enlace y cópiala manualmente.'); }
  }
  descargar(qr: CodigoQr): void {
    if (this.descargando() !== null) return;
    this.descargando.set(qr.id);
    this.data.descargarQr(qr.id).pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.descargando.set(null))).subscribe({
      next: archivo => {
        const url = URL.createObjectURL(archivo);
        const enlace = document.createElement('a');
        enlace.href = url; enlace.download = `clink-qr-${qr.codigo}.png`; enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.mensaje.set('Descarga del QR iniciada.');
      },
      error: err => this.mensaje.set(extraerMensajeError(err, 'No pudimos descargar el QR.'))
    });
  }
}
