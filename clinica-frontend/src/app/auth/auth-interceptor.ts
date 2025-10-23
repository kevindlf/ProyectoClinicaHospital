// src/app/auth/auth.interceptor.ts

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core'; // Importa inject
import { Observable } from 'rxjs';
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
    return next(authReq);
  } else {
    // 5. Si no hay token, pasa la petición ORIGINAL sin modificar
    return next(req);
  }
};