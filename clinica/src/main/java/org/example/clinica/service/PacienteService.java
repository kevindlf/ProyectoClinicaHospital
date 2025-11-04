package org.example.clinica.service;

import lombok.RequiredArgsConstructor;
import org.example.clinica.model.mongo.Paciente;
import org.example.clinica.repository.mongo.PacienteRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
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

        // 2. Fusiona los campos no null del pacienteActualizado al pacienteExistente
        // Excluye campos inmutables como id y qrCodeData
        try {
            PropertyDescriptor[] descriptors = BeanUtils.getPropertyDescriptors(Paciente.class);
            for (PropertyDescriptor descriptor : descriptors) {
                String propertyName = descriptor.getName();
                if ("id".equals(propertyName) || "qrCodeData".equals(propertyName) || "class".equals(propertyName)) {
                    continue; // Ignorar campos inmutables y la clase
                }
                Method readMethod = descriptor.getReadMethod();
                if (readMethod != null) {
                    Object value = readMethod.invoke(pacienteActualizado);
                    if (value != null) { // Solo copiar si no es null
                        Method writeMethod = descriptor.getWriteMethod();
                        if (writeMethod != null) {
                            writeMethod.invoke(pacienteExistente, value);
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Error al fusionar propiedades del paciente", e);
        }

        // 3. Guarda y devuelve el paciente fusionado
        return pacienteRepository.save(pacienteExistente);
    }

    public void eliminarPaciente(String id) {
        pacienteRepository.deleteById(id);
    }
}