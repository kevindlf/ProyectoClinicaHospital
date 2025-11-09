import { Component, OnInit, signal } from '@angular/core';
// 1. Importa 'Event as RouterEvent' para el tipo genérico
import { Router, RouterOutlet, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
// import { filter } from 'rxjs/operators'; // Ya no necesitamos filter
import { AuthService } from './auth/auth'; // Importa AuthService

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // Asegúrate de que sea styleUrls (plural)
})
export class App implements OnInit {
  protected readonly title = signal('clinica-frontend');

  constructor(private router: Router, private authService: AuthService) {} // Inyecta AuthService

  ngOnInit(): void {
    // Escuchar eventos de navegación para detectar acceso a rutas protegidas
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        const targetUrl = event.url;
        const isPatientAccess = targetUrl.startsWith('/pacientes/');

        if (!this.authService.estaLogueado() && isPatientAccess) {
          // Guardar la URL de retorno para después del login
          localStorage.setItem('returnUrl', targetUrl);
          console.log('Acceso a pacientes detectado, guardando URL de retorno:', targetUrl);
          // Redirigir al login
          this.router.navigate(['/auth/login']);
        }
      }
    });

    // Verificar si ya estamos en una ruta que requiere login al iniciar
    const currentUrl = this.router.url;
    if (!this.authService.estaLogueado() && currentUrl.startsWith('/pacientes/')) {
      localStorage.setItem('returnUrl', currentUrl);
      console.log('Aplicación iniciada en ruta de pacientes, guardando URL de retorno:', currentUrl);
      this.router.navigate(['/auth/login']);
    }

    // 2. Escucha TODOS los eventos sin filtrar
    this.router.events.subscribe((event: RouterEvent) => { // Tipamos el evento
      console.log('>>> Router Event:', event); // Logueamos el objeto completo del evento

      // Mantenemos los logs específicos para resaltar los eventos clave
      if (event instanceof NavigationStart) {
        console.log('>>> NavigationStart - Target:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('>>> NavigationEnd - Final URL:', event.urlAfterRedirects);
      } else if (event instanceof NavigationCancel) {
        console.log('>>> NavigationCancel - Reason:', event.reason);
      } else if (event instanceof NavigationError) {
        console.log('>>> NavigationError - URL:', event.url, 'Error:', event.error);
      }
    });
  }
}
