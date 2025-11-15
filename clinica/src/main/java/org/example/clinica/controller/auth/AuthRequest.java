package org.example.clinica.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.clinica.model.postgres.Role;

/**
 * Data Transfer Object (DTO) utilizado para recibir y transportar
 * los datos enviados en las peticiones de autenticación.
 *
 * Esta clase se utiliza tanto en las operaciones de **Login** como en **Registro**,
 * permitiendo unificar la estructura de los datos requeridos.
 *
 * Campos utilizados:
 * - email y password → requeridos para Login y Registro.
 * - nombre, apellido y rol → utilizados únicamente durante el Registro.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {

    /**
     * Email del usuario. Utilizado para iniciar sesión y para crear un nuevo usuario.
     */
    private String email;

    /**
     * Contraseña del usuario. Se envía tanto en Login como en Registro.
     */
    private String password;

    /**
     * Nombre del usuario. Campo requerido únicamente al registrarse.
     */
    private String nombre;

    /**
     * Apellido del usuario. Campo requerido únicamente al registrarse.
     */
    private String apellido;

    /**
     * Rol asignado al usuario durante el Registro.
     * Define los permisos dentro del sistema.
     */
    private Role rol;
}
