package org.example.clinica.controller;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.mongo.Paciente;
import org.example.clinica.service.PacienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pacientes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PacienteController {

    // Spring intenta inyectar PacienteService aquí
    private final PacienteService pacienteService;

    // 1. Crear Paciente (Roles: MEDICO, ADMIN)
    @PostMapping
    public ResponseEntity<Paciente> crearPaciente(@RequestBody Paciente paciente) {
        Paciente nuevoPaciente = pacienteService.crearPaciente(paciente);
        return ResponseEntity.ok(nuevoPaciente);
    }

    // 2. Listar Todos (Roles: MEDICO, ENFERMERO, ADMIN)
    @GetMapping
    public ResponseEntity<List<Paciente>> listarPacientes() {
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    // 3. Buscar por ID (Roles: MEDICO, ENFERMERO, ADMIN)
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPaciente(@PathVariable String id) {
        Optional<Paciente> paciente = pacienteService.buscarPorId(id);
        return paciente.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 4. Actualizar Paciente (Roles: MEDICO, ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> actualizarPaciente(@PathVariable String id, @RequestBody Paciente pacienteActualizado) {
        try {
            Paciente paciente = pacienteService.actualizarPaciente(id, pacienteActualizado);
            return ResponseEntity.ok(paciente);
        } catch (RuntimeException e) {
            // Manejo de error para "Paciente no encontrado"
            return ResponseEntity.notFound().build();
        }
    }

    // 5. Eliminar Paciente (Roles: MEDICO, ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPaciente(@PathVariable String id) {
        pacienteService.eliminarPaciente(id);
        return ResponseEntity.noContent().build();
    }
}
