import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4 max-w-2xl">
        <div class="mb-8">
          <a class="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Volver
          </a>
    
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">
                {{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}
              </h1>
              <p class="text-gray-600 mt-2">
                {{ isEditMode ? 'Modifica la información del usuario' : 'Completa el formulario para crear un nuevo usuario' }}
              </p>
            </div>
          </div>
        </div>
    
        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="bg-white rounded-xl shadow p-6">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Nombre <span class="text-red-500">*</span>
              </label>
              <input type="text" formControlName="name"
                class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Ej: Juan">
                @if (userForm.get('name')?.invalid && userForm.get('name')?.touched) {
                  <div
                    class="text-red-500 text-sm mt-2">
                    El nombre es requerido
                  </div>
                }
              </div>
    
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Apellidos
                </label>
                <input type="text" formControlName="last_name"
                  class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Ej: Pérez González">
                </div>
    
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      Correo electrónico
                    </label>
                    <input type="email" formControlName="email"
                      class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="ejemplo@correo.com">
                    </div>
    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        Teléfono
                      </label>
                      <input type="tel" formControlName="phone"
                        class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="+34 600 000 000">
                      </div>
                    </div>
    
                    <div class="mb-6">
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        Puesto
                      </label>
                      <input type="text" formControlName="position"
                        class="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="Ej: Desarrollador Frontend">
                      </div>
    
                      <div class="flex justify-end gap-4 pt-6 border-t">
                        <button type="button" (click)="onCancel()"
                          class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          Cancelar
                        </button>
                        <button type="submit" [disabled]="userForm.invalid || loading"
                          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          {{ loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear Usuario') }}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
    `
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      last_name: [''],
      phone: [''],
      email: [''],
      position: ['']
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = params['id'];
        this.loadUser(this.userId);
      }
    });
  }

  loadUser(id: string) {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        const user = users.find((u: any) => u.id === id);
        if (user) {
          this.userForm.patchValue({
            name: user.name,
            last_name: user.last_name || '',
            phone: user.phone || '',
            email: user.email || '',
            position: user.position || ''
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuario:', error);
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;

      if (this.isEditMode) {
        this.apiService.updateUser(this.userId, userData).subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Error actualizando usuario:', error);
            this.loading = false;
            alert('Error al actualizar el usuario');
          }
        });
      } else {
        this.apiService.createUser(userData).subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            console.error('Error creando usuario:', error);
            this.loading = false;
            alert('Error al crear el usuario');
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