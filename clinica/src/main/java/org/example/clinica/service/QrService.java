package org.example.clinica.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class QrService {

    private static final int WIDTH = 200;
    private static final int HEIGHT = 200;

    /**
     * Genera un Código QR como un array de bytes PNG.
     * @param content El contenido a codificar (en nuestro caso, el ID del paciente).
     * @param width Ancho de la imagen.
     * @param height Alto de la imagen.
     * @return El array de bytes de la imagen QR.
     */
    public byte[] generateQrCodeImage(String content, int width, int height) {
        try {
            // Configuración del QR
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1); // Margen mínimo

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

            // Escribir la matriz de bits a un stream de bytes (PNG)
            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

            return pngOutputStream.toByteArray();

        } catch (Exception e) {
            System.err.println("Error al generar el Código QR para el contenido: " + content + " - " + e.getMessage());
            return new byte[0]; // Devuelve un array vacío en caso de error
        }
    }
}