import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Team {
  teamId: number;
  name: string;
  description?: string;
  members?: any[];
}

@Component({
  selector: 'app-TeamsPage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './TeamsPage.component.html',
  styleUrls: ['./TeamsPage.component.css']
})
export class TeamsPageComponent implements OnInit {
  teams: Team[] = [];
  showAddForm = false;
  newTeam: Team = {
    teamId: 0,
    name: '',
    description: ''
  };
  expandedTeam: number | null = null;
  editingTeam: number | null = null;
  editTeam: Team = {
    teamId: 0,
    name: '',
    description: ''
  };

  private http = inject(HttpClient);

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams() {
    this.http.get<Team[]>('https://localhost:7215/api/Team').subscribe({
      next: (res) => {
        this.teams = res;
      },
      error: (err) => {
        console.error('Error fetching teams:', err);
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addTeam() {
    if (!this.newTeam.name) {
      alert('Please enter a team name');
      return;
    }

    const payload = {
      name: this.newTeam.name,
      description: this.newTeam.description
    };

    this.http.post<Team>('https://localhost:7215/api/Team', payload).subscribe({
      next: () => {
        alert('Team added successfully!');
        this.fetchTeams();
        this.resetForm();
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Error adding team:', err);
        alert('Failed to add team.');
      }
    });
  }

  resetForm() {
    this.newTeam = {
      teamId: 0,
      name: '',
      description: ''
    };
  }

  deleteTeam(teamId: number) {
    if (confirm('Are you sure you want to delete this team?')) {
      this.http.delete(`https://localhost:7215/api/Team/${teamId}`).subscribe({
        next: () => {
          alert('Team deleted successfully!');
          this.fetchTeams();
        },
        error: (err) => {
          console.error('Error deleting team:', err);
          alert('Failed to delete team.');
        }
      });
    }
  }

  toggleMembersView(team: Team) {
    if (this.expandedTeam === team.teamId) {
      this.expandedTeam = null;
    } else {
      this.expandedTeam = team.teamId;
      this.editingTeam = null; // Close edit view if open
    }
  }

  toggleEditView(team: Team) {
    if (this.editingTeam === team.teamId) {
      this.editingTeam = null;
    } else {
      this.editingTeam = team.teamId;
      this.editTeam = { ...team };
      this.expandedTeam = null; // Close members view if open
    }
  }

  cancelEdit() {
    this.editingTeam = null;
    this.editTeam = {
      teamId: 0,
      name: '',
      description: ''
    };
  }

  updateTeam() {
    if (!this.editTeam.name.trim()) {
      alert('Team name is required.');
      return;
    }

    const payload = {
      name: this.editTeam.name.trim(),
      description: this.editTeam.description?.trim() || ''
    };

    this.http.put(`https://localhost:7215/api/Team/${this.editTeam.teamId}`, payload).subscribe({
      next: () => {
        alert('Team updated successfully!');
        this.fetchTeams();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating team:', err);
        alert('Failed to update team.');
      }
    });
  }
}
