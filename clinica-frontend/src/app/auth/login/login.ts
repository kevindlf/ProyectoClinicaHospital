// src/app/auth/login/login.ts

import { Component, NgZone, OnInit } from '@angular/core'; // 1. Importa NgZone
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common'; // Importa CommonModule para @if

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
    private zone: NgZone // 2. Inyecta NgZone
  ) { }

  ngOnInit(): void {
    if (this.authService.estaLogueado()) {
        this.zone.run(() => {
             this.router.navigate(['/dashboard']);
             console.log('Usuario ya logueado, redirigiendo desde ngOnInit...');
        });
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginError = null;
    const credentials = this.loginForm.value;
    console.log('Intentando login con:', credentials.email); // Log para debug

    this.authService.login(credentials).subscribe({
      next: (response: any) => { // Cambia a any para debug
        console.log('Login exitoso, respuesta completa:', response);
        console.log('Token recibido:', response.token);

        // Verifica que el token se guardó
        const savedToken = this.authService.obtenerToken();
        console.log('Token guardado en localStorage:', savedToken);

        console.log('>>> Intentando navegar a /dashboard...');

        this.zone.run(() => {
          this.router.navigate(['/dashboard'])
            .then(navigated => {
              if (navigated) {
                console.log('>>> Navegación a /dashboard exitosa.');
              } else {
                console.error('>>> Navegación a /dashboard rechazada.');
              }
            })
            .catch(err => {
              console.error('>>> ERROR en navegación:', err);
            });
        });
      },
      error: (error) => {
        console.error('Error completo en login:', error);
        console.error('Status:', error.status);
        console.error('StatusText:', error.statusText);
        console.error('Error body:', error.error);

        if (error.status === 401 || error.status === 403) {
           this.loginError = 'Credenciales incorrectas o usuario no autorizado.';
        } else if (error.status === 0) {
           this.loginError = 'No se puede conectar al servidor. Verifica que esté corriendo.';
        } else {
           this.loginError = `Error del servidor (${error.status}): ${error.statusText}`;
        }
      }
    });
  }
}