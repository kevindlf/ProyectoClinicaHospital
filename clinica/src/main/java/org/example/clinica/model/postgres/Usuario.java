package org.example.clinica.model.postgres;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Entidad que representa a un usuario dentro del sistema.
 *
 * Se almacena en PostgreSQL en la tabla "usuarios".
 * Además implementa la interfaz UserDetails, lo que permite que Spring Security
 * la utilice directamente para autenticación y autorización.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "usuarios")
public class Usuario implements UserDetails {

    // ============================================================
    // 🟦 CAMPOS PRINCIPALES
    // ============================================================

    /**
     * Identificador único del usuario. Autogenerado por PostgreSQL.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    /**
     * Nombre del usuario.
     */
    @Column
    private String nombre;

    /**
     * Apellido del usuario.
     */
    @Column
    private String apellido;

    /**
     * Email del usuario.
     * Se usa como nombre de usuario para el login.
     * Debe ser único y no puede ser nulo.
     */
    @Column(unique = true, nullable = false)
    private String email;

    /**
     * Contraseña encriptada con BCrypt.
     */
    @Column(nullable = false)
    private String password;

    /**
     * Rol del usuario dentro del sistema.
     * Se almacena como texto (STRING) para mayor claridad.
     * Ejemplos: ADMIN, MEDICO, ENFERMERO.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role rol;

    // ============================================================
    // 🟦 MÉTODOS DE SPRING SECURITY (UserDetails)
    // ============================================================

    /**
     * Devuelve la lista de permisos/roles del usuario.
     * Spring Security requiere que los roles tengan el prefijo "ROLE_".
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    /**
     * Retorna el nombre de usuario utilizado para el login.
     * En este caso utilizamos el email.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Indica si la cuenta está expirada.
     * true = siempre válida en este sistema.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indica si el usuario está bloqueado.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indica si las credenciales están vencidas.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indica si el usuario está habilitado.
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
