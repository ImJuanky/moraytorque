
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
  
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.checkToken();
  }


  private checkToken(): void {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    
    if (this.isLoggedIn) {
      const user = this.getCurrentUser();
      this.currentUserSubject.next(user);
    }
  }


  isAuthenticated(): boolean {
    return this.isLoggedIn || !!localStorage.getItem('token');
  }

 
  login(credentials: { email: string; password: string }): Observable<any> {
 
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


  handleLoginSuccess(response: any): void {
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.isLoggedIn = true;
    

    this.currentUserSubject.next(response.user);

   
    const redirect = this.redirectUrl || '/catalog';
    this.redirectUrl = null;
    localStorage.removeItem('redirectUrl');
    this.router.navigateByUrl(redirect);
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectUrl');
    this.isLoggedIn = false;
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