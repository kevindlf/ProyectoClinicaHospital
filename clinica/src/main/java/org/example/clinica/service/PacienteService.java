package org.example.clinica.service;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.mongo.Paciente;
import org.example.clinica.repository.mongo.PacienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final QrService qrService; // Inyección del servicio QR

    public Paciente crearPaciente(Paciente paciente) {
        // 1. Guarda el paciente por primera vez para que MongoDB le asigne el ID único.
        Paciente nuevoPaciente = pacienteRepository.save(paciente);

        // 2. El contenido de nuestro QR es el ID del paciente. Lo guardamos en el campo.
        nuevoPaciente.setQrCodeData(nuevoPaciente.getId());

        // 3. Guarda el paciente por segunda vez para persistir la data del QR.
        return pacienteRepository.save(nuevoPaciente);
    }

    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    public Optional<Paciente> buscarPorId(String id) {
        return pacienteRepository.findById(id);
    }

    public Paciente actualizarPaciente(String id, Paciente pacienteActualizado) {
        // 1. Busca el paciente existente
        Paciente pacienteExistente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        // 2. Transfiere el ID y la data QR inmutable del paciente existente al actualizado.
        pacienteActualizado.setId(pacienteExistente.getId());
        pacienteActualizado.setQrCodeData(pacienteExistente.getQrCodeData()); // Mantiene el QR original

        // 3. Guarda y devuelve el paciente actualizado
        return pacienteRepository.save(pacienteActualizado);
    }

    public void eliminarPaciente(String id) {
        pacienteRepository.deleteById(id);
    }
}