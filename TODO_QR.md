# TODO - Implementación de Funcionalidad QR

## Backend - Java/Spring Boot

### 1. Modificar Modelo Paciente
- [ ] Agregar campo `emailsPrioritarios` (List<String>) al modelo Paciente
- [ ] Agregar validación básica de formato de email
- [ ] Mantener compatibilidad con campo `emails` existente

### 2. Crear Servicio QR
- [ ] Crear `QrService.java` para generar códigos QR
- [ ] Implementar generación de QR con ID del paciente
- [ ] Crear método para generar QR en formato imagen
- [ ] Crear método para generar QR en formato PDF

### 3. Modificar PacienteService
- [ ] Actualizar `crearPaciente()` para enviar QR por email automáticamente
- [ ] Actualizar `actualizarPaciente()` para reenviar QR si se modifican emails
- [ ] Crear método auxiliar para envío de QR por email

### 4. Crear Controlador QR
- [ ] Crear `QrController.java` con endpoints protegidos
- [ ] Endpoint GET `/api/qr/{pacienteId}` para obtener QR (solo lectura)
- [ ] Endpoint GET `/api/qr/{pacienteId}/download` para descargar QR en PDF/imagen

### 5. Configurar Email (simulado)
- [ ] Crear configuración básica para envío de emails
- [ ] Implementar envío simulado de QR por email
- [ ] Agregar logs para verificar envío

## Frontend - Angular

### 6. Modificar Formulario de Paciente
- [ ] Actualizar formulario de creación/edición para múltiples emails
- [ ] Agregar validación de formato de email
- [ ] Marcar emails como prioritarios

### 7. Mostrar QR en Observación
- [ ] Agregar sección de QR en `paciente-observar-detail.component.html`
- [ ] Mostrar imagen del QR generado
- [ ] Agregar botón para descargar QR en PDF/imagen

### 8. Servicio QR en Frontend
- [ ] Crear `qr.service.ts` para consumir endpoints del backend
- [ ] Implementar métodos para obtener y descargar QR

## Seguridad
- [ ] Asegurar que endpoints de QR solo sean accesibles con autenticación
- [ ] Verificar roles autorizados (MEDICO, ENFERMERO, TECNICO, ADMIN)

## Testing
- [ ] Probar creación de paciente con envío de QR
- [ ] Probar actualización de emails con reenvío de QR
- [ ] Probar descarga de QR desde observación
- [ ] Verificar permisos de acceso
