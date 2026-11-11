import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DashboardService } from './dashboard.service';
import { DashboardPageComponent } from './dashboard-page.component';
import { EnlaceFormComponent, urlHttp } from './components/enlace-form.component';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { CodigoQr, Enlace, estadoActual } from './dashboard.models';

const api = 'http://localhost:8080/api/v1';
const enlace: Enlace = {
  id: 1, urlOriginal: 'https://example.com/promo', urlCorta: 'https://clink.pe/promo', codigo: 'abc123',
  alias: 'promo', nombrePersonal: 'Promoción', fuente: 'Instagram', clicsTotal: 12, clicsMovil: 7, clicsDesktop: 4,
  fechaExpiracion: '2099-12-01T00:00:00', fechaCreacion: '2026-11-11T10:00:00', estado: 'ACTIVO'
};
const qr: CodigoQr = { id: 1, tipo: 'INDEPENDIENTE', urlDestino: 'https://example.com', codigo: 'qr123', imagenBase64: '', clicsTotal: 5, fechaCreacion: '2026-11-11T10:00:00', activo: true };
const perfil = { id: 5, nombre: 'Ana Pérez', email: 'ana@example.com', rol: 'CLIENTE', activo: true, planNombre: 'Plan Gratuito', limiteRecursos: 10, recursosUsados: 1 };

describe('Dashboard: API y reglas del negocio', () => {
  let data: DashboardService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DashboardService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
    TestBed.inject(StorageService).set('usuarioId', '5');
    data = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { try { http.verify(); } finally { TestBed.inject(AuthService).logout(); TestBed.resetTestingModule(); } });
  function responder(enlaces = [enlace], qrs = [qr]): void {
    http.expectOne(`${api}/auth/perfil/5`).flush(perfil);
    http.expectOne(`${api}/enlaces`).flush(enlaces);
    http.expectOne(`${api}/qr`).flush(qrs);
  }
  it('consulta el perfil y recursos del usuario; agrega fuentes reales y clics de enlaces', () => {
    data.cargar();
    responder([enlace, { ...enlace, id: 2, clicsTotal: 3, clicsMovil: 1, clicsDesktop: 2 }]);
    http.expectOne(`${api}/clicks/enlace/1/fuente`).flush({ instagram: 8, directo: 4 });
    http.expectOne(`${api}/clicks/enlace/2/fuente`).flush({ instagram: 3 });
    expect(data.totalClics()).toBe(15);
    expect(data.fuentes()).toEqual({ instagram: 11, directo: 4 });
    expect(data.dispositivos().map(d => d.valor)).toEqual([8, 6, 1]);
    expect(data.usados()).toBe(3);
    expect(data.cargando()).toBe(false);
  });
  it('bloquea la creación con diez recursos mixtos y no cuenta QR inactivos', () => {
    data.perfil.set(perfil as NonNullable<ReturnType<typeof data.perfil>>);
    data.enlaces.set(Array.from({ length: 9 }, (_, id) => ({ ...enlace, id })));
    data.qrs.set([qr, { ...qr, id: 2, activo: false }]);
    expect(data.usados()).toBe(10);
    expect(data.puedeCrear()).toBe(false);
    data.enlaces.set([enlace]);
    expect(data.puedeCrear()).toBe(true);
  });
  it('si fallan las fuentes conserva enlaces y distingue estadísticas no disponibles', () => {
    data.cargar(); responder();
    http.expectOne(`${api}/clicks/enlace/1/fuente`).flush({}, { status: 500, statusText: 'Error' });
    expect(data.enlaces().length).toBe(1);
    expect(data.fuentes()).toBeNull();
    expect(data.error()).toBe('');
  });
  it('distingue una cuenta vacía de un error y permite reintentar', () => {
    data.cargar();
    responder([], []);
    expect(data.error()).toBe('');
    expect(data.totalClics()).toBe(0);
    data.cargar();
    http.expectOne(`${api}/auth/perfil/5`).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(http.expectOne(`${api}/enlaces`).cancelled).toBe(true);
    expect(http.expectOne(`${api}/qr`).cancelled).toBe(true);
    expect(data.error()).toContain('No pudimos cargar');
    expect(data.puedeCrear()).toBe(false);
    expect(data.cargando()).toBe(false);
    data.cargar(); responder([], []);
    expect(data.error()).toBe('');
  });
  it('solicita iniciar sesión de nuevo si falta el id, sin consultar otro perfil', () => {
    TestBed.inject(StorageService).remove('usuarioId');
    data.cargar();
    http.expectNone(() => true);
    expect(data.sesionIncompleta()).toBe(true);
    expect(data.error()).toContain('Vuelve a iniciar sesión');
  });
  it('crea y elimina usando los endpoints autenticados sin ids de usuario en la ruta', () => {
    data.crear({ urlOriginal: enlace.urlOriginal, alias: 'promo' }).subscribe();
    const request = http.expectOne(`${api}/enlaces`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.alias).toBe('promo'); request.flush(enlace);
    data.eliminar(1).subscribe();
    const eliminar = http.expectOne(`${api}/enlaces/1`);
    expect(eliminar.request.method).toBe('DELETE'); eliminar.flush(null);
  });
  it('descarga QR como archivo binario', () => {
    data.descargarQr(1).subscribe();
    const request = http.expectOne(`${api}/qr/1/descargar`);
    expect(request.request.responseType).toBe('blob'); request.flush(new Blob());
  });
});

