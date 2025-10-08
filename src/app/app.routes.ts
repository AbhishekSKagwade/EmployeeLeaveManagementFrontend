import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardPage } from './pages/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardPage } from './pages/employee-dashboard/employee-dashboard.component';
import { LeavesPage } from './pages/leaves/leaves';
import { EmployeesPage } from './pages/employee/employee';
import { TeamsPageComponent } from './TeamsPage/TeamsPage.component';
import { HolidaysPage } from './pages/holidays/holidays';
import { CalendarPage } from './pages/calendar/calendar';
import { ProfilePageComponent } from './pages/ProfilePage/ProfilePage.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: 'admin-dashboard', component: AdminDashboardPage, canActivate: [AuthGuard, RoleGuard], data: { role: 'Admin' } },
  { path: 'manager-dashboard', component: ManagerDashboardPage, canActivate: [AuthGuard, RoleGuard], data: { role: 'Manager' } },
  { path: 'employee-dashboard', component: EmployeeDashboardPage, canActivate: [AuthGuard] },
  { path: 'leaves', component: LeavesPage, canActivate: [AuthGuard] },
  { path: 'employees', component: EmployeesPage, canActivate: [AuthGuard, RoleGuard], data: { role: 'Admin' } },
  { path: 'teams', component: TeamsPageComponent, canActivate: [AuthGuard] },
  { path: 'holidays', component: HolidaysPage, canActivate: [AuthGuard, RoleGuard], data: { role: 'Admin' } },
  { path: 'calendar', component: CalendarPage, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
