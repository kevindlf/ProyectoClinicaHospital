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

        // 2. El contenido de nuestro QR es la URL completa para acceder al paciente. Lo guardamos en el campo.
        // Usamos localhost para desarrollo local
        nuevoPaciente.setQrCodeData("http://localhost:4200/pacientes/" + nuevoPaciente.getId() + "/observar");

        // 3. Genera y envía el QR por email automáticamente (usando los primeros emails configurados)
        byte[] qrImage = qrService.generateQrCodeImage(nuevoPaciente.getQrCodeData());
        List<String> emailsParaQr = nuevoPaciente.getEmails();
        if (emailsParaQr != null && !emailsParaQr.isEmpty()) {
            // Tomar los primeros 2 emails para envío automático de QR
            List<String> emailsPrioritarios = emailsParaQr.subList(0, Math.min(2, emailsParaQr.size()));
            qrService.enviarQrPorEmail(nuevoPaciente.getId(), emailsPrioritarios, qrImage);
        }

        // 4. Guarda el paciente por segunda vez para persistir la data del QR.
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

        // 2. Verificar si se modificaron los emails para reenviar QR
        boolean emailsModificados = false;
        if (pacienteActualizado.getEmails() != null &&
            !pacienteActualizado.getEmails().equals(pacienteExistente.getEmails())) {
            emailsModificados = true;
        }

        // 3. Fusiona los campos no null del pacienteActualizado al pacienteExistente
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

        // 4. Si se modificaron los emails, reenviar el QR a los primeros emails
        if (emailsModificados && pacienteExistente.getEmails() != null &&
            !pacienteExistente.getEmails().isEmpty()) {
            byte[] qrImage = qrService.generateQrCodeImage(pacienteExistente.getQrCodeData());
            List<String> emailsPrioritarios = pacienteExistente.getEmails().subList(0, Math.min(2, pacienteExistente.getEmails().size()));
            qrService.enviarQrPorEmail(pacienteExistente.getId(), emailsPrioritarios, qrImage);
        }

        // 5. Guarda y devuelve el paciente fusionado
        return pacienteRepository.save(pacienteExistente);
    }

    public void eliminarPaciente(String id) {
        pacienteRepository.deleteById(id);
    }
}
