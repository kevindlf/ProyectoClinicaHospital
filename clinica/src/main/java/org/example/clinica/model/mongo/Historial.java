package org.example.clinica.model.mongo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Historial {
    private String fecha;
    private String profesional; // Quién lo hizo
    private String grupoSanguineo;
    private String peso;
    private String pesoSeco;
    private String altura;
    private String fechaPrimeraDialisisVida;
    private String fechaPrimeraDialisisClinica;
    private String heparina;
    private String antecedentesEnfermedad;
    private String medicacionPrescritaDialisis;
    private String medicacionDomiciliaria;
    private String detalle; // Campo adicional para informe general
}
