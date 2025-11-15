package org.example.clinica.config;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.postgres.Role;
import org.example.clinica.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.Arrays;

/**
 * Configuración principal de seguridad.
 *
 * Define:
 * - Filtrado JWT.
 * - Reglas de autorización por endpoint.
 * - Configuración CORS.
 * - Política de sesiones stateless.
 *
 * Esta clase controla qué rutas requieren autenticación y qué roles tienen
 * permiso para acceder a cada recurso del backend.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    // Filtro que intercepta cada request y valida el token JWT.
    private final JwtAuthenticationFilter jwtAuthFilter;

    // Proveedor de autenticación configurado en ApplicationConfig.
    private final AuthenticationProvider authenticationProvider;

    /**
     * Configura la cadena principal de filtros de seguridad.
     *
     * @param http configuración del framework de seguridad.
     * @return configuración final del SecurityFilterChain.
     * @throws Exception en caso de error interno de configuración.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Habilita CORS con la configuración personalizada
                .cors(withDefaults())
                // Desactiva CSRF ya que trabajamos con JWT (stateless)
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        /**
                         * --- MANEJO DE AUTENTICACIÓN Y LOGIN ---
                         * Permitir OPTIONS para preflight CORS (Angular → Backend)
                         */
                        .requestMatchers(HttpMethod.OPTIONS, "/api/auth/**").permitAll()

                        // Permite login, register y refresh sin autenticación previa
                        .requestMatchers("/api/auth/**").permitAll()

                        /**
                         * --- PERMISOS DEL MÓDULO PACIENTES ---
                         * Creación, modificación y eliminación: ADMIN y MÉDICO
                         * Lectura: todos los roles asistenciales.
                         */
                        .requestMatchers(HttpMethod.POST, "/api/pacientes")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.PUT, "/api/pacientes/**")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/pacientes/**")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.GET, "/api/pacientes/**")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())
                        .requestMatchers(HttpMethod.GET, "/api/pacientes")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())

                        /**
                         * --- QR ---
                         * Solo lectura de los datos asociados a códigos QR.
                         */
                        .requestMatchers(HttpMethod.GET, "/api/qr/**")
                        .hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())

                        /**
                         * --- USUARIOS ---
                         * Solo un ADMIN puede acceder al módulo usuarios.
                         */
                        .requestMatchers("/api/usuarios/**")
                        .hasRole(Role.ADMIN.name())

                        /**
                         * Cualquier otra petición necesita estar autenticada.
                         */
                        .anyRequest().authenticated()
                )
                // JWT → sin sesiones en servidor
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // Registrar quién autentica
                .authenticationProvider(authenticationProvider)
                // Filtro JWT que intercepta cada request
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración de CORS para permitir que el frontend Angular (localhost:4200)
     * pueda comunicarse correctamente con el backend.
     *
     * Incluye:
     * - Métodos permitidos
     * - Headers permitidos
     * - Habilitación de credenciales
     *
     * @return configuración de CORS aplicada a /api/**
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend permitido (Angular local)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));

        // Métodos habilitados
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

        // Permitir envío de credenciales (token, cookies si hubiera)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Aplicar configuración a todas las rutas /api/**
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}
