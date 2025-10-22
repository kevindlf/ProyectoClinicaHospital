package org.example.clinica.model.mongo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Medicacion {
    private String nombre;
    private String dosis;
}