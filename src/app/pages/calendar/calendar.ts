import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { HolidayService } from '../../services/holiday.service';
import { Holiday } from '../../models/holiday.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class CalendarPage implements OnInit {
  holidays: Holiday[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    eventDisplay: 'block',
    eventColor: '#dc3545',
    eventTextColor: '#ffffff',
    height: 'auto',
    dayMaxEvents: true,
    moreLinkClick: 'popover'
  };

  constructor(
    private holidayService: HolidayService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHolidays();
  }

  loadHolidays(): void {
    this.holidayService.getAll().subscribe({
      next: (holidays) => {
        this.holidays = holidays;
        this.updateCalendarEvents();
      },
      error: (error) => {
        console.error('Error loading holidays:', error);
      }
    });
  }

  updateCalendarEvents(): void {
    const events = this.holidays.map(holiday => ({
      title: holiday.title,
      start: holiday.startDate,
      end: new Date(new Date(holiday.endDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Include end date
      backgroundColor: '#dc3545',
      borderColor: '#dc3545',
      textColor: '#ffffff',
      extendedProps: {
        description: holiday.description,
        holidayId: holiday.holidayId
      }
    }));

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  getDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }
}
