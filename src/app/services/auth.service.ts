import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private redirectUrl: string | null = null;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.checkToken();
  }

  private checkToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // El backend devuelve { token, email, role }
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          email: response.email,
          role: response.role,
          name: response.role === 'admin' ? 'Administrador' : 'Usuario'
        }));
        this.currentUserSubject.next(this.getCurrentUser());
      }),
      catchError(err => {
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
  }

  handleLoginSuccess(): void {
    const redirect = this.redirectUrl || '/catalog';
    this.redirectUrl = null;
    localStorage.removeItem('redirectUrl');
    this.router.navigateByUrl(redirect);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
    localStorage.setItem('redirectUrl', url);
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}