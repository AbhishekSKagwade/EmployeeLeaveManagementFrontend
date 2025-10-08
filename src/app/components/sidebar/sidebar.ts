import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="p-3">
      <ul class="list-unstyled">
        <li><a routerLink="/admin-dashboard">Dashboard</a></li>
        <li><a routerLink="/leaves">Leaves</a></li>
        <li><a routerLink="/employees">Employees</a></li>
        <li><a routerLink="/calendar">Calendar</a></li>
      </ul>
    </nav>
  `
})
export class SidebarComponent {}
