import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardPage {
  userRole: 'Admin' | 'Manager' | 'Employee' = 'Employee'; // set dynamically after login

  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
