import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalEmployees?: number;
  pendingLeaves?: number;
  teamMembers?: number;
  myPendingLeaves?: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  getAdminStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/Dashboard/admin');
  }

  getManagerStats(managerId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`/api/Dashboard/manager/${managerId}`);
  }

  getEmployeeStats(employeeId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`/api/Dashboard/employee/${employeeId}`);
  }
}
