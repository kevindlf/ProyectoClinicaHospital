package org.example.clinica.service;

import lombok.RequiredArgsConstructor; // 1. Añade @RequiredArgsConstructor (de Lombok)
import org.example.clinica.model.postgres.Usuario;
import org.example.clinica.repository.postgres.UsuarioRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder; // 2. Importa PasswordEncoder
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // 1. Lombok generará el constructor con las dependencias 'final'
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // 3. Inyecta PasswordEncoder
    private final JavaMailSender mailSender; // Para envío de emails

    // Ya no necesitamos el constructor manual gracias a @RequiredArgsConstructor
    // public UsuarioService(UsuarioRepository usuarioRepository) {
    //     this.usuarioRepository = usuarioRepository;
    // }

    // --- Lógica de negocio existente ---

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario guardar(Usuario usuario) {
        // --- INICIO MODIFICACIÓN ---
        // 4. Encripta la contraseña ANTES de guardar
        // Asegúrate de que la contraseña no sea nula antes de intentar encriptarla
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            // Decide qué hacer si la contraseña está vacía. Lanzar excepción,
            // asignar una por defecto (no recomendado), etc.
            // Por ahora, lanzaremos una excepción si es un usuario nuevo sin contraseña.
            if (usuario.getIdUsuario() == null) { // Solo si es un usuario nuevo (ID es null)
                throw new IllegalArgumentException("La contraseña no puede estar vacía para un nuevo usuario.");
            }
            // Si es una actualización y no se proporciona contraseña, podrías optar por no cambiarla.
            // En este caso simple, si llega vacía en una actualización, podríamos lanzar error o ignorar.
            // Por seguridad, es mejor lanzar error o requerir la contraseña siempre.
            // Si decides mantener la contraseña anterior en una actualización sin nueva password:
            // Usuario existente = usuarioRepository.findById(usuario.getIdUsuario()).orElse(null);
            // if (existente != null) usuario.setPassword(existente.getPassword());
            // else throw new RuntimeException("Usuario no encontrado para actualizar sin contraseña");

            // Por simplicidad ahora, lanzamos error si llega vacía/nula.
            throw new IllegalArgumentException("La contraseña no puede estar vacía o nula.");
        }

        // 6. Enviar email de bienvenida al usuario
        enviarEmailBienvenidaUsuario(usuario);

        // 5. Guarda el usuario con la contraseña ya encriptada
        return usuarioRepository.save(usuario);
        // --- FIN MODIFICACIÓN ---
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    public Usuario cambiarPassword(Long id, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        return usuarioRepository.save(usuario);
    }

    // --- Método requerido por UserDetailsService ---

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));
    }

    /**
     * Envía un email de bienvenida al usuario con sus credenciales de acceso.
     * @param usuario El usuario al que se enviará el email
     */
    private void enviarEmailBienvenidaUsuario(Usuario usuario) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(usuario.getEmail());
            helper.setSubject("Bienvenido a la Clínica Nefrológica Integral");
            helper.setText("Hola " + usuario.getNombre() + ",\n\n" +
                          "Somos de la Clínica Nefrológica Integral y le damos la bienvenida a nuestro sistema.\n\n" +
                          "Sus datos para acceder a nuestra página web son:\n\n" +
                          "Email: " + usuario.getEmail() + "\n\n" +
                          "Por favor, no divulgue estos datos personales. Son exclusivamente para su uso profesional.\n\n" +
                          "Para acceder al sistema:\n" +
                          "1. Visite: http://localhost:4200\n" +
                          "2. Inicie sesión con su email y la contraseña que le proporcionará el administrador\n\n" +
                          "Si tiene alguna duda, no dude en contactarnos.\n\n" +
                          "Atentamente,\nClínica Nefrológica Integral");

            mailSender.send(message);

            System.out.println("=== EMAIL DE BIENVENIDA ENVIADO ===");
            System.out.println("Usuario: " + usuario.getNombre() + " (" + usuario.getEmail() + ")");
            System.out.println("Rol: " + usuario.getRol());
            System.out.println("Estado: Email enviado exitosamente");
            System.out.println("===================================");

        } catch (Exception e) {
            System.err.println("Error al enviar email de bienvenida a usuario " + usuario.getEmail() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
