import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardPage implements OnInit {
  teamMembers: any[] = [];
  pendingLeaves = 0;
  employeeId!: number;

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() {
    this.employeeId = this.auth.getEmployeeId();
    this.fetchTeamData();
    this.fetchTeamLeaves();
  }

  fetchTeamData() {
    this.http.get<any[]>(`/api/Employee/team/${this.employeeId}`).subscribe(res => {
      this.teamMembers = res;
    });
  }

  fetchTeamLeaves() {
    this.http.get<any[]>(`/api/Leave/team/${this.employeeId}`).subscribe(leaves => {
      this.pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    });
  }
}
