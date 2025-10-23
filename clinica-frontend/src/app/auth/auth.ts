// src/app/auth/auth.service.ts

// 1. Importa lo necesario
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'authToken';
  private isBrowser: boolean; // Variable para saber si estamos en el navegador

  // 2. Inyecta PLATFORM_ID
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object // Identificador de plataforma
  ) {
    // 3. Determina si estamos en el navegador al crear el servicio
    this.isBrowser = isPlatformBrowser(platformId);
  }

 login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    const loginUrl = `${this.apiUrl}/login`;
    return this.http.post(loginUrl, credentials, { responseType: 'text' }).pipe(
      tap((token: string) => {
        console.log('Token recibido del backend:', token);
        if (token && typeof token === 'string' && token.startsWith('ey')) {
          this.guardarToken(token);
        } else {
          console.error('La respuesta no es un token JWT válido:', token);
        }
      }),
      // Convertir el string a AuthResponse para mantener compatibilidad
      map((token: string) => ({ token }))
    );
  }
  guardarToken(token: string): void {
    // 4. Verifica si es navegador antes de usar localStorage
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      console.log('Token guardado en localStorage');
    } else {
      console.log('Intento de guardar token fuera del navegador (SSR)');
    }
  }

  obtenerToken(): string | null {
    // 5. Verifica si es navegador
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null; // Devuelve null si no estamos en el navegador
  }

  estaLogueado(): boolean {
    // Ya usa obtenerToken, que ahora es seguro para SSR
    return !!this.obtenerToken();
  }

  logout(): void {
    // 6. Verifica si es navegador
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      console.log('Token eliminado de localStorage');
    } else {
      console.log('Intento de logout fuera del navegador (SSR)');
    }
  }
}