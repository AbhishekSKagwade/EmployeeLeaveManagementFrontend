import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginPage {
  email: string = '';
  password: string = '';
  error: string = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login successful:', res);
        // Role-based redirection
        if (res.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (res.role === 'Manager') {
          this.router.navigate(['/manager-dashboard']);
        } else if (res.role === 'Employee') {
          this.router.navigate(['/employee-dashboard']);
        } else {
          this.error = 'Unknown user role';
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err.error?.message || 'Login failed. Please check credentials.';
      }
    });
  }
}
