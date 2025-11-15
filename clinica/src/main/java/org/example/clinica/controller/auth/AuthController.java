package org.example.clinica.controller.auth;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.postgres.Usuario;
import org.example.clinica.service.JwtService;
import org.example.clinica.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador encargado de gestionar el proceso de autenticación
 * y registro de usuarios del sistema.
 *
 * Expone los endpoints públicos:
 * - /register → crear un nuevo usuario
 * - /login → iniciar sesión y obtener un JWT
 *
 * Estos endpoints son accesibles sin autenticación (permitAll en SecurityConfig).
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    // Servicios utilizados por el controlador
    private final UsuarioService usuarioService;             // Manejo de usuarios en PostgreSQL
    private final JwtService jwtService;                     // Generación de tokens JWT
    private final PasswordEncoder passwordEncoder;           // Encriptación de contraseñas
    private final AuthenticationManager authenticationManager; // Para validar credenciales

    /**
     * Registrar un nuevo usuario en el sistema.
     *
     * Flujo:
     * 1. Validar que los datos esenciales estén presentes.
     * 2. Encriptar la contraseña (requisito para Spring Security).
     * 3. Guardar el usuario en PostgreSQL.
     * 4. Generar y retornar un JWT para usar inmediatamente.
     *
     * Ruta: POST /api/auth/register
     *
     * @param request objeto con nombre, apellido, email, contraseña y rol.
     * @return token JWT listo para usarse.
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {

        // Validación mínima de campos obligatorios
        if (request.getEmail() == null || request.getPassword() == null || request.getRol() == null) {
            return ResponseEntity.badRequest()
                    .body("Faltan datos obligatorios para el registro (email, password, rol).");
        }

        // Encriptación de contraseña antes de persistirla (muy importante)
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Creación del usuario (el ID será generado por PostgreSQL)
        Usuario nuevoUsuario = new Usuario(
                null,
                request.getNombre(),
                request.getApellido(),
                request.getEmail(),
                encodedPassword,
                request.getRol()
        );

        // Guardado en BD
        usuarioService.guardar(nuevoUsuario);

        // Generación del token
        String token = jwtService.generateToken(nuevoUsuario);

        return ResponseEntity.ok(token);
    }

    /**
     * Iniciar sesión en el sistema.
     *
     * Flujo:
     * 1. Spring Security intenta autenticar las credenciales (email + contraseña).
     *    - Si falla: lanza excepción automáticamente.
     * 2. Si la autenticación es correcta, se busca el usuario en la BD.
     * 3. Se genera un JWT asociado al usuario autenticado.
     *
     * Ruta: POST /api/auth/login
     *
     * @param request email y password enviados por el cliente.
     * @return token JWT válido.
     */
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {

        // Validación automática por Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Búsqueda del usuario (debe existir si autenticación fue exitosa)
        Usuario usuario = usuarioService.buscarPorEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado después de autenticación exitosa.")
                );

        // Generación del token correspondiente a este usuario
        String token = jwtService.generateToken(usuario);

        return ResponseEntity.ok(token);
    }
}
