package org.example.clinica.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.clinica.model.postgres.Role;

/**
 * Data Transfer Object (DTO) para manejar las peticiones de Login y Registro.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    // Usados en Login y Register
    private String email;
    private String password;

    // Usados solo en Register
    private String nombre;
    private String apellido;
    private Role rol;
}
