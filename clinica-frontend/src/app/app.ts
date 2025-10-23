import { Component, OnInit, signal } from '@angular/core'; // Importa OnInit
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router'; // Importa Router y eventos
import { filter } from 'rxjs/operators'; // Importa filter

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate que sea standalone si así lo generó el CLI
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] // Cambiado a styleUrls
})
export class App implements OnInit { // Implementa OnInit
  protected readonly title = signal('clinica-frontend');

  // Inyecta el Router
  constructor(private router: Router) {}

  ngOnInit(): void {
    // Escucha los eventos de navegación
    this.router.events.pipe(
      // Filtra para mostrar solo los eventos principales (opcional, puedes quitarlo para ver TODO)
      filter(event =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      )
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('>>> Router Event: NavigationStart - Navegando a:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('>>> Router Event: NavigationEnd - Navegación completada a:', event.urlAfterRedirects);
      } else if (event instanceof NavigationCancel) {
        console.log('>>> Router Event: NavigationCancel - Navegación cancelada:', event.reason);
      } else if (event instanceof NavigationError) {
        console.log('>>> Router Event: NavigationError - Error navegando a:', event.url, 'Error:', event.error);
      }
    });
  }
}