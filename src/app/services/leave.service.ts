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

  // Fetch leaves for the current user
  getMyLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/my`);
  }

  // Approve leave
  approveLeave(leaveRequestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve`, { leaveRequestId, approved: true });
  }

  // Reject leave
  rejectLeave(leaveRequestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve`, { leaveRequestId, approved: false });
  }

  // Delete leave (for employees to cancel pending leaves)
  deleteLeave(leaveRequestId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cancel/${leaveRequestId}`);
  }

  // Fetch team leaves for manager
  getTeamLeaves(): Observable<LeaveRequest[]> {
    console.log('Calling getTeamLeaves API:', `${this.apiUrl}/team`);
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/team`);
  }

  // ✅ Fetch all leaves for admin
  getAllLeaves(): Observable<LeaveRequest[]> {
    return this.http.get<LeaveRequest[]>(`${this.apiUrl}/all`);
  }



  addLeave(leave: Partial<LeaveRequest>) {
    return this.http.post(`${this.apiUrl}/apply`, leave);
  }
}
