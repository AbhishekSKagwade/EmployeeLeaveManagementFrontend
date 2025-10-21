export interface Employee {
  id?: number;
  employeeId?: number;
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  department?: string;
  roleId: number;
  teamId?: number;
  isActive: boolean;
  role?: {
    roleId: number;
    name: string;
  };
  team?: {
    teamId: number;
    name: string;
  };
}
