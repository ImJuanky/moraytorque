// src/app/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials, AuthResponse } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión';
          this.loading = false;
        }
      },
      error: (error: Error) => {
        console.error('Error en login:', error);
        this.errorMessage = 'Error de conexión. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }
}