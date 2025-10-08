import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Holiday } from '../models/holiday.model';

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private baseUrl = 'http://localhost:5081/api/Holiday';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Holiday[]> {
    return this.http.get<Holiday[]>(this.baseUrl);
  }

  createHoliday(holiday: Holiday): Observable<Holiday> {
    return this.http.post<Holiday>(this.baseUrl, holiday);
  }

  deleteHoliday(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
