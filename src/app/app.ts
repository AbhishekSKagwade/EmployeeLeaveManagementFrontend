import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { SidebarComponent } from './components/sidebar/sidebar';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayoutVisibility(event.urlAfterRedirects);
      }
    });
  }

  private updateLayoutVisibility(url: string) {
    // Routes that should NOT display header, sidebar, or footer
    const noLayoutRoutes = ['/login', '/register', '/forgot-password'];

    // If the current route matches any of these, hide layout
    this.showLayout = !noLayoutRoutes.some(route => url.startsWith(route));
  }
}
