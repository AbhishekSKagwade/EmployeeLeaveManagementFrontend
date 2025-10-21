import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardPage implements OnInit {
  userRole: string = '';
  employeeId: number = 0;
  stats: any = {};

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedData = localStorage.getItem('user');
    if (storedData) {
      const user = JSON.parse(storedData);
      this.userRole = user.role;
      this.employeeId = user.employeeId;
      this.loadDashboardData();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadDashboardData() {
    if (this.userRole === 'Admin') {
      this.dashboardService.getAdminStats().subscribe({
        next: (data) => (this.stats = data),
        error: (err) => console.error('Admin stats error:', err)
      });
    } else if (this.userRole === 'Manager') {
      this.dashboardService.getManagerStats(this.employeeId).subscribe({
        next: (data) => (this.stats = data),
        error: (err) => console.error('Manager stats error:', err)
      });
    } else if (this.userRole === 'Employee') {
      this.dashboardService.getEmployeeStats(this.employeeId).subscribe({
        next: (data) => (this.stats = data),
        error: (err) => console.error('Employee stats error:', err)
      });
    }
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
