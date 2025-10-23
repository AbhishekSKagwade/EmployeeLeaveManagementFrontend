export interface LeaveType {
  leaveTypeId: number;
  name: string;
  maxPerYear?: number;
  isActive: boolean;
}

export interface CreateLeaveTypeRequest {
  name: string;
  maxPerYear?: number;
}

export interface UpdateLeaveTypeRequest {
  name: string;
  maxPerYear?: number;
  isActive: boolean;
}
