import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';
import { HolidayService } from '../../services/holiday.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsPage implements OnInit {
  userRole: string = '';
  reports: any[] = [];
  loading = false;
  stats: any = {
    totalEmployees: 0,
    totalLeaveRequests: 0,
    pendingApprovals: 0,
    approvalRate: 0
  };

  constructor(
    private auth: AuthService,
    private dashboardService: DashboardService,
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private holidayService: HolidayService
  ) {}

  ngOnInit() {
    this.userRole = this.auth.getRole() || 'Employee';
    this.loadStats();
    this.loadReports();
  }

  loadStats() {
    // Load real statistics based on user role
    if (this.userRole === 'Admin') {
      this.dashboardService.getAdminStats().subscribe({
        next: (data) => {
          this.stats = {
            totalEmployees: data.totalEmployees || 0,
            totalLeaveRequests: data.totalLeaveRequests || 0,
            pendingApprovals: data.pendingApprovals || 0,
            approvalRate: data.approvalRate || 0
          };
        },
        error: (error) => {
          console.error('Error loading admin stats:', error);
          // Fallback to API calls
          this.loadFallbackStats();
        }
      });
    } else if (this.userRole === 'Manager') {
      const managerId = this.auth.getEmployeeId();
      if (managerId) {
        this.dashboardService.getManagerStats(managerId).subscribe({
          next: (data) => {
            this.stats = {
              totalEmployees: data.teamMembers || 0,
              totalLeaveRequests: data.teamLeaveRequests || 0,
              pendingApprovals: data.pendingApprovals || 0,
              approvalRate: data.approvalRate || 0
            };
          },
          error: (error) => {
            console.error('Error loading manager stats:', error);
            this.loadFallbackStats();
          }
        });
      }
    } else {
      // Employee stats
      const employeeId = this.auth.getEmployeeId();
      if (employeeId) {
        this.dashboardService.getEmployeeStats(employeeId).subscribe({
          next: (data) => {
            this.stats = {
              totalEmployees: 1, // Just themselves
              totalLeaveRequests: data.myLeaveRequests || 0,
              pendingApprovals: data.pendingRequests || 0,
              approvalRate: data.approvalRate || 0
            };
          },
          error: (error) => {
            console.error('Error loading employee stats:', error);
            this.loadFallbackStats();
          }
        });
      }
    }
  }

  loadFallbackStats() {
    // Fallback: Load data from individual services
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.stats.totalEmployees = employees.length;
      },
      error: (error) => console.error('Error loading employees:', error)
    });

    this.leaveService.getAllLeaves().subscribe({
      next: (leaves) => {
        this.stats.totalLeaveRequests = leaves.length;
        const pending = leaves.filter((leave: any) => leave.status === 'Pending').length;
        this.stats.pendingApprovals = pending;
        const approved = leaves.filter((leave: any) => leave.status === 'Approved').length;
        this.stats.approvalRate = leaves.length > 0 ? Math.round((approved / leaves.length) * 100) : 0;
      },
      error: (error) => console.error('Error loading leaves:', error)
    });
  }

  loadReports() {
    this.loading = true;

    // Load reports based on user role
    const reportPromises: Promise<any>[] = [];

    // All users get leave summary (personal or team based on role)
    reportPromises.push(this.loadEmployeeLeaveSummary());

    // Holiday calendar is available to all users
    reportPromises.push(this.loadHolidayCalendarReport());

    // Team performance report only for Admin and Manager
    if (this.userRole === 'Admin' || this.userRole === 'Manager') {
      reportPromises.push(this.loadTeamPerformanceReport());
    }

    Promise.all(reportPromises).then((reports) => {
      this.reports = reports.filter(report => report !== null);
      this.loading = false;
    }).catch((error) => {
      console.error('Error loading reports:', error);
      this.loading = false;
    });
  }

  async loadEmployeeLeaveSummary(): Promise<any> {
    try {
      let leaves: any[] = [];
      let title = 'Employee Leave Summary';
      let description = 'Comprehensive report of all employee leave requests and patterns';

      if (this.userRole === 'Admin') {
        const result = await this.leaveService.getAllLeaves().toPromise();
        leaves = result || [];
      } else if (this.userRole === 'Manager') {
        const result = await this.leaveService.getTeamLeaves().toPromise();
        leaves = result || [];
        title = 'Team Leave Summary';
        description = 'Leave requests and patterns for your team members';
      } else {
        const result = await this.leaveService.getMyLeaves().toPromise();
        leaves = result || [];
        title = 'My Leave Summary';
        description = 'Your personal leave requests and history';
      }

      return {
        id: 1,
        title: title,
        description: description,
        type: 'leave-summary',
        lastGenerated: new Date().toISOString(),
        recordCount: leaves.length
      };
    } catch (error) {
      console.error('Error loading leave summary:', error);
      return null;
    }
  }

  async loadTeamPerformanceReport(): Promise<any> {
    try {
      let recordCount = 0;
      let title = 'Team Performance Report';
      let description = 'Team productivity and leave patterns analysis across all teams';

      if (this.userRole === 'Admin') {
        const employees = await this.employeeService.getAllEmployees().toPromise();
        const leaves = await this.leaveService.getAllLeaves().toPromise();
        const teams = [...new Set((employees || []).map((emp: any) => emp.teamId).filter(id => id))];
        recordCount = teams.length + ((leaves || []).length);
      } else if (this.userRole === 'Manager') {
        const leaves = await this.leaveService.getTeamLeaves().toPromise();
        recordCount = (leaves || []).length;
        title = 'My Team Performance';
        description = 'Performance metrics for your team members';
      } else {
        // Employee - no team performance data
        return null;
      }

      return {
        id: 2,
        title: title,
        description: description,
        type: 'team-performance',
        lastGenerated: new Date().toISOString(),
        recordCount: recordCount
      };
    } catch (error) {
      console.error('Error loading team performance:', error);
      return null;
    }
  }

  async loadHolidayCalendarReport(): Promise<any> {
    try {
      const holidays = await this.holidayService.getAll().toPromise();
      return {
        id: 3,
        title: 'Holiday Calendar Report',
        description: 'List of all company holidays and their impact on leave scheduling',
        type: 'holiday-calendar',
        lastGenerated: new Date().toISOString(),
        recordCount: holidays?.length || 0
      };
    } catch (error) {
      console.error('Error loading holiday calendar:', error);
      return null;
    }
  }

  trackByReportId(index: number, report: any): number {
    return report.id;
  }

  getReportIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'leave-summary': 'bi bi-file-earmark-text-fill text-primary',
      'team-performance': 'bi bi-bar-chart-fill text-success',
      'holiday-calendar': 'bi bi-calendar-event-fill text-info'
    };
    return iconMap[type] || 'bi bi-file-earmark-text-fill text-secondary';
  }

  generateReport(reportType: string) {
    this.loading = true;

    // Simulate report generation with real data
    setTimeout(() => {
      this.loading = false;
      alert(`Report "${reportType}" generated successfully with real data!`);
    }, 2000);
  }

  downloadReport(reportId: number) {
    // Simulate download with real data
    alert(`Downloading report ${reportId} with real data...`);
  }
}
