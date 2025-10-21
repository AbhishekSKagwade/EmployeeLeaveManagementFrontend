import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardPage implements OnInit {
  myLeaves: LeaveRequest[] = [];
  pendingLeaves = 0;
  employeeId!: number;
  userName: string | null = null;

  constructor(private auth: AuthService, private leaveService: LeaveService) {}

  ngOnInit() {
    this.employeeId = this.auth.getEmployeeId();
    this.userName = this.auth.getName();
    this.getMyLeaves();
  }

  getMyLeaves() {
    this.leaveService.getMyLeaves(this.employeeId).subscribe((leaves: LeaveRequest[]) => {
      // Map employeeName from nested employee object if backend sends it
      this.myLeaves = leaves.map(l => ({
        ...l,
        employeeName: (l as any).employee ? `${(l as any).employee.firstName} ${(l as any).employee.lastName}` : 'You'
      }));
      this.pendingLeaves = this.myLeaves.filter(l => l.status === 'Pending').length;
    });
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
}
