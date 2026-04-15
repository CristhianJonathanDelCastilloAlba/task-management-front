import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      @if (isAuthenticated) {
        <app-header></app-header>
      }

      <main class="flex-1 overflow-auto pb-20">
        <router-outlet></router-outlet>
      </main>

      @if (isAuthenticated) {
        <footer class="fixed bottom-0 left-0 w-full bg-white border-t py-4 text-center text-gray-500 text-sm z-40">
          <p>Sistema de Gestión de proyectos © 2026</p>
        </footer>
      }
    </div>
    `
})
export class AppComponent implements OnInit {
  isAuthenticated = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }
}