import { dateSelectionJoinTransformer } from "@fullcalendar/core/internal";

export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  status: string;
  reason: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;

  // Add this to store employee name from backend
  employeeName?: string;
}
