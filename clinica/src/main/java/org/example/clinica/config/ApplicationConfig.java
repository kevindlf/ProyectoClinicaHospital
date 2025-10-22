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

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UsuarioRepository usuarioRepository;

    // Ya implementado en UsuarioService, pero lo referenciamos aquí para claridad.
    // Aunque Spring lo detecta, es útil para el AuthenticationProvider.
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + username));
    }

    /**
     * Proveedor de Autenticación: Busca el usuario y verifica la contraseña.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // Le dice dónde buscar los detalles del usuario
        authProvider.setUserDetailsService(userDetailsService());
        // Le dice cómo debe codificar/descodificar las contraseñas
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Administrador de Autenticación: Maneja el proceso de autenticación.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Codificador de Contraseñas: Usamos BCrypt (estándar de la industria).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
