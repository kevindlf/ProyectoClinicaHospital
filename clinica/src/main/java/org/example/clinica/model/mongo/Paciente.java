package org.example.clinica.model.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "pacientes")
public class Paciente {
    @Id
    private String id;

    // --- Campo Añadido para el QR ---
    private String qrCodeData; // Almacena el ID (o la URL) que se codifica en el QR
    // --------------------------------

    // Datos personales
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

    // Alergias y transfusiones
    private List<Alergia> alergias;
    private boolean testigoJehova;
    private boolean seTransfunde;

    // Antecedentes
    private List<Antecedente> antecedentesPersonales;

    // Medicación actual
    private List<Medicacion> medicacionActual;

    // Historia clínica
    private List<Historial> historiaClinica;

    // Parámetros de diálisis
    private Map<String, String> parametrosDialisis;

    // Evolución mensual
    private List<Evolucion> evolucionMensual;
}
