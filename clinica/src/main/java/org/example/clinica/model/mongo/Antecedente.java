package org.example.clinica.model.mongo;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Antecedente {
    private String nombre;
    private String detalle;
}