import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = 'https://localhost:7215/api/Employee';

  constructor(private http: HttpClient) {}

  // ✅ Get all employees
  getAllEmployees(includeInactive: boolean = false): Observable<any[]> {
    const params = includeInactive ? { includeInactive: 'true' } : {};
    return this.http.get<any[]>(this.apiUrl, { params: params as any });
  }

  // ✅ Get employee by ID
  getEmployeeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Add a new employee
  addEmployee(employee: any): Observable<any> {
    const { id, ...payload } = employee; // Exclude id from payload
    return this.http.post<any>(this.apiUrl, payload);
  }

  // ✅ Update existing employee
  updateEmployee(id: number, employee: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }

  // ✅ Delete employee by ID
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
