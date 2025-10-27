import { Component, OnInit, signal } from '@angular/core';
// 1. Importa 'Event as RouterEvent' para el tipo genérico
import { Router, RouterOutlet, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
// import { filter } from 'rxjs/operators'; // Ya no necesitamos filter

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // Asegúrate de que sea styleUrls (plural)
})
export class App implements OnInit {
  protected readonly title = signal('clinica-frontend');

  constructor(private router: Router) {}

  ngOnInit(): void {
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