import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
    
          <div class="flex items-center space-x-8">
            <a routerLink="/" class="flex items-center space-x-3">
              <!-- <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md"> -->
                <img src="./taskManagement3.jpeg" class="h-12 w-12 object-contain rounded-lg">
              <!-- </div> -->
              <div>
                <h1 class="text-xl font-bold text-gray-900">TaskManagement</h1>
                <p class="text-xs text-gray-500">Gestión de Proyectos</p>
              </div>
            </a>
    
            @if (currentUser) {
              <nav class="hidden md:flex items-center space-x-1">
                <a routerLink="/projects"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                  [routerLinkActive]="['bg-blue-50', 'text-blue-600']"
                  [routerLinkActiveOptions]="{exact: false}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <span>Proyectos</span>
                </a>
                @if (currentUser.role === 'admin') {
                  <a routerLink="/users"
                    class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
                    [routerLinkActive]="['bg-blue-50', 'text-blue-600']"
                    [routerLinkActiveOptions]="{exact: false}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z"/>
                      </svg>
                      <span>Usuarios</span>
                    </a>
                  }
                </nav>
              }
            </div>
    
            <div class="flex items-center space-x-4">
              @if (currentUser) {
                <div class="relative">
                  <button (click)="toggleNotifications()"
                    class="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      @if (unreadCount > 0) {
                        <span
                          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {{ unreadCount > 99 ? '99+' : unreadCount }}
                        </span>
                      }
                    </button>
                    @if (notificationsOpen) {
                      <div
                        class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                        <div class="p-4 border-b border-gray-200">
                          <div class="flex items-center justify-between">
                            <h3 class="font-semibold text-gray-900">Notificaciones</h3>
                            <div class="flex space-x-2">
                              @if (unreadCount > 0) {
                                <button
                                  (click)="markAllAsRead()"
                                  class="text-sm text-blue-600 hover:text-blue-800">
                                  Marcar todas como leídas
                                </button>
                              }
                              <button (click)="refreshNotifications()"
                                class="p-1 hover:bg-gray-100 rounded">
                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div class="flex-1 overflow-y-auto">
                          @if (notifications.length === 0) {
                            <div class="p-8 text-center text-gray-500">
                              No hay notificaciones
                            </div>
                          }
                          @for (notification of notifications; track notification) {
                            <div
                              class="border-b border-gray-100 last:border-0">
                              <div class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                [class.bg-blue-50]="!notification.is_read"
                                (click)="handleNotificationClick(notification)">
                                <div class="flex items-start space-x-3">
                                  <div class="flex-shrink-0">
                          <div [ngClass]="{
                            'bg-blue-100 text-blue-600': notification.type === 'task_created',
                            'bg-green-100 text-green-600': notification.type === 'task_updated',
                            'bg-red-100 text-red-600': notification.type === 'task_deleted',
                            'bg-purple-100 text-purple-600': notification.type === 'comment'
                          }" class="w-10 h-10 rounded-lg flex items-center justify-center">
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <ng-container>
                                          @switch (notification.type) {
                                            @case ('comment') {
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                                            }
                                            @case ('task_created') {
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            }
                                            @case ('task_updated') {
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            }
                                            @case ('task_deleted') {
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            }
                                          }
                                        </ng-container>
                                      </svg>
                                    </div>
                                  </div>
                                  <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between mb-1">
                                      <h4 class="font-medium text-gray-900 truncate">
                                        {{ notification.title }}
                                      </h4>
                                      @if (!notification.is_read) {
                                        <span
                                        class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                      }
                                    </div>
                                    <p class="text-sm text-gray-600 mb-2">{{ notification.message }}</p>
                                   <div class="flex flex-wrap items-center text-xs text-gray-500 gap-x-4 gap-y-1">
                                      <span class="whitespace-nowrap">{{ formatDate(notification.created_at) }}</span>
                                      
                                      @if (notification.creator) {
                                        <span class="whitespace-nowrap">Por: {{ notification.creator.name }}</span>
                                      }
                                      
                                      @if (notification.task) {
                                        <span class="inline-flex items-center gap-1 max-w-[200px] truncate">
                                          <span>• Tarea:</span>
                                          <span class="truncate">{{ notification.task.name }}</span>
                                        </span>
                                      }
                                      
                                      @if (notification.project && !notification.task) {
                                        <span class="inline-flex items-center gap-1 max-w-[200px] truncate">
                                          <span>• Proyecto:</span>
                                          <span class="truncate">{{ notification.project.name }}</span>
                                        </span>
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                        <div class="p-3 border-t border-gray-200 bg-gray-50">
                          <a routerLink="/notifications"
                            (click)="closeAllDropdowns()"
                            class="block text-center text-sm font-medium text-blue-600 hover:text-blue-800">
                            Ver todas las notificaciones
                          </a>
                        </div>
                      </div>
                    }
                  </div>
                }
    
                @if (currentUser) {
                  <div class="flex items-center space-x-4">
                    <div class="hidden md:flex items-center space-x-3">
                      <div class="text-right">
                        <p class="text-sm font-medium text-gray-900">{{ currentUser.name }}</p>
                        <p class="text-xs text-gray-500">{{ currentUser.role === 'admin' ? 'Administrador' : 'Usuario' }}</p>
                      </div>
                      <div class="relative">
                        <button (click)="toggleDropdown()"
                          class="flex items-center space-x-2 focus:outline-none">
                          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-semibold">
                              {{ currentUser.name.charAt(0) }}
                            </span>
                          </div>
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                          </svg>
                        </button>
                        @if (dropdownOpen) {
                          <div
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div class="py-2">
                              <a routerLink="/profile"
                                (click)="closeAllDropdowns()"
                                class="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                                <span>Mi perfil</span>
                              </a>
                              <button (click)="logout()"
                                class="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                                <span>Cerrar sesión</span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                    <button (click)="toggleMobileMenu()"
                      class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        @if (!mobileMenuOpen) {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        }
                        @if (mobileMenuOpen) {
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        }
                      </svg>
                    </button>
                  </div>
                } @else {
                  <a routerLink="/login"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Iniciar sesión
                  </a>
                }
    
              </div>
            </div>
    
            @if (mobileMenuOpen && currentUser) {
              <div class="md:hidden border-t border-gray-100 py-4">
                <div class="space-y-2">
                  @if (unreadCount > 0) {
                    <div class="px-4 py-3">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-900">Notificaciones ({{ unreadCount }})</span>
                        <button (click)="markAllAsRead()" class="text-sm text-blue-600">
                          Marcar todas leídas
                        </button>
                      </div>
                    </div>
                  }
                  <a routerLink="/dashboard"
                    (click)="closeAllDropdowns()"
                    class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    <span>Dashboard</span>
                  </a>
                  <a routerLink="/projects"
                    (click)="closeAllDropdowns()"
                    class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                    </svg>
                    <span>Proyectos</span>
                  </a>
                  @if (currentUser.role === 'admin') {
                    <a routerLink="/users"
                      (click)="closeAllDropdowns()"
                      class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.707-5.403A10 10 0 0021.75 10c0-5.523-4.477-10-10-10S1.75 4.477 1.75 10a10 10 0 003.043 7.107l5.571 4.167a1.5 1.5 0 001.784 0l5.57-4.167A10 10 0 0022.25 10"/>
                      </svg>
                      <span>Usuarios</span>
                    </a>
                  }
                  <a routerLink="/notifications"
                    (click)="closeAllDropdowns()"
                    class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                      <span>Notificaciones</span>
                      @if (unreadCount > 0) {
                        <span
                          class="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                          {{ unreadCount }}
                        </span>
                      }
                    </a>
                    <a routerLink="/profile"
                      (click)="closeAllDropdowns()"
                      class="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>Mi perfil</span>
                    </a>
                    <button (click)="logout()"
                      class="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-gray-50">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </header>
    `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  dropdownOpen = false;
  notificationsOpen = false;
  mobileMenuOpen = false;

  notifications: any[] = [];
  unreadCount = 0;

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit() {
    const userSub = this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
      if (user) {
        this.loadNotifications();
      }
    });

    const notifSub = this.apiService.notifications$.subscribe(
      (notifications: any) => this.notifications = notifications
    );

    const countSub = this.apiService.unreadCount$.subscribe(
      (count: any) => this.unreadCount = count
    );

    this.subscriptions.push(userSub, notifSub, countSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    this.apiService.getNotifications({ limit: 10 }).subscribe();
  }

  refreshNotifications() {
    this.loadNotifications();
  }

  toggleNotifications() {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.dropdownOpen = false;
      this.mobileMenuOpen = false;
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.notificationsOpen = false;
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.dropdownOpen = false;
      this.notificationsOpen = false;
    }
  }

  closeAllDropdowns() {
    this.dropdownOpen = false;
    this.notificationsOpen = false;
    this.mobileMenuOpen = false;
  }

  handleNotificationClick(notification: any) {
    if (!notification.is_read) {
      this.apiService.markAsRead(notification.id).subscribe(() => {
        this.refreshNotifications();
      });
    }
    this.router.navigate(['/kanban/projects', notification.project_id], {
      queryParams: { taskId: notification.task_id },
      replaceUrl: true
    });
    this.closeAllDropdowns();
  }

  markAllAsRead() {
    this.apiService.markAllAsRead().subscribe(() => {
      this.refreshNotifications();
    });
  }

  logout() {
    this.closeAllDropdowns();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.apiService.formatNotificationDate(dateString);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.notificationsOpen &&
      !target.closest('.relative') &&
      !target.closest('.notifications-dropdown')) {
      this.notificationsOpen = false;
    }

    if (this.dropdownOpen && !target.closest('.relative')) {
      this.dropdownOpen = false;
    }

    if (this.mobileMenuOpen && !target.closest('button') && !target.closest('.md\\:hidden')) {
      this.mobileMenuOpen = false;
    }
  }
}