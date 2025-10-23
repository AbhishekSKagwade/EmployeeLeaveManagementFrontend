import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LeaveTypeService } from '../../services/leave-type.service';
import { LeaveType, CreateLeaveTypeRequest, UpdateLeaveTypeRequest } from '../../models/leave-type.model';

@Component({
  selector: 'app-leave-types',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './leave-types.component.html',
  styleUrls: ['./leave-types.component.css']
})
export class LeaveTypesComponent implements OnInit {
  leaveTypes: LeaveType[] = [];
  loading = false;
  showAddForm = false;
  showEditForm = false;
  editingLeaveType: LeaveType | null = null;

  // Form data
  newLeaveType: CreateLeaveTypeRequest = {
    name: '',
    maxPerYear: undefined
  };

  editLeaveType: UpdateLeaveTypeRequest = {
    name: '',
    maxPerYear: undefined,
    isActive: true
  };

  constructor(private leaveTypeService: LeaveTypeService) {}

  ngOnInit() {
    this.loadLeaveTypes();
  }

  loadLeaveTypes() {
    this.loading = true;
    this.leaveTypeService.getAllLeaveTypes().subscribe({
      next: (data) => {
        this.leaveTypes = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading leave types:', error);
        this.loading = false;
        alert('Failed to load leave types');
      }
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (this.showAddForm) {
      this.showEditForm = false;
      this.resetNewForm();
    }
  }

  toggleEditForm(leaveType?: LeaveType) {
    this.showEditForm = !this.showEditForm;
    if (this.showEditForm && leaveType) {
      this.editingLeaveType = leaveType;
      this.editLeaveType = {
        name: leaveType.name,
        maxPerYear: leaveType.maxPerYear,
        isActive: leaveType.isActive
      };
    } else {
      this.editingLeaveType = null;
      this.resetEditForm();
    }
    if (this.showEditForm) {
      this.showAddForm = false;
    }
  }

  addLeaveType() {
    if (!this.newLeaveType.name.trim()) {
      alert('Please enter a leave type name');
      return;
    }

    this.loading = true;
    this.leaveTypeService.createLeaveType(this.newLeaveType).subscribe({
      next: () => {
        this.loadLeaveTypes();
        this.toggleAddForm();
        this.resetNewForm();
      },
      error: (error) => {
        console.error('Error creating leave type:', error);
        this.loading = false;
        alert('Failed to create leave type');
      }
    });
  }

  updateLeaveType() {
    if (!this.editLeaveType.name.trim()) {
      alert('Please enter a leave type name');
      return;
    }

    this.loading = true;
    this.leaveTypeService.updateLeaveType(this.editingLeaveType!.leaveTypeId, this.editLeaveType).subscribe({
      next: () => {
        this.loadLeaveTypes();
        this.toggleEditForm();
      },
      error: (error) => {
        console.error('Error updating leave type:', error);
        this.loading = false;
        alert('Failed to update leave type');
      }
    });
  }

  deleteLeaveType(id: number) {
    if (confirm('Are you sure you want to delete this leave type?')) {
      this.loading = true;
      this.leaveTypeService.deleteLeaveType(id).subscribe({
        next: () => {
          this.loadLeaveTypes();
        },
        error: (error) => {
          console.error('Error deleting leave type:', error);
          this.loading = false;
          alert('Failed to delete leave type');
        }
      });
    }
  }

  toggleLeaveTypeStatus(id: number) {
    this.loading = true;
    this.leaveTypeService.toggleLeaveTypeStatus(id).subscribe({
      next: () => {
        this.loadLeaveTypes();
      },
      error: (error) => {
        console.error('Error toggling leave type status:', error);
        this.loading = false;
        alert('Failed to toggle leave type status');
      }
    });
  }

  private resetNewForm() {
    this.newLeaveType = {
      name: '',
      maxPerYear: undefined
    };
  }

  private resetEditForm() {
    this.editLeaveType = {
      name: '',
      maxPerYear: undefined,
      isActive: true
    };
  }
}
