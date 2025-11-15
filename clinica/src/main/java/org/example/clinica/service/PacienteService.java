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

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los pacientes.
 *
 * Incluye:
 * - Creación de pacientes con generación automática de QR.
 * - Actualización parcial de datos fusionando solo campos no nulos.
 * - Reenvío automático de QR cuando cambian los emails registrados.
 * - Borrado y consulta de pacientes almacenados en MongoDB.
 */
@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final QrService qrService; // Servicio encargado de generar y enviar códigos QR

    /**
     * Crea un nuevo paciente en la base de datos.
     *
     * Proceso:
     * 1. Se guarda inicialmente para obtener un ID generado por MongoDB.
     * 2. Se construye la URL que estará dentro del código QR.
     * 3. Se genera la imagen del QR.
     * 4. Se envía automáticamente el QR a los primeros emails registrados.
     * 5. Se vuelve a guardar el paciente con la URL del QR incorporada.
     *
     * @param paciente Datos del paciente a registrar.
     * @return Paciente recién creado y con la URL del QR asignada.
     */
    public Paciente crearPaciente(Paciente paciente) {
        Paciente nuevoPaciente = pacienteRepository.save(paciente);

        // URL para QR
        nuevoPaciente.setQrCodeData(
                "http://localhost:4200/pacientes/" + nuevoPaciente.getId() + "/observar"
        );

        // Generación y envío del QR
        byte[] qrImage = qrService.generateQrCodeImage(nuevoPaciente.getQrCodeData());
        List<String> emailsParaQr = nuevoPaciente.getEmails();

        if (emailsParaQr != null && !emailsParaQr.isEmpty()) {
            List<String> emailsPrioritarios =
                    emailsParaQr.subList(0, Math.min(2, emailsParaQr.size()));

            qrService.enviarQrPorEmail(
                    nuevoPaciente.getId(),
                    emailsPrioritarios,
                    qrImage
            );
        }

        return pacienteRepository.save(nuevoPaciente);
    }

    /**
     * Obtiene una lista de todos los pacientes registrados.
     *
     * @return Lista completa de pacientes.
     */
    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    /**
     * Busca un paciente por su ID.
     *
     * @param id Identificador único del paciente.
     * @return Optional que puede contener el paciente encontrado.
     */
    public Optional<Paciente> buscarPorId(String id) {
        return pacienteRepository.findById(id);
    }

    /**
     * Actualiza parcialmente un paciente existente.
     *
     * Comportamiento:
     * - Ignora campos nulos del objeto recibido (solo sobrescribe valores presentes).
     * - Mantiene campos inmutables como el ID y la URL del QR.
     * - Si cambian los emails, se genera y reenvía automáticamente el código QR.
     *
     * @param id ID del paciente a actualizar.
     * @param pacienteActualizado Objeto con los nuevos datos.
     * @return Paciente actualizado y persistido.
     */
    public Paciente actualizarPaciente(String id, Paciente pacienteActualizado) {
        Paciente pacienteExistente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        boolean emailsModificados = false;

        // Verificar si se modificaron los emails
        if (pacienteActualizado.getEmails() != null &&
                !pacienteActualizado.getEmails().equals(pacienteExistente.getEmails())) {
            emailsModificados = true;
        }

        // Copiar campos no nulos (update parcial)
        try {
            PropertyDescriptor[] descriptors = BeanUtils.getPropertyDescriptors(Paciente.class);

            for (PropertyDescriptor descriptor : descriptors) {
                String propertyName = descriptor.getName();

                // Campos protegidos
                if ("id".equals(propertyName)
                        || "qrCodeData".equals(propertyName)
                        || "class".equals(propertyName)) {
                    continue;
                }

                Method readMethod = descriptor.getReadMethod();
                if (readMethod != null) {
                    Object value = readMethod.invoke(pacienteActualizado);

                    if (value != null) {
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

        // Reenvío del QR si cambiaron los emails
        if (emailsModificados &&
                pacienteExistente.getEmails() != null &&
                !pacienteExistente.getEmails().isEmpty()) {

            byte[] qrImage = qrService.generateQrCodeImage(pacienteExistente.getQrCodeData());

            List<String> emailsPrioritarios =
                    pacienteExistente.getEmails().subList(0, Math.min(2, pacienteExistente.getEmails().size()));

            qrService.enviarQrPorEmail(pacienteExistente.getId(), emailsPrioritarios, qrImage);
        }

        return pacienteRepository.save(pacienteExistente);
    }

    /**
     * Elimina un paciente por su ID.
     *
     * @param id Identificador del paciente.
     */
    public void eliminarPaciente(String id) {
        pacienteRepository.deleteById(id);
    }
}
