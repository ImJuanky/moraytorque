// src/app/app.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartService } from './services/cart.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,  // Necesario para *ngIf y *ngFor
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    public cartService: CartService,
    public authService: AuthService  // Hacer público para usarlo en el template
  ) {}

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }
}