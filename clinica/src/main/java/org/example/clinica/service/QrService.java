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

/**
 * Servicio encargado de generar códigos QR y enviarlos por correo electrónico.
 * Funcionalidades principales:
 * - Generación de QR en formato PNG usando ZXing.
 * - Envío del QR por email a una lista de destinatarios.
 * Este servicio es utilizado por PacienteService para automatizar el envío
 * del QR de acceso al perfil del paciente.
 */
@Service
public class QrService {

    private static final int WIDTH = 200;
    private static final int HEIGHT = 200;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Genera una imagen PNG de un código QR a partir de un texto.
     * Proceso:
     * - Se configura ZXing con compresión UTF-8 y nivel de corrección alto.
     * - Se genera la matriz del QR.
     * - Se convierte la matriz en bytes PNG.
     *
     * @param content Contenido a codificar en el QR (por ejemplo, la URL del paciente).
     * @param width Ancho deseado del QR.
     * @param height Alto deseado del QR.
     * @return Array de bytes correspondiente a la imagen PNG generada.
     */
    public byte[] generateQrCodeImage(String content, int width, int height) {
        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    width,
                    height,
                    hints
            );

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

            return pngOutputStream.toByteArray();

        } catch (Exception e) {
            System.err.println(
                    "Error al generar el Código QR para el contenido: "
                            + content + " - " + e.getMessage()
            );
            return new byte[0];
        }
    }

    /**
     * Genera una imagen PNG de un QR usando el tamaño por defecto (200x200).
     *
     * @param content Contenido a codificar.
     * @return Imagen del QR en bytes.
     */
    public byte[] generateQrCodeImage(String content) {
        return generateQrCodeImage(content, WIDTH, HEIGHT);
    }

    /**
     * Envía un código QR por correo electrónico utilizando JavaMailSender.
     * Proceso:
     * - Crea un correo electrónico con asunto, cuerpo y adjunto.
     * - Adjunta la imagen del QR previamente generada.
     * - Envía el correo a los destinatarios especificados.
     * Notas:
     * - Este método es usado automáticamente cuando se crea o actualiza un paciente.
     * - Solo se envía si la lista de emails contiene al menos un destinatario.
     *
     * @param pacienteId ID del paciente asociado al QR.
     * @param emails Lista de destinatarios.
     * @param qrData Imagen del QR en bytes.
     */
    public void enviarQrPorEmail(String pacienteId, List<String> emails, byte[] qrData) {
        if (emails == null || emails.isEmpty()) {
            System.out.println(
                    "No hay emails configurados para enviar el QR del paciente: " + pacienteId
            );
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(emails.toArray(new String[0]));
            helper.setSubject("Código QR de Paciente - Clínica Nefrológica");
            helper.setText(
                    "Adjunto el código QR para acceder a la información del paciente.\n\n" +
                            "Para probar el QR:\n" +
                            "1. Escanea el código QR adjunto con tu teléfono\n" +
                            "2. O ingresa manualmente en tu navegador: http://localhost:4200/pacientes/"
                            + pacienteId + "/observar/datos-personales\n\n" +
                            "Nota: El QR contiene la URL completa para acceder directamente al paciente.\n" +
                            "Si estás en móvil, necesitarás iniciar sesión primero en la aplicación.\n\n" +
                            "Atentamente,\nClínica Nefrológica"
            );

            // Se adjunta el archivo PNG generado
            helper.addAttachment(
                    "qr_paciente_" + pacienteId + ".png",
                    new ByteArrayResource(qrData)
            );

            mailSender.send(message);

            System.out.println("=== QR ENVIADO POR EMAIL ===");
            System.out.println("Paciente ID: " + pacienteId);
            System.out.println("Destinatarios: " + String.join(", ", emails));
            System.out.println("Estado: QR enviado exitosamente");
            System.out.println("============================");

        } catch (Exception e) {
            System.err.println(
                    "Error al enviar QR por email para paciente "
                            + pacienteId + ": " + e.getMessage()
            );
            e.printStackTrace();
        }
    }
}
