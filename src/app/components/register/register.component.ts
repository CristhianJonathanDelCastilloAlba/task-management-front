import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            O
            <a routerLink="/login" class="font-medium text-blue-600 hover:text-blue-500">
              inicia sesión aquí
            </a>
          </p>
        </div>
    
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input id="name" name="name" type="text" autocomplete="name" required
                formControlName="name"
                class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Juan Pérez">
                @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                  <div
                    class="text-red-500 text-sm mt-2">
                    El nombre es requerido
                  </div>
                }
              </div>
    
              <div>
                <label for="last_name" class="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos
                </label>
                <input id="last_name" name="last_name" type="text"
                  formControlName="last_name"
                  class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="González López">
                </div>
    
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input id="email" name="email" type="email" autocomplete="email"
                    formControlName="email"
                    class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="correo@ejemplo.com">
                    @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                      <div
                        class="text-red-500 text-sm mt-2">
                        Por favor ingresa un correo válido
                      </div>
                    }
                  </div>
    
                  <div>
                    <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input id="phone" name="phone" type="tel"
                      formControlName="phone"
                      class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="+52 123 456 7890">
                    </div>
    
                    <div>
                      <label for="position" class="block text-sm font-medium text-gray-700 mb-2">
                        Puesto
                      </label>
                      <input id="position" name="position" type="text"
                        formControlName="position"
                        class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder="Desarrollador">
                      </div>
                    </div>
    
                    <div class="rounded-lg bg-blue-50 p-4">
                      <div class="flex">
                        <div class="flex-shrink-0">
                          <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div class="ml-3">
                          <p class="text-sm text-blue-700">
                            Se creará la cuenta con la contraseña por defecto: <strong>Pass123$</strong>
                          </p>
                          <p class="text-xs text-blue-600 mt-1">
                            El usuario podrá cambiar su contraseña después de iniciar sesión.
                          </p>
                        </div>
                      </div>
                    </div>
    
                    <div>
                      <button type="submit"
                        [disabled]="registerForm.invalid || loading"
                        class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                          <svg class="h-5 w-5 text-blue-300 group-hover:text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                          </svg>
                        </span>
                        {{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}
                      </button>
                    </div>
    
                    @if (error) {
                      <div class="rounded-lg bg-red-50 p-4">
                        <div class="flex">
                          <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                            </svg>
                          </div>
                          <div class="ml-3">
                            <p class="text-sm font-medium text-red-800">{{ error }}</p>
                          </div>
                        </div>
                      </div>
                    }
                  </form>
                </div>
              </div>
    `
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      position: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const userData: RegisterData = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: (response) => {
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.error = error.error?.error || 'Error al crear la cuenta';
        this.loading = false;
      }
    });
  }
}