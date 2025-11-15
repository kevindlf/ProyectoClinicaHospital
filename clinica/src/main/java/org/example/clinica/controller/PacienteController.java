package org.example.clinica.controller;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.mongo.Paciente;
import org.example.clinica.service.PacienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * Controlador REST del módulo Pacientes.
 *
 * Expone los endpoints CRUD para gestionar pacientes en la base MongoDB.
 * Este controlador solo actúa como intermediario entre las peticiones HTTP
 * y la lógica de negocio ubicada en PacienteService.
 *
 * Los roles autorizados para cada operación están definidos en SecurityConfig.
 */
@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PacienteController {

    /**
     * Servicio que contiene la lógica de negocio para:
     * - Crear pacientes
     * - Consultarlos
     * - Actualizarlos
     * - Eliminarlos
     *
     * Se inyecta automáticamente gracias a @RequiredArgsConstructor.
     */
    private final PacienteService pacienteService;

    /**
     * Crear un nuevo paciente.
     *
     * Roles permitidos: ADMIN, MEDICO.
     *
     * @param paciente información recibida en el cuerpo de la petición.
     * @return paciente recién creado con su ID asignado.
     */
    @PostMapping
    public ResponseEntity<Paciente> crearPaciente(@RequestBody Paciente paciente) {
        Paciente nuevoPaciente = pacienteService.crearPaciente(paciente);
        return ResponseEntity.ok(nuevoPaciente);
    }

    /**
     * Obtener la lista completa de pacientes.
     *
     * Roles permitidos: ADMIN, MEDICO, ENFERMERO, TECNICO.
     *
     * @return lista con todos los pacientes almacenados.
     */
    @GetMapping
    public ResponseEntity<List<Paciente>> listarPacientes() {
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    /**
     * Buscar un paciente por su ID en MongoDB.
     *
     * Roles permitidos: ADMIN, MEDICO, ENFERMERO, TECNICO.
     *
     * @param id identificador del paciente.
     * @return si existe → 200 OK con el paciente.
     *         si no existe → 404 Not Found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPaciente(@PathVariable String id) {
        Optional<Paciente> paciente = pacienteService.buscarPorId(id);
        return paciente.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Actualizar un paciente existente.
     *
     * Roles permitidos: ADMIN, MEDICO.
     *
     * @param id ID del paciente a actualizar.
     * @param pacienteActualizado datos nuevos del paciente.
     * @return el paciente ya actualizado.
     *         si no existe → 404 Not Found.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizarPaciente(@PathVariable String id, @RequestBody Paciente pacienteActualizado) {
        try {
            Paciente paciente = pacienteService.actualizarPaciente(id, pacienteActualizado);
            return ResponseEntity.ok(paciente);
        } catch (RuntimeException e) {
            // El servicio lanza excepción cuando el paciente no se encuentra
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Eliminar un paciente por su ID.
     *
     * Roles permitidos: ADMIN, MEDICO.
     *
     * @param id ID del paciente a eliminar.
     * @return 204 No Content en caso de éxito.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPaciente(@PathVariable String id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}
