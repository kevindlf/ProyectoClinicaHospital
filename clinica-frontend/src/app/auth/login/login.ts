// src/app/auth/login/login.ts

import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private zone: NgZone
  ) { }

  ngOnInit(): void {

    // El formulario se sigue creando normalmente
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    // ... (el resto de la función onLogin se mantiene igual) ...
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = null;
    const credentials = this.loginForm.value;
    console.log('Intentando login con:', credentials.email);

    this.authService.login(credentials).subscribe({
      next: (token) => {
        console.log('Login exitoso, token guardado:', token);
        const rol = this.authService.obtenerRolUsuario();
        console.log(`Usuario logueado con rol: ${rol}`);

        // Verificar si venimos de un acceso directo (QR u otro) para redirigir a la URL guardada
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl && returnUrl.startsWith('/pacientes/')) {
          localStorage.removeItem('returnUrl'); // Limpiar la URL de retorno
          console.log('Redirigiendo a URL de retorno:', returnUrl);
          this.zone.run(() => {
            this.router.navigateByUrl(returnUrl);
          });
        } else {
          this.redirigirSegunRol(rol); // Redirección normal según rol
        }
      },
      error: (error) => {
        console.error('Error DETALLADO en login:', error);
        if (error.status === 401 || error.status === 403) {
           this.loginError = 'Credenciales incorrectas.';
        } else {
           this.loginError = error?.error?.message || error?.message || 'Error inesperado. Inténtalo más tarde.';
        }
      }
    });
  }

  // El método redirigirSegunRol se mantiene igual
  private redirigirSegunRol(rol: string | null): void {
     this.zone.run(() => {
        console.log(`>>> Redirigiendo según rol: ${rol}`);
        switch (rol) {
          case 'ADMIN':
            this.router.navigate(['/dashboard']);
            break;
          case 'MEDICO':
            this.router.navigate(['/dashboard']);
            break;
          case 'ENFERMERO':
          case 'TECNICO':
             console.warn(`Redirección para ${rol} aún no definida, yendo a dashboard por defecto.`);
             this.router.navigate(['/dashboard']);
             break;
          default:
            console.error(`Rol no reconocido o inválido: "${rol}". No se puede redirigir.`);
            this.loginError = 'No se pudo determinar el rol del usuario. Contacte al administrador.';
            break;
        }
     });
  }
}