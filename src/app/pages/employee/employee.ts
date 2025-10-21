import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
export class EmployeesPage implements OnInit {
  employees: any[] = [];
  loading = true;
  showAddForm = false;
  showEditForm = false;
  editingEmployeeId: number | null = null;
  newEmployee: Employee = {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    roleId: 3, // Default to Employee role
    isActive: true
  };

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loading = false;
      }
    });
  }

  addEmployee() {
    if (!this.newEmployee.firstname || !this.newEmployee.lastname || !this.newEmployee.email || !this.newEmployee.password || !this.newEmployee.roleId) {
      alert('Please fill all required fields');
      return;
    }

    this.employeeService.addEmployee(this.newEmployee).subscribe({
      next: () => {
        alert('Employee added successfully!');
        this.loadEmployees();
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

  editEmployee(employee: any) {
    this.showEditForm = true;
    this.showAddForm = false;
    this.editingEmployeeId = employee.employeeId;
    this.newEmployee = {
      id: employee.employeeId,
      firstname: employee.firstName,
      lastname: employee.lastName,
      email: employee.email,
      password: '', // Not needed for edit
      roleId: employee.role?.roleId || employee.roleId,
      department: employee.department || '',
      teamId: employee.teamId || null,
      isActive: employee.isActive
    };
  }

  updateEmployee() {
    if (!this.newEmployee.firstname || !this.newEmployee.lastname || !this.newEmployee.email || !this.newEmployee.roleId) {
      alert('Please fill all required fields');
      return;
    }

    if (!this.editingEmployeeId) {
      alert('No employee selected for editing');
      return;
    }

    // Prepare update payload (include password only if provided)
    const updatePayload: any = {
      firstName: this.newEmployee.firstname,
      lastName: this.newEmployee.lastname,
      email: this.newEmployee.email,
      roleId: this.newEmployee.roleId,
      teamId: this.newEmployee.teamId,
      isActive: this.newEmployee.isActive
    };

    // Only include password if it's provided (not empty)
    if (this.newEmployee.password && this.newEmployee.password.trim() !== '') {
      updatePayload.password = this.newEmployee.password;
    }

    this.employeeService.updateEmployee(this.editingEmployeeId, updatePayload).subscribe({
      next: () => {
        alert('Employee updated successfully!');
        this.loadEmployees();
        this.closeForm();
      },
      error: (err) => {
        console.error('Error updating employee:', err);
        let errorMessage = 'Failed to update employee.';
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

  closeForm() {
    this.showAddForm = false;
    this.showEditForm = false;
    this.editingEmployeeId = null;
    this.resetForm();
  }

  deleteEmployee(id: number) {
    if (confirm('Are you sure you want to deactivate this employee? This will set their status to inactive.')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          alert('Employee deactivated successfully!');
          this.loadEmployees();
        },
        error: (err) => {
          console.error('Error deactivating employee:', err);
          alert('Failed to deactivate employee. Please try again.');
          this.loadEmployees(); // Reload to restore the employee in the list if deactivation failed
        }
      });
    }
  }
}
