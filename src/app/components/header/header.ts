import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="p-3 bg-light d-flex justify-content-between align-items-center">
      <h4>Employee Leave Management</h4>
      <nav>
        <a routerLink="/profile">Profile</a>
        <a routerLink="/logout">Logout</a>
      </nav>
    </header>
  `
})
export class HeaderComponent {}
