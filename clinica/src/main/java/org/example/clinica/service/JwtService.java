package org.example.clinica.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Servicio encargado de generar, leer y validar tokens JWT.
 * Usa la clave secreta definida en application.properties y maneja expiración y claims extras.
 */
@Service
public class JwtService {

    // Clave secreta para firmar el token (Base64)
    @Value("${jwt.secret}")
    private String secretKey;

    // Tiempo de expiración del token en milisegundos
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Extrae el email (subject) almacenado en el token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrae un claim específico usando una función.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Genera un JWT simple solo con username, roles y expiración.
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Genera un JWT completo agregando claims adicionales (roles, nombre, apellido).
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {

        // Obtiene roles del usuario para enviarlos como parte del token
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // Inserta roles en el cuerpo del JWT
        extraClaims.put("roles", roles);

        // Si el usuario es de tipo Usuario, agrega también nombre completo
        if (userDetails instanceof org.example.clinica.model.postgres.Usuario) {
            org.example.clinica.model.postgres.Usuario usuario =
                    (org.example.clinica.model.postgres.Usuario) userDetails;
            extraClaims.put("name", usuario.getNombre() + " " + usuario.getApellido());
        }

        // Construcción del JWT
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())     // Email del usuario
                .setIssuedAt(new Date(System.currentTimeMillis())) // Fecha de creación
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // Expiración
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Firma
                .compact();
    }

    /**
     * Valida si el token es correcto y pertenece al usuario indicado.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Verifica si el token ya expiró.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Obtiene la fecha de expiración del token.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrae todos los claims del token usando la clave de firma.
     */
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Convierte la clave secreta Base64 a una clave HMAC válida.
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
