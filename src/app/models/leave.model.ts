export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
