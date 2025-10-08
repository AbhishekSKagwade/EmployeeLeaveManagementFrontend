import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { SidebarComponent } from './components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="app-layout d-flex">
      <app-sidebar *ngIf="showHeaderSidebar" class="sidebar"></app-sidebar>
      <div class="main flex-grow-1">
        <app-header *ngIf="showHeaderSidebar"></app-header>
        <main class="content p-4">
          <router-outlet></router-outlet>
        </main>
        <footer class="text-center py-3">© Company — Employee Leave Management</footer>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; display:flex; }
    .sidebar { width: 260px; background: #0d6efd; color: white; }
    .main { flex-grow: 1; min-height: 100vh; }
    footer { background:#f8f9fa; }
    @media (max-width: 768px) { .sidebar { display: none; } }
  `]
})
export class AppComponent {
  showHeaderSidebar = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showHeaderSidebar = !event.url.includes('/login');
      }
    });
  }
}
