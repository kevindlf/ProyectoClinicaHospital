package org.example.clinica.service;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.postgres.Usuario;
import org.example.clinica.repository.postgres.UsuarioRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Optional;

/**
 * Servicio encargado de gestionar los usuarios del sistema clínico.
 *
 * Funcionalidades principales:
 * - Registro, edición y eliminación de usuarios.
 * - Encriptación de contraseñas antes de ser almacenadas.
 * - Envío automático de email de bienvenida con instrucciones de acceso.
 * - Integración con Spring Security mediante UserDetailsService.
 *
 * Esta capa de servicio abstrae toda la lógica vinculada a usuarios,
 * permitiendo un tratamiento seguro y ordenado de credenciales y datos sensibles.
 */
@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    // -----------------------------------------------------
    //                 MÉTODOS DE NEGOCIO
    // -----------------------------------------------------

    /**
     * Obtiene la lista completa de usuarios registrados.
     *
     * @return Lista de usuarios.
     */
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    /**
     * Busca un usuario a partir de su email.
     *
     * @param email Email a buscar.
     * @return Optional con el usuario encontrado (si existe).
     */
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    /**
     * Guarda un usuario en la base de datos.
     *
     * Proceso:
     * 1. Valida que la contraseña no esté vacía.
     * 2. Encripta la contraseña usando PasswordEncoder.
     * 3. Envía un email de bienvenida al correo del usuario.
     * 4. Guarda el usuario con su contraseña ya encriptada.
     *
     * @param usuario Usuario a persistir.
     * @return Usuario guardado.
     */
    public Usuario guardar(Usuario usuario) {

        // Validación y encriptado de contraseña
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            // Si el usuario es nuevo, una contraseña es obligatoria
            if (usuario.getIdUsuario() == null) {
                throw new IllegalArgumentException("La contraseña no puede estar vacía para un nuevo usuario.");
            }
            // Si es actualización y no se envía password, se fuerza error para evitar inconsistencias.
            throw new IllegalArgumentException("La contraseña no puede estar vacía o nula.");
        }

        // Envío de email antes de guardar (para incluir sus datos)
        enviarEmailBienvenidaUsuario(usuario);

        // Guarda el usuario en la BD
        return usuarioRepository.save(usuario);
    }

    /**
     * Elimina un usuario por su ID.
     *
     * @param id ID del usuario.
     */
    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    /**
     * Cambia la contraseña de un usuario.
     *
     * @param id ID del usuario.
     * @param nuevaPassword Contraseña nueva sin encriptar.
     * @return Usuario actualizado.
     */
    public Usuario cambiarPassword(Long id, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));

        return usuarioRepository.save(usuario);
    }

    // -----------------------------------------------------
    //      SPRING SECURITY – AUTENTICACIÓN DE USUARIO
    // -----------------------------------------------------

    /**
     * Método requerido por Spring Security para la carga de usuarios.
     *
     * Busca al usuario por correo electrónico. Este método permite que
     * la autenticación se realice directamente con el email.
     *
     * @param email Email del usuario.
     * @return UserDetails del usuario.
     * @throws UsernameNotFoundException Si el usuario no existe.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));
    }

    // -----------------------------------------------------
    //         ENVÍO DE EMAIL AUTOMÁTICO AL REGISTRAR
    // -----------------------------------------------------

    /**
     * Envía un email de bienvenida al nuevo usuario.
     *
     * Contenido:
     * - Datos de acceso (solo email; la contraseña la entregará el administrador).
     * - Instrucciones para iniciar sesión en la aplicación web.
     *
     * Este método se ejecuta automáticamente en guardar().
     *
     * @param usuario Usuario destinatario.
     */
    private void enviarEmailBienvenidaUsuario(Usuario usuario) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(usuario.getEmail());
            helper.setSubject("Bienvenido a la Clínica Nefrológica Integral");
            helper.setText(
                    "Hola " + usuario.getNombre() + ",\n\n" +
                            "Somos de la Clínica Nefrológica Integral y le damos la bienvenida a nuestro sistema.\n\n" +
                            "Sus datos para acceder a nuestra página web son:\n\n" +
                            "Email: " + usuario.getEmail() + "\n\n" +
                            "Por favor, no divulgue estos datos personales. Son exclusivamente para su uso profesional.\n\n" +
                            "Para acceder al sistema:\n" +
                            "1. Visite: http://localhost:4200\n" +
                            "2. Inicie sesión con su email y la contraseña que le proporcionará el administrador\n\n" +
                            "Si tiene alguna duda, no dude en contactarnos.\n\n" +
                            "Atentamente,\nClínica Nefrológica Integral"
            );

            mailSender.send(message);

            System.out.println("=== EMAIL DE BIENVENIDA ENVIADO ===");
            System.out.println("Usuario: " + usuario.getNombre() + " (" + usuario.getEmail() + ")");
            System.out.println("Rol: " + usuario.getRol());
            System.out.println("Estado: Email enviado exitosamente");
            System.out.println("===================================");

        } catch (Exception e) {
            System.err.println(
                    "Error al enviar email de bienvenida a usuario "
                            + usuario.getEmail() + ": " + e.getMessage()
            );
            e.printStackTrace();
        }
    }
}
