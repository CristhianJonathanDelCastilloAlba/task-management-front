import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterLink } from '@angular/router';
import { format } from 'date-fns';

import { ApiService } from '../../services/api.service';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Usuarios</h1>
          <p class="text-gray-600 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <a routerLink="/users/new"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
          </svg>
          <span class="hidden sm:inline">Nuevo Usuario</span>
        </a>
      </div>
    
      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p class="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      }
    
      @if (!loading && users.length > 0) {
        <div class="bg-white rounded-xl shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Información de contacto
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puesto
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de registro
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (user of users; track user) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span class="text-blue-600 font-semibold">{{ user.name.charAt(0) }}</span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.last_name || 'Sin apellido' }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ user.email || 'Sin email' }}</div>
                      <div class="text-sm text-gray-500">{{ user?.phone || 'Sin teléfono' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {{ user.position || 'Sin puesto' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.created_at) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex gap-3">
                        <a [routerLink]="['/users/edit', user.id]"
                          class="text-yellow-600 hover:text-yellow-900">
                          Editar
                        </a>
                        <button (click)="deleteUser(user.id!)"
                          class="text-red-600 hover:text-red-900">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    
      @if (!loading && users.length === 0) {
        <div class="text-center py-16">
          <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.707-5.403A10 10 0 0021.75 10c0-5.523-4.477-10-10-10S1.75 4.477 1.75 10a10 10 0 003.043 7.107l5.571 4.167a1.5 1.5 0 001.784 0l5.57-4.167A10 10 0 0022.25 10"/>
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-2">No hay usuarios</h3>
          <p class="text-gray-600 mb-8">Comienza agregando usuarios al sistema.</p>
          <a routerLink="/users/new"
            class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            Agregar primer usuario
          </a>
        </div>
      }
    </div>
    `
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = true;
  private realtimeSub: any;

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    this.loadUsers();

    this.realtimeSub = this.supabaseService.subscribeToUsers((payload: any) => {
      console.log('📢 Cambio en tiempo real en usuarios:', payload);
      this.loadUsers();
    });
  }

  loadUsers() {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.loading = false;
      }
    });
  }

  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.apiService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Sin fecha';
    return format(new Date(dateString), 'dd/MM/yyyy');
  }

  ngOnDestroy() {
    if (this.realtimeSub) {
      this.realtimeSub.unsubscribe();
    }
  }
}