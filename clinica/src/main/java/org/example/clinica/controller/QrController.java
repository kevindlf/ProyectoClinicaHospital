package org.example.clinica.controller;

import lombok.RequiredArgsConstructor;
import org.example.clinica.service.QrService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    /**
     * Endpoint para generar y devolver la imagen PNG del Código QR de un paciente.
     * @param id El ID de MongoDB del paciente (contenido del QR).
     * @return ResponseEntity con la imagen PNG en el cuerpo.
     */
    @GetMapping(value = "/{id}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrCode(@PathVariable String id) {
        try {
            // Genera la imagen del QR usando el ID como contenido.
            byte[] qrImage = qrService.generateQrCodeImage(id, 200, 200);

            if (qrImage.length == 0) {
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Cabeceras para indicar al navegador que es una imagen PNG
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);

            return new ResponseEntity<>(qrImage, headers, HttpStatus.OK);

        } catch (Exception e) {
            System.err.println("Error en el controlador QR para ID: " + id + " - " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}