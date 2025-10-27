package org.example.clinica.model.postgres;

// Roles fijos para el sistema, basados en tu lógica de permisos.
public enum Role {
    ADMIN,          // Superusuario: Gestión total del sistema y usuarios.
    MEDICO,         // Crear, Modificar, Eliminar y Consultar pacientes y formularios.
    ENFERMERO,      // Solo Consultar (GET) pacientes.
    TECNICO        // Solo Consultar su propio perfil.
}
