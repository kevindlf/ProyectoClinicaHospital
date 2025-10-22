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
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Deshabilita CSRF porque JWT lo hace innecesario y se usa REST
                .csrf(AbstractHttpConfigurer::disable)

                // Definición de las reglas de autorización por URL y Rol
                .authorizeHttpRequests(auth -> auth
                        // 1. Rutas de Autenticación (Permitidas para TODOS)
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. Permisos de Pacientes
                        // Médicos y Admins pueden crear (POST)
                        .requestMatchers(HttpMethod.POST, "/api/pacientes").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        // Médicos y Admins pueden actualizar/eliminar (PUT/DELETE)
                        .requestMatchers(HttpMethod.PUT, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())

                        // Enfermeros, Médicos y Admins pueden consultar (GET)
                        .requestMatchers(HttpMethod.GET, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name())
                        .requestMatchers(HttpMethod.GET, "/api/pacientes").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name())

                        // 3. Permisos de Usuarios (Solo Admins)
                        .requestMatchers("/api/usuarios/**").hasRole(Role.ADMIN.name())

                        // Cualquier otra petición requiere autenticación
                        .anyRequest().authenticated()
                )

                // Configuración de la sesión para ser SIN ESTADO (Stateless)
                // Esencial para JWT, ya que no se almacena estado de sesión en el servidor
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Establece el proveedor de autenticación
                .authenticationProvider(authenticationProvider)

                // Agrega el filtro JWT antes del filtro de usuario/contraseña de Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
