import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { DashboardService } from '../../services/dashboard.service';
import { HttpClientModule } from '@angular/common/http';
import { Employee } from '../../models/employee.model';
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
  employees: Employee[] = [];

  // Enhanced stats object
  stats = {
    totalEmployees: 0,
    activeEmployees: 0,
    totalLeaveRequests: 0,
    thisMonthRequests: 0,
    pendingApprovals: 0,
    urgentApprovals: 0,
    approvalRate: 0,
    avgProcessingTime: 0,
    leaveTypeBreakdown: [] as any[]
  };

  // Recent activities
  recentActivities: any[] = [];

  // Department stats
  departmentStats: any[] = [];

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
    private leaveService: LeaveService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  // Load all dashboard data
  loadDashboardData() {
    this.fetchEmployees();
    this.loadStats();
    this.loadRecentActivities();
    this.loadDepartmentStats();
  }

  // Refresh data
  refreshData() {
    this.loadDashboardData();
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

  // Load comprehensive stats
  loadStats() {
    // Try to get stats from dashboard service first
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = {
          totalEmployees: data.totalEmployees || 0,
          activeEmployees: data.activeEmployees || data.totalEmployees || 0,
          totalLeaveRequests: data.totalLeaveRequests || 0,
          thisMonthRequests: data.thisMonthRequests || 0,
          pendingApprovals: data.pendingApprovals || 0,
          urgentApprovals: data.urgentApprovals || 0,
          approvalRate: data.approvalRate || 0,
          avgProcessingTime: data.avgProcessingTime || 0,
          leaveTypeBreakdown: data.leaveTypeBreakdown || []
        };
      },
      error: (error) => {
        console.error('Error loading admin stats:', error);
        // Fallback to manual calculation
        this.loadFallbackStats();
      }
    });
  }

  // Fallback stats calculation
  loadFallbackStats() {
    // Load employees
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.stats.totalEmployees = employees.length;
        this.stats.activeEmployees = employees.filter(e => e.isActive).length;
      },
      error: (error) => console.error('Error loading employees for stats:', error)
    });

    // Load leave requests
    this.leaveService.getAllLeaves().subscribe({
      next: (leaves) => {
        this.stats.totalLeaveRequests = leaves.length;

        // Calculate this month's requests
        const now = new Date();
        const thisMonth = leaves.filter(leave => {
          const leaveDate = new Date(leave.startDate);
          return leaveDate.getMonth() === now.getMonth() && leaveDate.getFullYear() === now.getFullYear();
        }).length;
        this.stats.thisMonthRequests = thisMonth;

        // Pending approvals
        const pending = leaves.filter(leave => leave.status === 'Pending').length;
        this.stats.pendingApprovals = pending;

        // Urgent approvals (pending for more than 3 days)
        const urgent = leaves.filter(leave => {
          if (leave.status !== 'Pending') return false;
          const createdDate = new Date(leave.startDate);
          const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          return daysDiff > 3;
        }).length;
        this.stats.urgentApprovals = urgent;

        // Approval rate
        const approved = leaves.filter(leave => leave.status === 'Approved').length;
        this.stats.approvalRate = leaves.length > 0 ? Math.round((approved / leaves.length) * 100) : 0;

        // Leave type breakdown (simplified)
        const leaveTypes = ['Annual', 'Sick', 'Personal', 'Maternity', 'Other'];
        this.stats.leaveTypeBreakdown = leaveTypes.map(type => {
          const count = leaves.filter(leave => leave.leaveType === type).length;
          const percentage = leaves.length > 0 ? Math.round((count / leaves.length) * 100) : 0;
          return {
            name: type,
            count: count,
            percentage: percentage,
            color: this.getLeaveTypeColor(type)
          };
        }).filter(type => type.count > 0);
      },
      error: (error) => console.error('Error loading leaves for stats:', error)
    });
  }

  // Get color for leave type
  getLeaveTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'Annual': '#28a745',
      'Sick': '#dc3545',
      'Personal': '#ffc107',
      'Maternity': '#e83e8c',
      'Other': '#6c757d'
    };
    return colors[type] || '#6c757d';
  }

  // Load recent activities
  loadRecentActivities() {
    // Combine recent leave requests and employee activities
    this.leaveService.getAllLeaves().subscribe({
      next: (leaves) => {
        const activities = [];

        // Recent leave requests
        const recentLeaves = leaves
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);

        for (const leave of recentLeaves) {
          activities.push({
            description: `${leave.employeeName || 'Employee'} requested ${leave.leaveType} leave`,
            timestamp: leave.startDate,
            icon: 'bi bi-calendar-plus',
            color: '#17a2b8'
          });
        }

        // Recent approvals/rejections (simplified - using start date as timestamp)
        const recentActions = leaves
          .filter(leave => leave.status !== 'Pending')
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 3);

        for (const leave of recentActions) {
          const action = leave.status === 'Approved' ? 'approved' : 'rejected';
          activities.push({
            description: `${leave.leaveType} leave ${action} for ${leave.employeeName || 'Employee'}`,
            timestamp: leave.startDate,
            icon: leave.status === 'Approved' ? 'bi bi-check-circle' : 'bi bi-x-circle',
            color: leave.status === 'Approved' ? '#28a745' : '#dc3545'
          });
        }

        this.recentActivities = activities
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);
      },
      error: (error) => {
        console.error('Error loading recent activities:', error);
        this.recentActivities = [];
      }
    });
  }

  // Load department statistics
  loadDepartmentStats() {
    // This would ideally come from a departments API
    // For now, we'll simulate based on employee teams
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        // Group by team/department
        const deptMap = new Map();

        employees.forEach(emp => {
          const deptName = emp.team?.name || emp.department || 'Unassigned';
          if (!deptMap.has(deptName)) {
            deptMap.set(deptName, {
              name: deptName,
              manager: null,
              employeeCount: 0,
              activeLeaves: 0,
              monthlyLeaves: 0
            });
          }
          deptMap.get(deptName).employeeCount++;
        });

        // Load leave data to calculate active and monthly leaves
        this.leaveService.getAllLeaves().subscribe({
          next: (leaves) => {
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();

            leaves.forEach(leave => {
              // Since leave model doesn't have employee object, we'll use employeeId to find department
              // For now, we'll skip department-specific leave counting and just show employee counts
              // This can be enhanced when the API provides employee details with leaves
            });

            this.departmentStats = Array.from(deptMap.values());
          },
          error: (error) => {
            console.error('Error loading leave data for departments:', error);
            this.departmentStats = Array.from(deptMap.values());
          }
        });
      },
      error: (error) => {
        console.error('Error loading employees for departments:', error);
        this.departmentStats = [];
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
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
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
