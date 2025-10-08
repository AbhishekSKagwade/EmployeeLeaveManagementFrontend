import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  template: `<h2>Employees Page (Admin Only)</h2>`,
  styles: [``]
})
export class EmployeesPage {}
