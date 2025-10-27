// src/app/auth/auth.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs'; // Quitamos 'map' que ya no se usa aquí
import { jwtDecode } from 'jwt-decode'; // <<< 1. Importa jwtDecode

// INTERFAZ PARA LA RESPUESTA JSON (si decides cambiar el backend en el futuro)
// interface AuthResponse {
//   token: string;
// }

// Interfaz para el payload decodificado del JWT
// ¡¡¡IMPORTANTE!!! Ajusta los nombres de los campos ('roles', 'sub', etc.)
// para que coincidan EXACTAMENTE con los claims que tu backend
// (JwtService.java) está poniendo en el token.
interface DecodedToken {
  sub: string;      // Subject (usualmente el email)
  roles?: string[]; // Si envías roles como array (ej: ["ROLE_ADMIN"])
  // O si envías un solo rol como string:
  // role?: string;
  iat?: number;     // Issued At timestamp
  exp?: number;     // Expiration timestamp
  // Agrega aquí cualquier otro claim que envíes (ej: nombre, idUsuario)
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private tokenKey = 'authToken';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Mantenemos la versión que espera TEXTO PLANO (el token directo)
  login(credentials: { email: string, password: string }): Observable<string> { // Devuelve Observable<string>
    const loginUrl = `${this.apiUrl}/login`;
    return this.http.post( // No necesita <Tipo> si responseType es 'text'
      loginUrl,
      credentials,
      { responseType: 'text' } // Espera texto plano
    ).pipe(
      tap((token: string) => { // El resultado es directamente el token (string)
        console.log('Token recibido del backend:', token);
        // Validamos un poco más el token antes de guardarlo
        if (token && typeof token === 'string' && token.includes('.')) { // Un JWT válido tiene al menos dos puntos
          this.guardarToken(token);
        } else {
          console.error('La respuesta recibida no parece ser un token JWT válido:', token);
          // Considera lanzar un error aquí o manejarlo de otra forma
        }
      })
      // Ya no necesitamos el map si el componente espera el string directamente
    );
  }


  guardarToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
      console.log('Token guardado en localStorage');
    } else {
      console.log('Intento de guardar token fuera del navegador (SSR)');
    }
  }

  obtenerToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // --- NUEVO MÉTODO para obtener rol ---
  obtenerRolUsuario(): string | null {
    const token = this.obtenerToken();
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        console.log("Token decodificado:", decodedToken); // Log para depuración

        // --- LÓGICA PARA EXTRAER EL ROL ---
        // AJUSTA ESTA PARTE SEGÚN CÓMO ENVÍES EL ROL EN EL TOKEN DESDE JAVA

        // Opción A: Si envías el rol como un string en el claim 'role'
        // if (decodedToken.role) {
        //   return decodedToken.role.replace('ROLE_', ''); // Quita prefijo ROLE_ si existe
        // }

        // Opción B: Si envías roles/authorities como un array en el claim 'roles' (o 'authorities')
        // *** ESTA ES LA FORMA MÁS COMÚN CON SPRING SECURITY ***
        if (decodedToken.roles && decodedToken.roles.length > 0) {
           // Devuelve el primer rol encontrado, quitando el prefijo ROLE_
           return decodedToken.roles[0].replace('ROLE_', '');
        }

        // Si ninguna de las opciones anteriores funcionó:
        console.warn("Claim 'role' o 'roles' no encontrado en el token JWT. Asegúrate de añadirlo en JwtService.java");
        return null;

      } catch (error) {
        console.error('Error al decodificar el token JWT:', error);
        // Si el token no se puede decodificar, es inválido. Cerramos sesión.
        this.logout();
        return null;
      }
    }
    return null; // No hay token
  }
  // --- FIN NUEVO MÉTODO ---

  estaLogueado(): boolean {
     const token = this.obtenerToken();
     if (!token) return false;
     try {
       const decoded: DecodedToken = jwtDecode(token);
       // Asegurarse que 'exp' exista antes de multiplicar
       const expira = (decoded.exp ? decoded.exp * 1000 : 0);
       // Comprueba si el token ha expirado
       const expirado = Date.now() >= expira;
       if (expirado && expira !== 0) { // Si expiró y tenía fecha de expiración
           console.log("Token expirado.");
           this.logout(); // Cierra sesión si el token expiró
           return false;
       }
       // Si no ha expirado o no tiene fecha de expiración (no ideal, pero lo permitimos)
       return true;
     } catch (e) {
       console.error("Error al verificar expiración del token (token inválido):", e);
       this.logout(); // Cierra sesión si el token es inválido
       return false;
     }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      console.log('Token eliminado de localStorage');
    } else {
      console.log('Intento de logout fuera del navegador (SSR)');
    }
    // Podrías añadir aquí: this.router.navigate(['/auth/login']); si quieres forzar la redirección siempre
  }
}