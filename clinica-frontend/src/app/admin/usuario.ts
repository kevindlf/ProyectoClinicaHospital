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

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  fechaCreacion?: string;
  activo?: boolean;
}


/**
 * Servicio para gestionar operaciones CRUD de usuarios.
 * Proporciona métodos para crear, leer, actualizar y eliminar usuarios,
 * así como interfaces para definir la estructura de datos de usuarios,
 * incluyendo roles (ADMIN, MEDICO, ENFERMERO, TECNICO).
 * Maneja autenticación y autorización para operaciones administrativas.
 */
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

  // Listar todos los usuarios
  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Actualizar usuario
  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  // Eliminar usuario
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Cambiar contraseña
  cambiarPassword(id: number, nuevaPassword: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}/password`, nuevaPassword);
  }

  // Aquí podrías añadir otros métodos (listarUsuarios, buscarPorEmail, etc.) si los necesitas

}
