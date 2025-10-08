import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = `${environment.apiBaseUrl}/Dashboard`;

  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin-stats`);
  }

  getManagerStats(managerId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/manager-stats/${managerId}`);
  }

  getEmployeeStats(employeeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/employee-stats/${employeeId}`);
  }
}
