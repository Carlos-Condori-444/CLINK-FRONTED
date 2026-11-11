import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';
import { extraerMensajeError } from '../../../core/models/api-error.model';
import { PasswordInputComponent } from '../../../shared/components/password-input/password-input.component';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, PasswordInputComponent, FormErrorComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cargando = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  reglasEmail: Record<string, string> = {
    required: 'El correo es obligatorio',
    email: 'Ingresa un correo válido'
  };

  reglasPassword: Record<string, string> = {
    required: 'La contraseña es obligatoria',
    minlength: 'Mínimo 6 caracteres'
  };

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;

    this.authService.login({
      email: this.form.value.email!.trim().toLowerCase(),
      password: this.form.value.password!
    }).subscribe({
      next: (res) => {
        this.cargando = false;
        Swal.fire({
          icon: 'success',
          title: `¡Bienvenido, ${res.nombre}!`,
          timer: 1500,
          showConfirmButton: false
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: extraerMensajeError(err, 'Credenciales inválidas')
        });
      }
    });
  }
}
