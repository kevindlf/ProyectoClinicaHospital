package org.example.clinica.model.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

/**
 * Representa un Paciente dentro del sistema clínico.
 *
 * Este documento se almacena en MongoDB dentro de la colección "pacientes".
 * Contiene datos personales, antecedentes, medicación, historial clínico,
 * parámetros de diálisis, evolución mensual y información asociada al QR.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "pacientes")
public class Paciente {

    /**
     * Identificador único generado por MongoDB.
     */
    @Id
    private String id;

    // ============================================================
    // 🟦 INFORMACIÓN PARA QR
    // ============================================================

    /**
     * Información codificada dentro del QR.
     * Puede almacenar directamente el ID del paciente o una URL que
     * permita acceder a su ficha/observación desde el frontend.
     */
    private String qrCodeData;

    // ============================================================
    // 🟦 DATOS PERSONALES
    // ============================================================

    private String nombre;
    private String apellido;
    private String fechaNacimiento;
    private String documento;
    private String genero;
    private String estadoCivil;
    private String fechaPrimeraDialisis;
    private List<String> telefonos;
    private List<String> emails;
    private String domicilio;
    private String obraSocial;
    private String institucion;

    // ============================================================
    // 🟦 ALERGIAS Y TRANSFUSIONES
    // ============================================================

    /**
     * Lista de alergias registradas para el paciente.
     */
    private List<Alergia> alergias;

    /**
     * Indica si el paciente pertenece a la religión Testigos de Jehová.
     * Esto se usa para manejar restricciones en transfusiones.
     */
    private boolean testigoJehova;

    /**
     * Indica si el paciente acepta o no realizar transfusiones sanguíneas.
     */
    private boolean seTransfunde;

    // ============================================================
    // 🟦 ANTECEDENTES PERSONALES
    // ============================================================

    /**
     * Lista de antecedentes médicos relevantes del paciente.
     */
    private List<Antecedente> antecedentesPersonales;

    // ============================================================
    // 🟦 MEDICACIÓN ACTUAL
    // ============================================================

    /**
     * Lista de medicamentos que el paciente consume actualmente.
     */
    private List<Medicacion> medicacionActual;

    // ============================================================
    // 🟦 HISTORIA CLÍNICA
    // ============================================================

    /**
     * Registros clínicos realizados sobre el paciente.
     */
    private List<Historial> historiaClinica;

    // ============================================================
    // 🟦 PARÁMETROS DE DIÁLISIS
    // ============================================================

    /**
     * Parámetros técnicos relacionados a las sesiones de diálisis del paciente.
     * Se usa un Map<String, String> para flexibilidad en los valores.
     */
    private Map<String, String> parametrosDialisis;

    // ============================================================
    // 🟦 EVOLUCIÓN MENSUAL
    // ============================================================

    /**
     * Registros de evolución mensual del paciente.
     */
    private List<Evolucion> evolucionMensual;
}
