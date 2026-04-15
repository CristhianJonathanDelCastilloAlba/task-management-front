import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4 max-w-2xl">
        <div class="mb-8">
          <a (click)="back()" class="cursor-pointer inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Volver
          </a>
    
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
              </h1>
              <p class="text-gray-600 mt-2">
                {{ isEditMode ? 'Modifica los detalles del proyecto' : 'Completa el formulario para crear un nuevo proyecto' }}
              </p>
            </div>
          </div>
        </div>
        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="bg-white rounded-xl shadow p-6">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Nombre del proyecto <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="name"
                class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ej: Sistema de Gestión de Tareas">
                @if (projectForm.get('name')?.invalid && projectForm.get('name')?.touched) {
                  <div
                    class="text-red-500 text-sm mt-2">
                    El nombre es requerido
                  </div>
                }
              </div>
    
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Descripción
                </label>
                <textarea formControlName="description" rows="4"
                  class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Describe el proyecto..."></textarea>
              </div>
    
              <div class="flex items-center mb-6">
                <input type="checkbox" formControlName="is_active" id="is_active"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <label for="is_active" class="ml-2 block text-sm text-gray-900">
                    Proyecto activo
                  </label>
                </div>
              </div>
    
              <div class="flex justify-end gap-4 pt-6">
                <button type="button" (click)="onCancel()"
                  class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="projectForm.invalid || loading"
                  class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Proyecto') }}
                </button>
              </div>
            </form>
          </div>
        </div>
    `
})
export class ProjectFormComponent implements OnInit {
  projectForm: FormGroup;
  isEditMode = false;
  projectId: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      is_active: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.projectId = params['id'];
        this.loadProject(this.projectId);
      }
    });
  }

  loadProject(id: string) {
    this.loading = true;
    this.apiService.getProjectById(id).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description || '',
          is_active: project.is_active
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando proyecto:', error);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.loading = true;
      const projectData = this.projectForm.value;

      if (this.isEditMode) {
        this.apiService.updateProject(this.projectId, projectData).subscribe({
          next: () => {
            this.router.navigate(['/projects']);
          },
          error: (error) => {
            console.error('Error actualizando proyecto:', error);
            this.loading = false;
            alert('Error al actualizar el proyecto');
          }
        });
      } else {
        this.apiService.createProject(projectData).subscribe({
          next: () => {
            this.router.navigate(['/projects']);
          },
          error: (error) => {
            console.error('Error creando proyecto:', error);
            this.loading = false;
            alert('Error al crear el proyecto');
          }
        });
      }
    }
  }

  onCancel() {
    window.history.back()
  }

  back(): void {
    window.history.back()
  }
}