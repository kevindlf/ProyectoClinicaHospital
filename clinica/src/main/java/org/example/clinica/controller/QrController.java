package org.example.clinica.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QrController {

    @GetMapping("/generate/{pacienteId}")
    public ResponseEntity<String> generateQrUrl(@PathVariable String pacienteId) {
        // Genera la URL para el QR que apunta directamente a la observación del paciente
        String qrUrl = "http://localhost:4200/pacientes/" + pacienteId + "/observar";
        return ResponseEntity.ok(qrUrl);
    }
}
