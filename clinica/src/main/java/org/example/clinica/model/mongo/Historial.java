package org.example.clinica.model.mongo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Historial {
    private String fecha;
    private String detalle;
}