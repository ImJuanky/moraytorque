// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn = false;
  private redirectUrl: string | null = null;
  
  // BehaviorSubject para el usuario actual
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.checkToken();
  }

  // Verificar token al iniciar
  private checkToken(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    
    if (this.isLoggedIn) {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    }
  }

  // Método para verificar autenticación
  isAuthenticated(): boolean {
    return this.isLoggedIn || !!localStorage.getItem('token');
  }

  // Método de login
  login(credentials: { email: string; password: string }): Observable<any> {
    // Simular validación
    const isValid = (credentials.email === 'admin@moray.com' || credentials.email === 'user@moray.com') 
                    && credentials.password === '1234';
    
    if (isValid) {
      return of({
        success: true,
        token: 'fake-jwt-token-' + Date.now(),
        user: {
          email: credentials.email,
          name: credentials.email === 'admin@moray.com' ? 'Administrador' : 'Usuario',
          role: credentials.email === 'admin@moray.com' ? 'admin' : 'user'
        }
      }).pipe(delay(1000));
    } else {
      return of({
        success: false,
        message: 'Credenciales inválidas'
      }).pipe(delay(1000));
    }
  }

  // ¡NUEVO! Procesar login exitoso
  handleLoginSuccess(response: any): void {
    // Guardar token
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.isLoggedIn = true;
    
    // Emitir el nuevo usuario
    this.currentUserSubject.next(response.user);

    // Redirigir a la URL guardada o al catálogo
    const redirect = this.redirectUrl || '/catalog';
    this.redirectUrl = null;
    localStorage.removeItem('redirectUrl');
    this.router.navigateByUrl(redirect);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');
    this.isLoggedIn = false;
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Guardar URL para redirección
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
    localStorage.setItem('redirectUrl', url);
  }

  // Obtener usuario actual
  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}