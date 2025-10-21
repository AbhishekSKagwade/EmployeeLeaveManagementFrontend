import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  constructor(private auth: AuthService, private router: Router) {}

  getUserName(): string {
    return this.auth.getName() || 'User';
  }

  getUserRole(): string {
    return this.auth.getRole() || 'Employee';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
