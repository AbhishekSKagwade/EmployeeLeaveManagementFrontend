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
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
         localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      localStorage.setItem('name', res.name);
      localStorage.setItem('employeeId', res.employeeId);

      console.log('Login successful:', res);
        // Role-based redirection
        switch(res.role) {
          case 'Admin':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'Manager':
            this.router.navigate(['/manager-dashboard']);
            break;
          case 'Employee':
            this.router.navigate(['/employee-dashboard']);
            break;
          default:
            this.error = 'Unknown user role';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid credentials';
      }
    });
  }
}
