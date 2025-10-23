import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar">
      <ul>
        <li>
          <a [routerLink]="getDashboardRoute()" routerLinkActive="active">Dashboard</a>
        </li>

        <li *ngIf="role === 'Admin'">
          <a routerLink="/employees" routerLinkActive="active">Employees</a>
        </li>

        <li *ngIf="role === 'Admin'">
          <a routerLink="/teams" routerLinkActive="active">Teams</a>
        </li>

        <li *ngIf="role === 'Manager'">
          <a routerLink="/my-team" routerLinkActive="active">My Team</a>
        </li>

        <li *ngIf="role === 'Admin'">
          <a routerLink="/holidays" routerLinkActive="active">Holidays</a>
        </li>

        <li *ngIf="role === 'Admin'">
          <a routerLink="/leave-types" routerLinkActive="active">Leave Types</a>
        </li>

        <li *ngIf="role !== 'Admin'">
          <a routerLink="/leaves" routerLinkActive="active">Leaves</a>
        </li>

        <li>
          <a routerLink="/calendar" routerLinkActive="active">Calendar</a>
        </li>

        <li>
          <a routerLink="/reports" routerLinkActive="active">Reports</a>
        </li>
      </ul>
    </nav>
  `,
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  role: string = 'Employee';

  constructor(private auth: AuthService) {
    this.role = this.auth.getRole() || 'Employee';
  }

  getDashboardRoute(): string {
    switch (this.role) {
      case 'Admin':
        return '/admin-dashboard';
      case 'Manager':
        return '/manager-dashboard';
      case 'Employee':
      default:
        return '/employee-dashboard';
    }
  }
}
