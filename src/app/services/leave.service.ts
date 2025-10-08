import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveRequest } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = 'https://localhost:7215/api/Leave';

  constructor(private http: HttpClient) {}

  applyLeave(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/apply`, data);
  }

  getMyLeaves(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/my/${employeeId}`);
  }

  getTeamLeaves(employeeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/team/${employeeId}`);
  }

  getAllLeaves(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  updateStatus(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve`, data);
  }

  updateLeaveStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/status/${id}`, { status });
  }

  deleteLeave(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${id}`);
  }
}
