export interface Employee {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
}
