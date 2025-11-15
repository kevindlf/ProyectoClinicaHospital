package org.example.clinica.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador encargado de generar la URL asociada a un QR
 * que redirige al módulo de observación de un paciente.
 *
 * Este endpoint no genera el código QR en sí, sino que devuelve
 * la URL que luego puede ser codificada como un QR desde el frontend
 * u otro servicio.
 */
@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QrController {

    /**
     * Endpoint para generar la URL que apunta a la vista de observación
     * de un paciente específico.
     *
     * @param pacienteId ID del paciente del cual se desea generar la URL.
     * @return ResponseEntity con la URL completa lista para ser transformada en QR.
     *
     * Ejemplo de salida:
     *   http://localhost:4200/pacientes/{id}/observar
     */
    @GetMapping("/generate/{pacienteId}")
    public ResponseEntity<String> generateQrUrl(@PathVariable String pacienteId) {

        // Construye la URL completa que será representada en el QR
        String qrUrl = "http://localhost:4200/pacientes/" + pacienteId + "/observar";

        return ResponseEntity.ok(qrUrl);
    }
}
