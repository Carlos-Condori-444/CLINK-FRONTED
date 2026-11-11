import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { extraerMensajeError } from '../../../core/models/api-error.model';
import { passwordsIguales } from '../../../shared/utils/form.utils';
import { PasswordInputComponent } from '../../../shared/components/password-input/password-input.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, PasswordInputComponent, FormErrorComponent],
  templateUrl: './registro.component.html'
})
export class RegistroComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = false;

  form = this.fb.group(
    {
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      confirmarPassword: ['', [Validators.required]]
    },
    { validators: passwordsIguales }
  );

  reglasNombre: Record<string, string> = {
    required: 'El nombre es obligatorio',
    minlength: 'Mínimo 3 caracteres',
    maxlength: 'Máximo 100 caracteres'
  };

  reglasEmail: Record<string, string> = {
    required: 'El correo es obligatorio',
    email: 'Ingresa un correo válido',
    maxlength: 'Máximo 150 caracteres'
  };

  reglasPassword: Record<string, string> = {
    required: 'La contraseña es obligatoria',
    minlength: 'Mínimo 6 caracteres',
    maxlength: 'Máximo 50 caracteres'
  };

  reglasConfirmar: Record<string, string> = {
    required: 'Confirma tu contraseña',
    noCoincide: 'Las contraseñas no coinciden'
  };

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.registrar({
      nombre: this.form.value.nombre!.trim(),
      email: this.form.value.email!.trim().toLowerCase(),
      password: this.form.value.password!
    }).subscribe({
      next: (usuario) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          html: `
            <p>Bienvenido <b>${usuario.nombre}</b>.</p>
            <p>Ya puedes iniciar sesión con tu correo.</p>
          `,
          confirmButtonText: 'Ir al login',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/login'], {
            queryParams: { email: usuario.email }
          });
        });
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al registrarse',
          text: extraerMensajeError(err, 'No se pudo crear la cuenta. Inténtalo de nuevo.')
        });
      }
    });
  }
}
