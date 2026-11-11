import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { RegistroComponent } from './features/auth/registro/registro.component';
import { LoginComponent } from './features/auth/login/login.component';
import { publicGuard } from './core/guards/public.guard';
import { authGuard } from './core/guards/auth.guard';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { StorageService } from './core/services/storage.service';

const routeStub = {} as ActivatedRouteSnapshot;
const stateStub = {} as RouterStateSnapshot;

describe('Verificación cliente (R1-R5, L1-L3)', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroComponent, LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(StorageService).remove('token');
    http.verify();
  });

  function registro(): RegistroComponent {
    return TestBed.createComponent(RegistroComponent).componentInstance;
  }

  function login(): LoginComponent {
    return TestBed.createComponent(LoginComponent).componentInstance;
  }

  it('R1: nombre requerido', () => {
    const f = registro().form;
    f.get('nombre')!.setValue('');
    expect(f.get('nombre')!.invalid).toBe(true);
  });

  it('R2: nombre min 3 y max 100', () => {
    const c = registro().form.get('nombre')!;
    c.setValue('ab');
    expect(c.errors?.['minlength']).toBeTruthy();
    c.setValue('a'.repeat(101));
    expect(c.errors?.['maxlength']).toBeTruthy();
    c.setValue('Alfonso');
    expect(c.valid).toBe(true);
  });

  it('R3: email requerido, formato y max 150', () => {
    const c = registro().form.get('email')!;
    c.setValue('');
    expect(c.errors?.['required']).toBeTruthy();
    c.setValue('no-es-email');
    expect(c.errors?.['email']).toBeTruthy();
    c.setValue(`${'a'.repeat(145)}@x.com`);
    expect(c.errors?.['maxlength']).toBeTruthy();
    c.setValue('a@b.com');
    expect(c.valid).toBe(true);
  });

  it('R4: password requerido, min 6 y max 50', () => {
    const c = registro().form.get('password')!;
    c.setValue('');
    expect(c.errors?.['required']).toBeTruthy();
    c.setValue('abc');
    expect(c.errors?.['minlength']).toBeTruthy();
    c.setValue('a'.repeat(51));
    expect(c.errors?.['maxlength']).toBeTruthy();
    c.setValue('abcdef');
    expect(c.valid).toBe(true);
  });

  it('R5: confirmarPassword requerido y passwordsIguales', () => {
    const f = registro().form;
    f.get('confirmarPassword')!.setValue('');
    expect(f.get('confirmarPassword')!.errors?.['required']).toBeTruthy();
    f.get('password')!.setValue('abcdef');
    f.get('confirmarPassword')!.setValue('xyz123');
    expect(f.get('confirmarPassword')!.errors?.['noCoincide']).toBe(true);
    expect(f.errors?.['noCoincide']).toBeTruthy();
    f.get('confirmarPassword')!.setValue('abcdef');
    expect(f.get('confirmarPassword')!.valid).toBe(true);
    expect(f.errors).toBeNull();
  });

  it('L1: email del login requerido y con formato', () => {
    const c = login().form.get('email')!;
    c.setValue('');
    expect(c.errors?.['required']).toBeTruthy();
    c.setValue('mal');
    expect(c.errors?.['email']).toBeTruthy();
  });

  it('L2: password del login requerido y min 6', () => {
    const c = login().form.get('password')!;
    c.setValue('');
    expect(c.errors?.['required']).toBeTruthy();
    c.setValue('12345');
    expect(c.errors?.['minlength']).toBeTruthy();
    c.setValue('123456');
    expect(c.valid).toBe(true);
  });

  it('L3: formulario de login invalido no llama al backend', () => {
    const cmp = login();
    cmp.form.get('email')!.setValue('no-es-email');
    cmp.onSubmit();
    expect(http.match(() => true).length).toBe(0);
    expect(cmp.cargando).toBe(false);
  });
});

describe('Guards de navegación (G1-G3)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });
  });

  afterEach(() => TestBed.inject(StorageService).remove('token'));

  it('G1: autenticado es redirigido fuera de /login y /registro', () => {
    const storage = TestBed.inject(StorageService);
    storage.set('token', 'token-valido');
    const resultado = TestBed.runInInjectionContext(() => publicGuard(routeStub, stateStub));
    expect(resultado).toBeInstanceOf(UrlTree);
    expect((resultado as UrlTree).toString()).toBe('/dashboard');
  });

  it('G2: sin sesion, /dashboard redirige a /login', () => {
    const resultado = TestBed.runInInjectionContext(() => authGuard(routeStub, stateStub));
    expect(resultado).toBeInstanceOf(UrlTree);
    expect((resultado as UrlTree).toString()).toBe('/login');
  });

  it('G3: 401/403 global -> logout automatico y redirect a /login', () => {
    const storage = TestBed.inject(StorageService);
    const router = TestBed.inject(Router);
    const httpCtrl = TestBed.inject(HttpTestingController);
    const client = TestBed.inject(HttpClient);
    const navigate = vi.spyOn(router, 'navigate');

    storage.set('token', 'token-para-expirar');

    client.get('/api/v1/enlaces').subscribe({ error: () => {} });
    httpCtrl.expectOne('/api/v1/enlaces').flush('x', { status: 403, statusText: 'Forbidden' });
    expect(storage.get('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);

    storage.set('token', 'token-para-expirar');
    client.get('/api/v1/enlaces').subscribe({ error: () => {} });
    httpCtrl.expectOne('/api/v1/enlaces').flush('x', { status: 401, statusText: 'Unauthorized' });
    expect(storage.get('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
