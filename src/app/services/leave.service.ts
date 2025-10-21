import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeaveRequest } from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiBaseUrl}/Leave`;

  constructor(private http: HttpClient) {}

  // Fetch leaves for a specific employee
  getMyLeaves(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my-leaves/${employeeId}`);
  }

  // Fetch team leaves for manager
  getTeamLeaves(employeeId: number): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/team-leaves/${employeeId}`);
  }

  // ✅ Fetch all leaves for admin
  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/all`);
  }

  updateLeaveStatus(leaveRequestId: number, status: string) {
    return this.http.put(`${this.apiUrl}/update-status/${leaveRequestId}`, { status });
  }

  deleteLeave(leaveRequestId: number) {
    return this.http.delete(`${this.apiUrl}/delete/${leaveRequestId}`);
  }

  addLeave(leave: Partial<LeaveRequest>) {
    return this.http.post(`${this.apiUrl}/add`, leave);
  }
}
