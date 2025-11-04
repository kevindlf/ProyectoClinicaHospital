// src/app/auth/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core'; // Importa inject
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth'; // Importa tu AuthService

// La función interceptora
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,       // La petición saliente
  next: HttpHandlerFn              // Función para pasar la petición al siguiente interceptor o al backend
): Observable<HttpEvent<unknown>> => {

  // 1. Inyecta el AuthService para poder usar sus métodos
  const authService = inject(AuthService);

  // 2. Obtiene el token guardado
  const authToken = authService.obtenerToken();

  // 3. Si el token existe, clona la petición y añade la cabecera Authorization
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}` // Formato estándar Bearer
      }
    });
    // 4. Pasa la petición MODIFICADA al siguiente manejador
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // 5. Si la respuesta es 401 (Unauthorized), el token podría estar expirado
        if (error.status === 401) {
          console.log('Token expirado o inválido detectado en interceptor. Cerrando sesión.');
          authService.logout();
          // Podrías redirigir al login aquí si tienes acceso al router
          // inject(Router).navigate(['/auth/login']);
        }
        // Re-lanza el error para que el componente lo maneje
        return throwError(() => error);
      })
    );
  } else {
    // 6. Si no hay token, pasa la petición ORIGINAL sin modificar
    return next(req);
  }
};