import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { format } from 'date-fns';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { Project } from '../../shared/models/project.model';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [RouterLink, FormsModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Proyectos</h1>
          <p class="text-gray-600 mt-2">Gestiona todos tus proyectos</p>
        </div>
        <div class="flex gap-3">
          <button (click)="showFilters = !showFilters"
            class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
            </svg>
            <span class="hidden sm:inline">{{ showFilters ? 'Ocultar' : 'Mostrar' }} Filtros</span>
          </button>
          <a routerLink="/projects/new"
            class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="hidden sm:inline">Nuevo Proyecto</span>
          </a>
        </div>
      </div>
    
      @if (showFilters) {
        <div class="bg-white p-6 rounded-lg shadow mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select [(ngModel)]="filters.is_active"
                (change)="applyFilters()"
                class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option [value]="undefined">Todos</option>
                <option [value]="true">Activos</option>
                <option [value]="false">Inactivos</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button (click)="clearFilters()"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Limpiar Filtros
            </button>
          </div>
        </div>
      }
    
      @if (loading) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p class="mt-4 text-gray-600">Cargando proyectos...</p>
        </div>
      }
    
      @if (!loading && projects.length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (project of projects; track project) {
            <div
              class="bg-white rounded-xl shadow hover:shadow-xl transition-shadow p-6">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-semibold text-gray-800 mb-1">{{ project.name }}</h3>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-medium"
                      [class]="project.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ project.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </div>
                </div>
                <div class="relative">
                  <button class="p-2 hover:bg-gray-100 rounded-lg">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p class="text-gray-600 mb-4 line-clamp-2">{{ project.description || 'Sin descripción' }}</p>
              <div class="space-y-2 mb-6">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>{{ project.created_by_user?.name || 'Usuario' }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ formatDate(project.created_at) }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-4 border-t">
                <div class="flex gap-3">
                  <a [routerLink]="['/kanban/projects', project.id]"
                    class="text-blue-500 hover:text-blue-700 font-medium text-sm">
                    Tareas
                  </a>
                </div>
                <div class="flex gap-3">
                  <a [routerLink]="['/projects/edit', project.id]"
                    class="text-yellow-500 hover:text-yellow-700 font-medium text-sm">
                    Editar
                  </a>
                  <button (click)="deleteProject(project.id)"
                    class="text-red-500 hover:text-red-700 font-medium text-sm">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    
      @if (!loading && projects.length === 0) {
        <div class="text-center py-16">
          <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-2xl font-semibold text-gray-900 mb-2">No hay proyectos</h3>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            {{ hasFilters ? 'No se encontraron proyectos con los filtros aplicados.' : 'Comienza creando tu primer proyecto.' }}
          </p>
          <a routerLink="/projects/new"
            class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Crear primer proyecto
          </a>
        </div>
      }
    </div>
    `,
    styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProjectListComponent implements OnInit {
    
    projects: Project[] = [];
    loading = true;
    showFilters = false;
    filters = {
        is_active: undefined as boolean | undefined
    };

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        this.loadProjects();
    }

    loadProjects() {
        this.loading = true;
        this.apiService.getProjects(this.filters).subscribe({
            next: (projects) => {
                this.projects = projects;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error cargando proyectos:', error);
                this.loading = false;
            }
        });
    }

    applyFilters() {
        this.loadProjects();
    }

    clearFilters() {
        this.filters = { is_active: undefined };
        this.loadProjects();
    }

    get hasFilters(): boolean {
        return this.filters.is_active !== undefined;
    }

    formatDate(dateString: string): string {
        return format(new Date(dateString), 'dd/MM/yyyy');
    }

    deleteProject(id: string) {
        if (confirm('¿Estás seguro de eliminar este proyecto?')) {
            this.apiService.deleteProject(id).subscribe({
                next: () => {
                    this.projects = this.projects.filter(project => project.id !== id);
                },
                error: (error) => {
                    console.error('Error eliminando proyecto:', error);
                    alert('Error al eliminar el proyecto');
                }
            });
        }
    }
}