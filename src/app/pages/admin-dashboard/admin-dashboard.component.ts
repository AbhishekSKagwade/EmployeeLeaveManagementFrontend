import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { HttpClientModule } from '@angular/common/http';
import { Employee } from '../../models/employee.model';
import { LeaveRequest } from '../../models/leave.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardPage implements OnInit {
  totalEmployees = 0;
  pendingLeaves = 0;
  employees: Employee[] = [];
  leaves: LeaveRequest[] = [];

  // For Add Employee form
  showAddForm = false;
  newEmployee: Employee = {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    roleId: 3, // Default to Employee role (assuming 1=Admin, 2=Manager, 3=Employee)
    isActive: true
  };

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.fetchEmployees();
    this.fetchLeaves();
  }

  // Fetch all employees
  fetchEmployees() {
    this.employeeService.getAllEmployees(true).subscribe({
      next: (res: Employee[]) => {
        this.employees = res;
        this.totalEmployees = res.filter(e => e.isActive).length;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  // Fetch all leaves
  fetchLeaves() {
    this.leaveService.getAllLeaves().subscribe({
      next: (res: LeaveRequest[]) => {
        this.leaves = res;
        this.pendingLeaves = res.filter(l => l.status === 'Pending').length;
      },
      error: (err) => {
        console.error('Error fetching leaves:', err);
      }
    });
  }

  // Add Employee to database
  addEmployee() {
    if (!this.newEmployee.firstname || !this.newEmployee.lastname || !this.newEmployee.email || !this.newEmployee.password || !this.newEmployee.roleId) {
      alert('Please fill all required fields');
      return;
    }

    this.employeeService.addEmployee(this.newEmployee).subscribe({
      next: () => {
        alert('Employee added successfully!');
        this.fetchEmployees();
        this.resetForm();
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Error adding employee:', err);
        let errorMessage = 'Failed to add employee.';
        if (err.error && err.error.errors) {
          // Handle validation errors from backend
          const errors = Object.values(err.error.errors).flat();
          errorMessage += '\n' + errors.join('\n');
        } else if (err.error && err.error.message) {
          errorMessage = err.error.message;
        }
        alert(errorMessage);
      }
    });
  }

  // Toggle Add Employee form
  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  // Reset Add Employee form
  resetForm() {
    this.newEmployee = {
      id: 0,
      firstname: '',
      lastname: '',
      email: '',
      password: '',
      roleId: 3, // Default to Employee role
      isActive: true
    };
  }

  // Role badge styling logic
  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-danger';
      case 'manager': return 'bg-warning text-dark';
      case 'employee': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  // Deactivate employee
  deactivateEmployee(id: number) {
    if (confirm('Are you sure you want to deactivate this employee?')) {
      this.employeeService.updateEmployee(id, { isActive: false }).subscribe({
        next: () => {
          alert('Employee deactivated successfully!');
          this.fetchEmployees();
        },
        error: (err) => {
          console.error('Error deactivating employee:', err);
          alert('Failed to deactivate employee.');
        }
      });
    }
  }

  // Activate employee
  activateEmployee(id: number) {
    if (confirm('Are you sure you want to activate this employee?')) {
      this.employeeService.updateEmployee(id, { isActive: true }).subscribe({
        next: () => {
          alert('Employee activated successfully!');
          this.fetchEmployees();
        },
        error: (err) => {
          console.error('Error activating employee:', err);
          alert('Failed to activate employee.');
        }
      });
    }
  }
}
