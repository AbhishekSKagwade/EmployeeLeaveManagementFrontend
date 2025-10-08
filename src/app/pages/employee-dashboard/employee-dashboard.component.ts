import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService} from '../../services/leave.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardPage implements OnInit {
  myLeaves: LeaveRequest[] = [];
  pendingLeaves = 0;
  employeeId!: number;

  constructor(private http: HttpClient, private auth: AuthService, private leaveService: LeaveService) {}

  ngOnInit() {
    this.employeeId = this.auth.getEmployeeId();
    this.fetchMyLeaves();
  }

  fetchMyLeaves() {
    this.leaveService.getMyLeaves(this.employeeId).subscribe((leaves: LeaveRequest[]) => {
      this.myLeaves = leaves;
      this.pendingLeaves = leaves.filter((l: LeaveRequest) => l.status === 'Pending').length;
    });
  }
}
