import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    name: string;
  };
  team: {
    name: string;
  };
}

interface TeamData {
  manager: Employee | null;
  members: Employee[];
  teamName: string;
}

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {
  teamData: TeamData = {
    manager: null,
    members: [],
    teamName: ''
  };
  loading = true;
  error = '';

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  ngOnInit() {
    this.loadMyTeam();
  }

  loadMyTeam() {
    const employeeId = this.auth.getEmployeeId();
    if (employeeId) {
      // First get the employee's team information
      this.http.get<Employee>(`/api/Employee/${employeeId}`).subscribe({
        next: (employee) => {
          this.teamData.teamName = employee.team.name;
          // Get team members (including manager)
          this.http.get<Employee[]>(`/api/Employee/team/${employeeId}`).subscribe({
            next: (teamMembers) => {
              // Find manager (employee with Manager role)
              this.teamData.manager = teamMembers.find(member =>
                member.role.name.toLowerCase() === 'manager'
              ) || null;

              // Filter out the current employee from members list
              this.teamData.members = teamMembers.filter(member =>
                member.employeeId !== employeeId
              );

              this.loading = false;
            },
            error: (err) => {
              console.error('Error loading team members:', err);
              this.error = 'Failed to load team members';
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error loading employee:', err);
          this.error = 'Failed to load team information';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Employee ID not found';
      this.loading = false;
    }
  }

  getFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin': return 'admin-badge';
      case 'manager': return 'manager-badge';
      case 'employee': return 'employee-badge';
      default: return 'bg-secondary';
    }
  }
}
