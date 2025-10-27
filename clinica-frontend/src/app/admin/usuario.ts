// src/app/admin/usuario.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // 1. Importa HttpClient
import { Observable } from 'rxjs'; // 2. Importa Observable

// Interfaz para definir la estructura de datos del usuario (basado en tu backend)
// Asegúrate que coincida con lo que espera tu @RequestBody en UsuarioController
export interface NuevoUsuario {
  nombre: string;
  apellido: string;
  email: string;
  password?: string; // Hacemos password opcional aquí si no lo devuelves
  rol: string; // O un tipo Enum si lo defines en el frontend también
  // Añade idUsuario si el backend lo devuelve en la respuesta
  idUsuario?: number;
}


@Injectable({
  providedIn: 'root'
})
// 3. Cambia el nombre de la clase a UsuarioService
export class UsuarioService {

  // 4. Define la URL base para la API de usuarios
  private apiUrl = 'http://localhost:8080/api/usuarios';

  // 5. Inyecta HttpClient
  constructor(private http: HttpClient) { }

  /**
   * Envía los datos del nuevo usuario al backend.
   * @param usuarioData Los datos del formulario (nombre, apellido, email, password, rol).
   * @returns Un Observable con la respuesta del backend (el usuario creado).
   */
  crearUsuario(usuarioData: NuevoUsuario): Observable<NuevoUsuario> {
    // 6. Realiza la petición POST
    // El AuthInterceptor añadirá el token JWT automáticamente
    return this.http.post<NuevoUsuario>(this.apiUrl, usuarioData);
  }

  // Aquí podrías añadir otros métodos (listarUsuarios, buscarPorEmail, etc.) si los necesitas

}