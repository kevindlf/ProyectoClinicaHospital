// src/app/admin/admin-list/admin-list.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { UsuarioService, Usuario } from '../usuario';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

/**
 * Componente para listar y gestionar usuarios existentes.
 * Muestra una tabla con usuarios filtrables por búsqueda en tiempo real
 * (email, nombre, apellido, rol), permite editar usuarios existentes,
 * eliminar usuarios con confirmación y navegar de vuelta al dashboard.
 * Incluye indicadores de carga, manejo de errores y navegación responsive.
 * Accesible para usuarios con permisos de gestión de usuarios (ADMIN).
 */
@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './admin-list.html',
  styleUrls: ['./admin-list.css']
})
export class AdminListComponent implements OnInit {

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroBusqueda: string = '';
  columnasMostradas: string[] = ['id', 'nombre', 'email', 'rol', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.usuariosFiltrados = usuarios;
        console.log('Usuarios cargados:', usuarios);
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  filtrarUsuarios(): void {
    if (!this.filtroBusqueda.trim()) {
      this.usuariosFiltrados = this.usuarios;
      return;
    }

    const filtro = this.filtroBusqueda.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(filtro) ||
      usuario.apellido.toLowerCase().includes(filtro) ||
      usuario.email.toLowerCase().includes(filtro) ||
      usuario.rol.toLowerCase().includes(filtro)
    );
  }

  getRolClass(rol: string): string {
    switch (rol.toUpperCase()) {
      case 'ADMIN': return 'rol-admin';
      case 'MEDICO': return 'rol-medico';
      case 'ENFERMERO': return 'rol-enfermero';
      case 'TECNICO': return 'rol-tecnico';
      default: return 'rol-default';
    }
  }

  verUsuario(usuario: Usuario): void {
    // Mostrar detalles básicos del usuario sin fecha
    console.log('Ver usuario:', usuario);
    alert(`Detalles del usuario:\n\nNombre: ${usuario.nombre} ${usuario.apellido}\nEmail: ${usuario.email}\nRol: ${usuario.rol}`);
  }

  editarUsuario(usuario: Usuario): void {
    // Método eliminado - no se usa
  }

  cambiarPassword(usuario: Usuario): void {
    // Mejor implementación con confirmación
    const nuevaPassword = prompt(`Cambiar contraseña para ${usuario.nombre} ${usuario.apellido}:`);
    if (nuevaPassword && nuevaPassword.trim()) {
      if (confirm(`¿Estás seguro de cambiar la contraseña de ${usuario.nombre} ${usuario.apellido}?`)) {
        this.usuarioService.cambiarPassword(usuario.idUsuario, nuevaPassword.trim()).subscribe({
          next: () => {
            console.log('Contraseña cambiada:', usuario);
            alert(`Contraseña cambiada exitosamente para ${usuario.nombre} ${usuario.apellido}`);
          },
          error: (error: any) => {
            console.error('Error al cambiar contraseña:', error);
            alert('Error al cambiar la contraseña. Inténtalo de nuevo.');
          }
        });
      }
    } else if (nuevaPassword !== null) {
      alert('La contraseña no puede estar vacía.');
    }
  }

  eliminarUsuario(usuario: Usuario): void {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`)) {
      this.usuarioService.eliminarUsuario(usuario.idUsuario).subscribe({
        next: () => {
          console.log('Usuario eliminado:', usuario);
          this.cargarUsuarios(); // Recargar la lista
        },
        error: (error: any) => {
          console.error('Error al eliminar usuario:', error);
        }
      });
    }
  }

  volverAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
