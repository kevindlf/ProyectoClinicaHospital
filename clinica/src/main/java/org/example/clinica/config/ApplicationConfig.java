package org.example.clinica.config;

import lombok.RequiredArgsConstructor;
import org.example.clinica.repository.postgres.UsuarioRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configuración principal de seguridad de la aplicación.
 * Define los beans necesarios para la autenticación:
 * - UserDetailsService: cómo buscar usuarios en la BD.
 * - AuthenticationProvider: cómo validar credenciales.
 * - AuthenticationManager: coordinador del proceso de autenticación.
 * - PasswordEncoder: algoritmo para encriptar contraseñas.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    // Repositorio para consultar usuarios en la base de datos.
    private final UsuarioRepository usuarioRepository;

    /**
     * Servicio que carga los detalles de un usuario por su email.
     * Se usa durante la autenticación para obtener roles, contraseña, etc.
     *
     * @return implementación de UserDetailsService basada en nuestro repositorio.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado con email: " + username));
    }

    /**
     * Proveedor de autenticación que utiliza:
     * - UserDetailsService para buscar usuarios.
     * - PasswordEncoder para validar contraseñas encriptadas.
     *
     * DaoAuthenticationProvider es la implementación estándar de Spring.
     *
     * @return AuthenticationProvider configurado
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService()); // Define cómo cargar el usuario
        authProvider.setPasswordEncoder(passwordEncoder());       // Define cómo validar la contraseña
        return authProvider;
    }

    /**
     * AuthenticationManager: objeto central que coordina el proceso de autenticación.
     * Spring lo construye automáticamente usando el provider configurado.
     *
     * @param config configuración automática de Spring Security
     * @return AuthenticationManager disponible para el sistema
     * @throws Exception si sucede algún error interno
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * PasswordEncoder: encargado de encriptar y validar contraseñas.
     * BCrypt es un estándar seguro y recomendado en aplicaciones reales.
     *
     * @return encriptador BCryptPasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
