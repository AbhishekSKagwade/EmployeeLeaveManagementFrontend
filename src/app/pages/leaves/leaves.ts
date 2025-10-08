import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { LeaveService} from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { NgIf, NgFor } from '@angular/common';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SidebarComponent, NgIf, NgFor],
  templateUrl: './leaves.html',
  styleUrls: ['./leaves.css']
})
export class LeavesPage {
  leaves: LeaveRequest[] = [];
  newLeave: Partial<LeaveRequest> = {};
  error = '';
  role = '';
  employeeId = 0;

  constructor(private leavesService: LeaveService, private auth: AuthService) {
    this.role = this.auth.getRole() ?? '';
    this.employeeId = this.auth.getEmployeeId();
    this.loadLeaves();
  }

  loadLeaves() {
    if (this.role === 'Admin') {
      this.leavesService.getAllLeaves().subscribe({
        next: data => this.leaves = data,
        error: err => this.error = err.message
      });
    } else if (this.role === 'Manager') {
      this.leavesService.getTeamLeaves(this.employeeId).subscribe({
        next: data => this.leaves = data,
        error: err => this.error = err.message
      });
    } else {
      this.leavesService.getMyLeaves(this.employeeId).subscribe({
        next: data => this.leaves = data,
        error: err => this.error = err.message
      });
    }
  }

  applyLeave() {
    if (!this.newLeave.leaveType || !this.newLeave.startDate || !this.newLeave.endDate) {
      this.error = 'All fields are required';
      return;
    }

    const leave: LeaveRequest = {
      leaveRequestId: 0,
      employeeId: this.employeeId,
      employeeName: '',
      leaveType: this.newLeave.leaveType!,
      startDate: this.newLeave.startDate!,
      endDate: this.newLeave.endDate!,
      reason: this.newLeave.reason || '',
      status: 'Pending'
    };

    this.leavesService.applyLeave(leave).subscribe({
      next: (res) => {
        this.loadLeaves();
        this.newLeave = {};
      },
      error: (err: any) => this.error = err.message
    });
  }

  approveLeave(leave: LeaveRequest) {
    if (!leave.leaveRequestId) return;
    this.leavesService.updateLeaveStatus(leave.leaveRequestId, 'Approved').subscribe({
      next: () => this.loadLeaves(),
      error: err => this.error = err.message
    });
  }

  rejectLeave(leave: LeaveRequest) {
    if (!leave.leaveRequestId) return;
    this.leavesService.updateLeaveStatus(leave.leaveRequestId, 'Rejected').subscribe({
      next: () => this.loadLeaves(),
      error: err => this.error = err.message
    });
  }

  deleteLeave(leave: LeaveRequest) {
    if (!leave.leaveRequestId) return;
    this.leavesService.deleteLeave(leave.leaveRequestId).subscribe({
      next: () => this.leaves = this.leaves.filter(l => l.leaveRequestId !== leave.leaveRequestId),
      error: err => this.error = err.message
    });
  }
}
