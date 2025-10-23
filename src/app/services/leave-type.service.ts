import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveType, CreateLeaveTypeRequest, UpdateLeaveTypeRequest } from '../models/leave-type.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveTypeService {
  private apiUrl = 'https://localhost:7215/api/LeaveType'; // Adjust based on your backend URL

  constructor(private http: HttpClient) { }

  getAllLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(this.apiUrl);
  }

  getActiveLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}/active`);
  }

  getLeaveTypeById(id: number): Observable<LeaveType> {
    return this.http.get<LeaveType>(`${this.apiUrl}/${id}`);
  }

  createLeaveType(leaveType: CreateLeaveTypeRequest): Observable<LeaveType> {
    return this.http.post<LeaveType>(this.apiUrl, leaveType);
  }

  updateLeaveType(id: number, leaveType: UpdateLeaveTypeRequest): Observable<LeaveType> {
    return this.http.put<LeaveType>(`${this.apiUrl}/${id}`, leaveType);
  }

  deleteLeaveType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleLeaveTypeStatus(id: number): Observable<LeaveType> {
    return this.http.patch<LeaveType>(`${this.apiUrl}/${id}/toggle-status`, {});
  }
}
