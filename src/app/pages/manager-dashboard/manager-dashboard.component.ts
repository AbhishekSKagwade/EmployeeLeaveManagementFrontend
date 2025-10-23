import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { HolidayService } from '../../services/holiday.service';
import { DashboardService } from '../../services/dashboard.service';
import { LeaveRequest } from '../../models/leave.model';
import { Holiday } from '../../models/holiday.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FullCalendarModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardPage implements OnInit, OnDestroy {
  teamMembers: any[] = [];
  teamLeaves: LeaveRequest[] = [];
  pendingLeaves = 0;
  approvedLeaves = 0;
  rejectedLeaves = 0;
  employeeId!: number;
  userName: string | null = null;
  notifications: any[] = [];
  recentLeaveRequests: LeaveRequest[] = [];
  teamStats: any = {};

  // Calendar data
  holidays: Holiday[] = [];
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
    private http: HttpClient,
    private auth: AuthService,
    private leaveService: LeaveService,
    private holidayService: HolidayService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.employeeId = this.auth.getEmployeeId();
    this.userName = this.auth.getName();
    this.loadDashboardData();
    this.loadHolidays();
  }

  loadDashboardData() {
    this.fetchTeamData();
    this.fetchTeamLeaves();
    this.fetchTeamStats();
    this.generateNotifications();
  }

  fetchTeamData() {
    this.http.get<any[]>(`/api/Employee/team/${this.employeeId}`).subscribe({
      next: (res) => {
        this.teamMembers = res.map(member => ({
          ...member,
          fullName: `${member.firstName} ${member.lastName}`,
          status: 'Active' // Assuming all are active
        }));
      },
      error: (err) => {
        console.error('Error fetching team data:', err);
        this.teamMembers = [];
      }
    });
  }

  fetchTeamLeaves() {
    console.log('Fetching team leaves for manager ID:', this.employeeId);
    this.leaveService.getTeamLeaves().subscribe({
      next: (leaves: LeaveRequest[]) => {
        console.log('Raw team leaves response:', leaves);
        this.teamLeaves = leaves.map(l => ({
          ...l,
          startDate: new Date(l.startDate),
          endDate: new Date(l.endDate),
          leaveType: (l as any).leaveType?.name || 'Unknown Leave',
          employeeName: (l as any).employee ? `${(l as any).employee.firstName} ${(l as any).employee.lastName}` : 'Unknown'
        }));

        console.log('Processed team leaves:', this.teamLeaves);

        // Calculate leave statistics
        this.pendingLeaves = this.teamLeaves.filter(l => l.status === 'Pending').length;
        this.approvedLeaves = this.teamLeaves.filter(l => l.status === 'Approved').length;
        this.rejectedLeaves = this.teamLeaves.filter(l => l.status === 'Rejected').length;

        console.log('Leave statistics - Pending:', this.pendingLeaves, 'Approved:', this.approvedLeaves, 'Rejected:', this.rejectedLeaves);

        // Get recent leave requests (last 5)
        this.recentLeaveRequests = this.teamLeaves
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);

        console.log('Recent leave requests:', this.recentLeaveRequests);

        // Update calendar events
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Error fetching team leaves:', err);
        this.teamLeaves = [];
        this.recentLeaveRequests = [];
      }
    });
  }

  fetchTeamStats() {
    const managerId = this.auth.getEmployeeId();
    if (managerId) {
      this.dashboardService.getManagerStats(managerId).subscribe({
        next: (stats) => {
          this.teamStats = stats;
        },
        error: (err) => {
          console.error('Error fetching team stats:', err);
          this.teamStats = {};
        }
      });
    }
  }

  loadHolidays() {
    this.holidayService.getAll().subscribe({
      next: (holidays: Holiday[]) => {
        this.holidays = holidays;
        this.updateCalendarEvents();
      },
      error: (err) => {
        console.error('Error fetching holidays:', err);
        this.holidays = [];
      }
    });
  }

  updateCalendarEvents() {
    const events: any[] = [];

    // Add team leave events
    this.teamLeaves.forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < days; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + i);

        events.push({
          title: `${leave.employeeName} - ${leave.leaveType}`,
          start: eventDate.toISOString().split('T')[0],
          backgroundColor: this.getLeaveEventColor(leave.status),
          borderColor: this.getLeaveEventColor(leave.status),
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

  generateNotifications() {
    this.notifications = [];

    // Notifications for pending approvals
    const pendingApprovals = this.teamLeaves.filter(leave => leave.status === 'Pending');
    pendingApprovals.forEach((leave, index) => {
      this.notifications.push({
        id: index + 1,
        message: `${leave.employeeName} has requested ${leave.leaveType} leave`,
        type: 'warning',
        date: leave.startDate,
        action: 'approve',
        leaveId: leave.leaveRequestId
      });
    });

    // Sort notifications by date (most recent first)
    this.notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getLeaveEventColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return '#28a745';
      case 'pending': return '#ffc107';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-danger';
      case 'manager': return 'bg-warning text-dark';
      case 'employee': return 'bg-info';
      default: return 'bg-secondary';
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

  quickApproveLeave(leaveId: number) {
    this.leaveService.approveLeave(leaveId).subscribe({
      next: () => {
        this.loadDashboardData(); // Refresh data
      },
      error: (err) => {
        console.error('Error approving leave:', err);
      }
    });
  }

  quickRejectLeave(leaveId: number) {
    this.leaveService.rejectLeave(leaveId).subscribe({
      next: () => {
        this.loadDashboardData(); // Refresh data
      },
      error: (err) => {
        console.error('Error rejecting leave:', err);
      }
    });
  }

  getLeaveDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  ngOnDestroy(): void {
    // Clean up calendar instance
    this.calendarOptions = null;
  }
}
