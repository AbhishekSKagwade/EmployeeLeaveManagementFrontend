import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'https://localhost:7215/api/Auth';
  
  constructor(private http: HttpClient) {}

  login(dto: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, dto).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('name', res.name);
        localStorage.setItem('employeeId', res.employeeId);
      })
    );
  }

  logout() {
    localStorage.clear();
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getEmployeeId(): number {
    return Number(localStorage.getItem('employeeId')) || 0;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

}
