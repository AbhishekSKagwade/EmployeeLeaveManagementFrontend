import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaves.html',
  styleUrls: ['./leaves.css']
})
export class LeavesPage implements OnInit {
  leaves: any[] = [];
  loading = true;
  role: string = '';

  constructor(private leaveService: LeaveService, private auth: AuthService) {}

  ngOnInit(): void {
    this.role = this.auth.getRole() || '';
    this.loadLeaves();
  }

  loadLeaves() {
    console.log('Loading leaves for role:', this.role);
    if (this.role === 'Admin') {
      this.leaveService.getAllLeaves().subscribe({
        next: (data) => {
          console.log('Admin leaves data:', data);
          this.leaves = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading leaves:', err);
          this.loading = false;
        }
      });
    } else if (this.role === 'Manager') {
      console.log('Loading team leaves for manager');
      this.leaveService.getTeamLeaves().subscribe({
        next: (data) => {
          console.log('Manager team leaves data:', data);
          this.leaves = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading leaves:', err);
          this.loading = false;
        }
      });
    } else {
      // Employee
      this.leaveService.getMyLeaves().subscribe({
        next: (data) => {
          console.log('Employee leaves data:', data);
          this.leaves = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading leaves:', err);
          this.loading = false;
        }
      });
    }
  }

  approveLeave(id: number) {
    this.leaveService.approveLeave(id).subscribe(() => this.loadLeaves());
  }

  rejectLeave(id: number) {
    this.leaveService.rejectLeave(id).subscribe(() => this.loadLeaves());
  }

  deleteLeave(id: number) {
    if (confirm('Are you sure you want to delete this leave request?')) {
      this.leaveService.deleteLeave(id).subscribe(() => this.loadLeaves());
    }
  }

  // Helper methods for the new UI
  getRoleBadgeClass(): string {
    switch (this.role.toLowerCase()) {
      case 'admin': return 'badge-admin';
      case 'manager': return 'badge-manager';
      case 'employee': return 'badge-employee';
      default: return 'badge-secondary';
    }
  }

  getPendingCount(): number {
    return this.leaves.filter(leave => leave.status === 'Pending').length;
  }

  trackByLeaveId(index: number, leave: any): number {
    return leave.leaveRequestId;
  }

  getEmployeeInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getLeaveDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved': return 'bi-check-circle-fill';
      case 'rejected': return 'bi-x-circle-fill';
      case 'pending': return 'bi-clock-fill';
      default: return 'bi-question-circle-fill';
    }
  }

  shouldShowActions(leave: any): boolean {
    return (this.role === 'Admin' || this.role === 'Manager') ||
           (this.role === 'Employee' && leave.status === 'Pending');
  }
}
