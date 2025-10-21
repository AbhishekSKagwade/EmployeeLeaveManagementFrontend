export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  status: string;
  reason: string;
  leaveType: string;
  startDate: string;
  endDate: string;

  // Add this to store employee name from backend
  employeeName?: string;
}
