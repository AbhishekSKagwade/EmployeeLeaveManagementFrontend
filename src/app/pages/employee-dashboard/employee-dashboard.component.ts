import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { LeaveTypeService } from '../../services/leave-type.service';
import { DashboardService } from '../../services/dashboard.service';
import { HolidayService } from '../../services/holiday.service';
import { LeaveRequest } from '../../models/leave.model';
import { LeaveType } from '../../models/leave-type.model';
import { Holiday } from '../../models/holiday.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FullCalendarModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardPage implements OnInit, OnDestroy {
  myLeaves: LeaveRequest[] = [];
  teamLeaves: LeaveRequest[] = [];
  pendingLeaves = 0;
  employeeId!: number;
  userName: string | null = null;
  leaveBalances: any[] = [];
  leaveTypes: LeaveType[] = [];
  notifications: any[] = [];

  // Quick leave request form
  showQuickForm = false;
  quickLeaveRequest = {
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  };

  // Calendar data
  calendarLeaves: any[] = [];
  holidays: Holiday[] = [];
  currentMonth: Date = new Date();
  calendarOptions: CalendarOptions | null = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    events: [],
    height: 'auto',
    aspectRatio: 1.35,
    dayMaxEvents: true,
    moreLinkClick: 'popover'
  };

  constructor(
    private auth: AuthService,
    private leaveService: LeaveService,
    private leaveTypeService: LeaveTypeService,
    private dashboardService: DashboardService,
    private holidayService: HolidayService
  ) {}

  ngOnInit() {
    this.employeeId = this.auth.getEmployeeId();
    this.userName = this.auth.getName();
    this.loadDashboardData();
    this.loadHolidays(); // Notifications will be generated after holidays are loaded
  }

  loadDashboardData() {
    this.getMyLeaves();
    this.getTeamLeaves();
    this.getLeaveBalances();
    this.getLeaveTypes();
    // Notifications will be called after holidays are loaded
    // Calendar data is now loaded in getMyLeaves after data is fetched
  }

  getMyLeaves() {
    this.leaveService.getMyLeaves().subscribe((leaves: LeaveRequest[]) => {
      this.myLeaves = leaves.map(l => ({
        ...l,
        startDate: new Date(l.startDate),
        endDate: new Date(l.endDate),
        leaveType: (l as any).leaveType?.name || 'Unknown Leave',
        employeeName: (l as any).employee ? `${(l as any).employee.firstName} ${(l as any).employee.lastName}` : 'You'
      }));
      this.pendingLeaves = this.myLeaves.filter(l => l.status === 'Pending').length;
      // Update calendar data after loading leaves
      this.updateCalendarEvents();
    });
  }

  getTeamLeaves() {
    this.leaveService.getTeamLeaves().subscribe((leaves: LeaveRequest[]) => {
      this.teamLeaves = leaves.map(l => ({
        ...l,
        startDate: new Date(l.startDate),
        endDate: new Date(l.endDate),
        leaveType: (l as any).leaveType?.name || 'Unknown Leave',
        employeeName: (l as any).employee ? `${(l as any).employee.firstName} ${(l as any).employee.lastName}` : 'Unknown'
      }));
      // Update calendar data after loading team leaves
      this.updateCalendarEvents();
    });
  }

  getLeaveBalances() {
    this.dashboardService.getEmployeeStats(this.employeeId).subscribe({
      next: (stats: any) => {
        // Assuming the API returns leave balances in the expected format
        this.leaveBalances = stats.leaveBalances || [];
      },
      error: (err) => {
        console.error('Error fetching leave balances:', err);
        // Fallback to empty array if API fails
        this.leaveBalances = [];
      }
    });
  }

  getLeaveTypes() {
    this.leaveTypeService.getActiveLeaveTypes().subscribe({
      next: (types: LeaveType[]) => {
        this.leaveTypes = types;
        console.log('Active leave types loaded:', types); // Debug log
      },
      error: (err) => {
        console.error('Error fetching active leave types:', err);
        // Fallback to empty array if API fails
        this.leaveTypes = [];
      }
    });
  }

  getNotifications() {
    // Generate live notifications based on actual data
    this.notifications = [];

    // Notifications for leave requests
    this.myLeaves.forEach((leave, index) => {
      let message = '';
      let type = '';

      switch (leave.status.toLowerCase()) {
        case 'pending':
          message = `Your ${leave.leaveType} leave request is pending approval`;
          type = 'warning';
          break;
        case 'approved':
          message = `Your ${leave.leaveType} leave request has been approved`;
          type = 'success';
          break;
        case 'rejected':
          message = `Your ${leave.leaveType} leave request has been rejected`;
          type = 'danger';
          break;
      }

      if (message) {
        this.notifications.push({
          id: index + 1,
          message: message,
          type: type,
          date: leave.startDate // Use the leave start date as the notification date
        });
      }
    });

    // Notifications for new holidays (recent ones)
    const recentHolidays = this.holidays.filter(holiday => {
      const holidayDate = new Date(holiday.startDate);
      const today = new Date();
      const diffTime = today.getTime() - holidayDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 30; // Show holidays from today and up to 30 days in the future
    });

    recentHolidays.forEach((holiday, index) => {
      this.notifications.push({
        id: this.notifications.length + index + 1,
        message: `New holiday added: ${holiday.title}`,
        type: 'info',
        date: holiday.startDate // Use the holiday start date for proper chronological ordering
      });
    });

    // Sort notifications by date (most recent first)
    this.notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  loadCalendarData() {
    // Use actual leave data to populate calendar
    this.calendarLeaves = this.myLeaves.map(leave => ({
      date: new Date(leave.startDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      type: leave.leaveType,
      status: leave.status
    }));

    // Update FullCalendar events
    this.updateCalendarEvents();
  }

  loadHolidays() {
    this.holidayService.getAll().subscribe({
      next: (holidays: Holiday[]) => {
        this.holidays = holidays;
        this.updateCalendarEvents();
        // Generate notifications after holidays are loaded
        this.getNotifications();
      },
      error: (err: any) => {
        console.error('Error fetching holidays:', err);
        this.holidays = [];
        // Still generate notifications even if holidays fail to load
        this.getNotifications();
      }
    });
  }

  updateCalendarEvents() {
    const events: any[] = [];

    // Add my leave events (own leaves)
    this.myLeaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < days; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + i);

        events.push({
          title: `${leave.leaveType} Leave (${leave.status})`,
          start: eventDate.toISOString().split('T')[0],
          backgroundColor: this.getLeaveEventColor(leave.status),
          borderColor: this.getLeaveEventColor(leave.status),
          textColor: '#ffffff',
          extendedProps: {
            type: 'my-leave',
            leave: leave
          }
        });
      }
    });

    // Add team leave events (teammates' leaves)
    this.teamLeaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < days; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + i);

        events.push({
          title: `${leave.employeeName} - ${leave.leaveType} Leave (${leave.status})`,
          start: eventDate.toISOString().split('T')[0],
          backgroundColor: this.getTeamLeaveEventColor(leave.status),
          borderColor: this.getTeamLeaveEventColor(leave.status),
          textColor: '#ffffff',
          extendedProps: {
            type: 'team-leave',
            leave: leave
          }
        });
      }
    });

    // Add holiday events
    this.holidays.forEach(holiday => {
      const startDate = new Date(holiday.startDate);
      const endDate = new Date(holiday.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < days; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + i);

        events.push({
          title: holiday.title,
          start: eventDate.toISOString().split('T')[0],
          backgroundColor: '#dc3545',
          borderColor: '#dc3545',
          textColor: '#ffffff',
          extendedProps: {
            type: 'holiday',
            holiday: holiday
          }
        });
      }
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events
    };
  }

  getLeaveEventColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getTeamLeaveEventColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '#17a2b8'; // Teal for team approved leaves
      case 'pending': return '#6f42c1'; // Purple for team pending leaves
      case 'rejected': return '#e83e8c'; // Pink for team rejected leaves
      default: return '#fd7e14'; // Orange for team default
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bi-check-circle-fill';
      case 'pending': return 'bi-clock';
      case 'rejected': return 'bi-x-circle-fill';
      default: return 'bi-question-circle';
    }
  }

  // Quick leave request methods
  openQuickForm() {
    this.showQuickForm = true;
    this.quickLeaveRequest = {
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: ''
    };
  }

  closeQuickForm() {
    this.showQuickForm = false;
  }

  submitQuickLeave() {
    if (this.quickLeaveRequest.leaveTypeId && this.quickLeaveRequest.startDate && this.quickLeaveRequest.endDate) {
      const startDate = new Date(this.quickLeaveRequest.startDate);
      const endDate = new Date(this.quickLeaveRequest.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const leaveRequest = {
        leaveTypeId: parseInt(this.quickLeaveRequest.leaveTypeId),
        startDate: startDate,
        endDate: endDate,
        days: days,
        reason: this.quickLeaveRequest.reason
      };

      this.leaveService.addLeave(leaveRequest).subscribe({
        next: () => {
          this.closeQuickForm();
          this.loadDashboardData(); // Refresh data
        },
        error: (err) => {
          console.error('Error submitting leave request:', err);
          // Could add error handling UI here
        }
      });
    }
  }

  // Calendar methods
  getDaysInMonth(date: Date): number[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  hasLeaveOnDate(day: number): boolean {
    const dateStr = `${this.currentMonth.getFullYear()}-${(this.currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return this.calendarLeaves.some(leave => leave.date === dateStr);
  }

  getLeaveOnDate(day: number): any {
    const dateStr = `${this.currentMonth.getFullYear()}-${(this.currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return this.calendarLeaves.find(leave => leave.date === dateStr);
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  // Analytics methods
  getLeaveUsagePercentage(used: number, total: number): number {
    return total > 0 ? (used / total) * 100 : 0;
  }

  getLeaveUsageColor(percentage: number): string {
    if (percentage < 30) return '#28a745';
    if (percentage < 70) return '#ffc107';
    return '#dc3545';
  }

  // Notification methods
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'warning': return 'bi-exclamation-triangle-fill text-warning';
      case 'info': return 'bi-info-circle-fill text-info';
      default: return 'bi-bell-fill text-secondary';
    }
  }

  dismissNotification(id: number) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getLeaveBalanceDisplay(balance: any): string {
    // For leave types that don't have fixed limits (like Sick Leave, Comp Off, etc.)
    // only show the used/taken amount, not remaining/total
    const unlimitedTypes = ['Sick Leave', 'Comp Off', 'Maternity Leave', 'Loss of Pay'];

    if (unlimitedTypes.includes(balance.type)) {
      // Show only the used amount for unlimited leave types
      return (balance.used || balance.taken || 0).toString();
    } else {
      // Show remaining/total for limited leave types like Annual Leave
      return `${balance.remaining || 0}/${balance.total || 0}`;
    }
  }

  isToday(day: number): boolean {
    const today = new Date();
    return day === today.getDate() &&
           this.currentMonth.getMonth() === today.getMonth() &&
           this.currentMonth.getFullYear() === today.getFullYear();
  }

  ngOnDestroy(): void {
    // Clean up calendar instance to prevent memory leaks
    this.calendarOptions = null;
  }
}
