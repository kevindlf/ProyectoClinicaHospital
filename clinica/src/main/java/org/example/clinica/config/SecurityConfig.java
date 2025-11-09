package org.example.clinica.config;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.postgres.Role;
import org.example.clinica.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Asegúrate que HttpMethod está importado
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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // --- CAMBIO IMPORTANTE AQUÍ ---
                        // 1. Permite peticiones OPTIONS a /api/auth/** (para preflight de CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/api/auth/**").permitAll()
                        // 2. Luego, permite el resto de peticiones a /api/auth/**
                        .requestMatchers("/api/auth/**").permitAll()
                        // --- FIN DEL CAMBIO ---

                        // Permisos de Pacientes (sin cambios)
                        .requestMatchers(HttpMethod.POST, "/api/pacientes").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.PUT, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name())
                        .requestMatchers(HttpMethod.GET, "/api/pacientes/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())
                        .requestMatchers(HttpMethod.GET, "/api/pacientes").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())

                        // Permisos de QR (solo lectura para roles autorizados)
                        .requestMatchers(HttpMethod.GET, "/api/qr/**").hasAnyRole(Role.ADMIN.name(), Role.MEDICO.name(), Role.ENFERMERO.name(), Role.TECNICO.name())

                        // Permisos de Usuarios (sin cambios)
                        .requestMatchers("/api/usuarios/**").hasRole(Role.ADMIN.name())

                        // Cualquier otra petición requiere autenticación (sin cambios)
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")); // OPTIONS debe estar aquí
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
