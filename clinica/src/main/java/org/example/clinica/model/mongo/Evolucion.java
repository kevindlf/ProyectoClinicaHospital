package org.example.clinica.model.mongo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Evolucion {
    private String fecha;
    private String profesional;
    private String informeGeneral;
}
