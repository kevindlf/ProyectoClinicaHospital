package org.example.clinica.controller;

import org.example.clinica.model.postgres.Usuario;
import org.example.clinica.service.UsuarioService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador para administrar usuarios del sistema.
 * Expone endpoints CRUD y operaciones específicas como el cambio de contraseña.
 *
 * Ruta base: /api/usuarios
 */
@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /**
     * Obtener todos los usuarios registrados.
     *
     * GET /api/usuarios
     *
     * @return Lista de usuarios en la base de datos.
     */
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarTodos();
    }

    /**
     * Buscar un usuario por email.
     *
     * GET /api/usuarios/{email}
     *
     * @param email Email del usuario a buscar.
     * @return Optional<Usuario> con el usuario encontrado o vacío si no existe.
     */
    @GetMapping("/{email}")
    public Optional<Usuario> buscarPorEmail(@PathVariable String email) {
        return usuarioService.buscarPorEmail(email);
    }

    /**
     * Crear un nuevo usuario.
     *
     * POST /api/usuarios
     *
     * @param usuario Datos del usuario a crear.
     * @return El usuario guardado con su ID asignado.
     */
    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        return usuarioService.guardar(usuario);
    }

    /**
     * Actualizar un usuario existente.
     *
     * PUT /api/usuarios/{id}
     *
     * @param id      ID del usuario a actualizar.
     * @param usuario Datos actualizados del usuario.
     * @return Usuario actualizado.
     */
    @PutMapping("/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        usuario.setIdUsuario(id);
        return usuarioService.guardar(usuario);
    }

    /**
     * Eliminar un usuario por su ID.
     *
     * DELETE /api/usuarios/{id}
     *
     * @param id ID del usuario a eliminar.
     */
    @DeleteMapping("/{id}")
    public void eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
    }

    /**
     * Cambiar la contraseña de un usuario.
     *
     * PUT /api/usuarios/{id}/password
     *
     * El body debe contener únicamente el nuevo password como String.
     *
     * @param id ID del usuario.
     * @param nuevaPassword Nueva contraseña sin encriptar.
     * @return Usuario con la contraseña actualizada.
     */
    @PutMapping("/{id}/password")
    public Usuario cambiarPassword(@PathVariable Long id, @RequestBody String nuevaPassword) {
        return usuarioService.cambiarPassword(id, nuevaPassword);
    }
}