describe('Dashboard: formularios y presentación', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [DashboardService, provideHttpClient(), provideHttpClientTesting(), provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { data: { vista: 'enlaces' } } } }] }));
  it('valida URLs HTTP/HTTPS y rechaza protocolos ejecutables o URLs incompletas', () => {
    expect(urlHttp(new FormControl('https://example.com'))).toBeNull();
    for (const valor of ['javascript:alert(1)', 'ftp://example.com', 'example.com']) expect(urlHttp(new FormControl(valor))).toEqual({ url: true });
  });
  it('no emite formularios inválidos y limpia espacios de los datos válidos', () => {
    const c = TestBed.createComponent(EnlaceFormComponent).componentInstance;
    const emitidos: unknown[] = []; c.guardar.subscribe(v => emitidos.push(v));
    c.enviar(); expect(emitidos).toHaveLength(0);
    c.form.setValue({ urlOriginal: 'https://example.com', alias: 'mi-promo', nombrePersonal: '  Campaña  ', fuente: ' Instagram ' });
    c.enviar(); expect(emitidos).toEqual([{ urlOriginal: 'https://example.com', alias: 'mi-promo', nombrePersonal: 'Campaña', fuente: 'Instagram' }]);
    c.form.controls.alias.setValue('alias con espacios'); c.enviar(); expect(emitidos).toHaveLength(1);
  });
  it('muestra los errores después de tocar el mismo control y los quita al corregirlo', async () => {
    const fixture = TestBed.createComponent(FormErrorComponent);
    const control = new FormControl(''); control.setErrors({ required: true });
    fixture.componentRef.setInput('control', control); fixture.componentRef.setInput('reglas', { required: 'Obligatorio' });
    fixture.detectChanges(); await fixture.whenStable(); expect(fixture.nativeElement.textContent).not.toContain('Obligatorio');
    control.markAsTouched(); await fixture.whenStable(); expect(fixture.nativeElement.textContent).toContain('Obligatorio');
    control.setValue('Correcto'); control.setErrors(null); await fixture.whenStable(); expect(fixture.nativeElement.textContent).not.toContain('Obligatorio');
  });
  it('considera vencido un enlace cuyo estado en la API todavía es activo', () => {
    expect(estadoActual({ ...enlace, fechaExpiracion: '2020-01-01T00:00:00' })).toBe('EXPIRADO');
    expect(estadoActual({ ...enlace, estado: 'INACTIVO', fechaExpiracion: '2020-01-01T00:00:00' })).toBe('INACTIVO');
  });
  it('busca, filtra y pagina sin modificar la lista original', () => {
    const data = TestBed.inject(DashboardService);
    data.enlaces.set(Array.from({ length: 11 }, (_, id) => ({ ...enlace, id, nombrePersonal: `Promo ${id}`, estado: id === 0 ? 'INACTIVO' : 'ACTIVO' })));
    const c = TestBed.createComponent(DashboardPageComponent).componentInstance;
    expect(c.visibles()).toHaveLength(8); c.pagina.set(2); expect(c.visibles()).toHaveLength(3);
    c.busqueda.set('Promo 10'); expect(c.filtrados()).toHaveLength(1); expect(c.paginaActual()).toBe(1);
    c.busqueda.set(''); c.filtroEstado.set('INACTIVO'); expect(c.filtrados().map(e => e.id)).toEqual([0]);
    expect(data.enlaces()).toHaveLength(11);
  });
});
