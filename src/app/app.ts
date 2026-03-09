// src/app/app.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Propiedades para los menús desplegables
  userMenuOpen = false;
  mobileMenuOpen = false;

  constructor(
    public cartService: CartService,
    public authService: AuthService
  ) {}

  /**
   * Cierra sesión
   */
  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
    this.userMenuOpen = false; // Cerrar menú al hacer logout
  }

  /**
   * Alterna el menú de usuario
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  /**
   * Alterna el menú móvil
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  /**
   * Cierra los menús al hacer clic fuera
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Cerrar menú de usuario si se hace clic fuera
    if (!target.closest('.user-menu')) {
      this.userMenuOpen = false;
    }
    
    // Cerrar menú móvil si se hace clic fuera
    if (!target.closest('.nav-menu') && !target.closest('.mobile-menu-btn')) {
      this.mobileMenuOpen = false;
    }
  }

  /**
   * Obtener nombre de usuario para mostrar
   */
  getUserDisplayName(user: any): string {
    if (!user) return '';
    
    // Si tiene nombre, usarlo, si no, usar la primera parte del email
    if (user.name) return user.name;
    return user.email ? user.email.split('@')[0] : 'Usuario';
  }
}