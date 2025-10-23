import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hireDate: string;
  role: {
    roleId: number;
    name: string;
  };
  team: {
    teamId: number;
    name: string;
  };
  isActive: boolean;
}

@Component({
  selector: 'app-ProfilePage',
  templateUrl: './ProfilePage.component.html',
  styleUrls: ['./ProfilePage.component.css'],
  imports: [CommonModule]
})
export class ProfilePageComponent implements OnInit {
  employee: Employee | null = null;
  loading = true;
  error = '';

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const employeeId = this.authService.getEmployeeId();
    if (employeeId) {
      this.employeeService.getEmployeeById(employeeId).subscribe({
        next: (data) => {
          this.employee = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load profile';
          this.loading = false;
          console.error('Error loading profile:', err);
        }
      });
    } else {
      this.error = 'Employee ID not found';
      this.loading = false;
    }
  }

  getFullName(): string {
    return this.employee ? `${this.employee.firstName} ${this.employee.lastName}` : '';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
