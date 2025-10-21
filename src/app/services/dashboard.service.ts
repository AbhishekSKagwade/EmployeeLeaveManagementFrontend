import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiBaseUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  // ✅ Fetch dashboard stats for Admin
  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin-stats`);
  }

  // ✅ Fetch dashboard stats for Manager
  getManagerStats(managerId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/manager-stats/${managerId}`);
  }

  // ✅ Fetch dashboard stats for Employee
  getEmployeeStats(employeeId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/employee-stats/${employeeId}`);
  }
}
