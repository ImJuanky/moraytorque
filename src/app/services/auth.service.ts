// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { User, LoginCredentials, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3003/users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        this.currentUserSubject.next(user);
      } catch (e) {
        console.error('Error parsing user', e);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      map(users => {
        const user = users.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );
        
        if (user) {
          // No guardar la contraseña en localStorage
          const { password, ...safeUser } = user;
          localStorage.setItem('currentUser', JSON.stringify(safeUser));
          this.currentUserSubject.next(safeUser as User);
          return { success: true, user: safeUser as User };
        } else {
          return { success: false, message: 'Email o contraseña incorrectos' };
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }
}