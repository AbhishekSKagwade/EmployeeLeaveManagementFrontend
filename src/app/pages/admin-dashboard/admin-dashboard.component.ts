import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService} from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { HttpClientModule } from '@angular/common/http';
import { Employee } from '../../models/employee.model';
import { LeaveRequest } from '../../models/leave.model';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardPage implements OnInit {
  totalEmployees = 0;
  pendingLeaves = 0;
  employees: Employee[] = [];
  leaves: LeaveRequest[] = [];

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.fetchEmployees();
    this.fetchLeaves();
  }

  fetchEmployees() {
    this.employeeService.getAllEmployees().subscribe((res: any) => {
      this.totalEmployees = res.length;
    });
  }

  fetchLeaves() {
    this.leaveService.getAllLeaves().subscribe((res: LeaveRequest[]) => {
      this.leaves = res;
      this.pendingLeaves = res.filter((l: LeaveRequest) => l.status === 'Pending').length;
    });
  }
}
