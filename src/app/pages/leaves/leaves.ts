import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveService } from '../../services/leave.service';

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

  constructor(private leaveService: LeaveService) {}

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves() {
    this.leaveService.getAllLeaves().subscribe({
      next: (data) => {
        this.leaves = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading leaves:', err);
        this.loading = false;
      }
    });
  }

  approveLeave(id: number) {
    this.leaveService.updateLeaveStatus(id, 'Approved').subscribe(() => this.loadLeaves());
  }

  rejectLeave(id: number) {
    this.leaveService.updateLeaveStatus(id, 'Rejected').subscribe(() => this.loadLeaves());
  }
}
