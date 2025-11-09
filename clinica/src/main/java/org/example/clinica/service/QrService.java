package org.example.clinica.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QrService {

    private static final int WIDTH = 200;
    private static final int HEIGHT = 200;

    @Autowired
    private JavaMailSender mailSender;

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

    /**
     * Genera un Código QR con el tamaño por defecto.
     * @param content El contenido a codificar.
     * @return El array de bytes de la imagen QR.
     */
    public byte[] generateQrCodeImage(String content) {
        return generateQrCodeImage(content, WIDTH, HEIGHT);
    }

    /**
     * Envía el QR por email a los emails prioritarios usando JavaMailSender.
     * @param pacienteId ID del paciente
     * @param emails Lista de emails destinatarios
     * @param qrData Datos del QR (imagen en bytes)
     */
    public void enviarQrPorEmail(String pacienteId, List<String> emails, byte[] qrData) {
        if (emails == null || emails.isEmpty()) {
            System.out.println("No hay emails configurados para enviar el QR del paciente: " + pacienteId);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(emails.toArray(new String[0]));
            helper.setSubject("Código QR de Paciente - Clínica Nefrológica");
            helper.setText("Adjunto el código QR para acceder a la información del paciente.\n\n" +
                          "Para probar el QR:\n" +
                          "1. Escanea el código QR adjunto con tu teléfono\n" +
                          "2. O ingresa manualmente en tu navegador: http://localhost:4200/pacientes/" + pacienteId + "/observar/datos-personales\n\n" +
                          "Nota: El QR contiene la URL completa para acceder directamente al paciente.\n" +
                          "Si estás en móvil, necesitarás iniciar sesión primero en la aplicación.\n\n" +
                          "Atentamente,\nClínica Nefrológica");

            // Adjuntar la imagen QR
            helper.addAttachment("qr_paciente_" + pacienteId + ".png", new ByteArrayResource(qrData));

            mailSender.send(message);

            System.out.println("=== QR ENVIADO POR EMAIL ===");
            System.out.println("Paciente ID: " + pacienteId);
            System.out.println("Destinatarios: " + String.join(", ", emails));
            System.out.println("Estado: QR enviado exitosamente");
            System.out.println("============================");

        } catch (Exception e) {
            System.err.println("Error al enviar QR por email para paciente " + pacienteId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
