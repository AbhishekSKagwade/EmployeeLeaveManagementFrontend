import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HolidayService } from '../../services/holiday.service';
import { Holiday } from '../../models/holiday.model';

@Component({
  selector: 'app-holidays',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './holidays.html',
  styleUrls: ['./holidays.css']
})
export class HolidaysPage implements OnInit {
  holidays: Holiday[] = [];
  showAddForm = false;
  editingHoliday: number | null = null;
  newHoliday: any = {
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    createdBy: 1
  };
  editHoliday: any = {
    holidayId: 0,
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    createdBy: 1
  };

  private holidayService = inject(HolidayService);

  ngOnInit() {
    this.fetchHolidays();
  }

  fetchHolidays() {
    this.holidayService.getAll().subscribe({
      next: (res) => {
        this.holidays = res;
      },
      error: (err) => {
        console.error('Error fetching holidays:', err);
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.editingHoliday = null;
  }

  addHoliday() {
    if (!this.newHoliday.title || !this.newHoliday.startDate || !this.newHoliday.endDate) {
      alert('Please fill in all fields');
      return;
    }

    this.holidayService.createHoliday(this.newHoliday).subscribe({
      next: () => {
        alert('Holiday added successfully!');
        this.fetchHolidays();
        this.resetForm();
        this.showAddForm = false;
      },
      error: (err) => {
        console.error('Error adding holiday:', err);
        alert('Failed to add holiday.');
      }
    });
  }

  resetForm() {
    this.newHoliday = {
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      createdBy: 1
    };
  }

  toggleEditView(holiday: Holiday) {
    if (this.editingHoliday === holiday.holidayId) {
      this.editingHoliday = null;
    } else {
      this.editingHoliday = holiday.holidayId;
      this.editHoliday = {
        holidayId: holiday.holidayId,
        title: holiday.title,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        description: holiday.description || '',
        createdBy: holiday.createdBy
      };
      this.showAddForm = false;
    }
  }

  cancelEdit() {
    this.editingHoliday = null;
    this.editHoliday = {
      holidayId: 0,
      title: '',
      startDate: '',
      endDate: '',
      description: '',
      createdBy: 1
    };
  }

  updateHoliday() {
    if (!this.editHoliday.title || !this.editHoliday.startDate || !this.editHoliday.endDate) {
      alert('Please fill in all fields');
      return;
    }

    this.holidayService.updateHoliday(this.editHoliday.holidayId, this.editHoliday).subscribe({
      next: () => {
        alert('Holiday updated successfully!');
        this.fetchHolidays();
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating holiday:', err);
        alert('Failed to update holiday.');
      }
    });
  }

  deleteHoliday(id: number) {
    if (confirm('Are you sure you want to delete this holiday?')) {
      this.holidayService.deleteHoliday(id).subscribe({
        next: () => {
          alert('Holiday deleted successfully!');
          this.fetchHolidays();
        },
        error: (err) => {
          console.error('Error deleting holiday:', err);
          alert('Failed to delete holiday.');
        }
      });
    }
  }
}
