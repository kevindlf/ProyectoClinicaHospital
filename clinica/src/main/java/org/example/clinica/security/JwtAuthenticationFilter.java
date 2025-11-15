package org.example.clinica.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.clinica.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que se ejecuta en cada petición para validar el token JWT.
 * Si el token es válido, autentica al usuario dentro del contexto de Spring Security.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Obtiene el header Authorization
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Si no viene un Bearer token, sigue la petición sin validar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extrae el token después de "Bearer "
        jwt = authHeader.substring(7);

        // Obtiene el email del token
        userEmail = jwtService.extractUsername(jwt);

        // Si hay email y todavía no hay un usuario autenticado
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Carga el usuario desde la base de datos
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Verifica si el token coincide con el usuario
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Crea la autenticación con sus permisos
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Adjunta detalles de la solicitud
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Registra al usuario como autenticado
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continúa con el resto de filtros
        filterChain.doFilter(request, response);
    }
}
