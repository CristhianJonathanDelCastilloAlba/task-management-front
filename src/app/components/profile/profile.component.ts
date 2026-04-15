import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p class="text-gray-600 mt-2">Administra tu información personal</p>
        </div>
    
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
    
              <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input type="text" formControlName="name"
                      class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                        <div
                          class="text-red-500 text-sm mt-1">
                          El nombre es requerido
                        </div>
                      }
                    </div>
    
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                      <input type="text" formControlName="last_name"
                        class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      </div>
                    </div>
    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" formControlName="email"
                          class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          @if (profileForm.get('email')?.invalid && profileForm.get('email')?.touched) {
                            <div
                              class="text-red-500 text-sm mt-1">
                              Email inválido
                            </div>
                          }
                        </div>
    
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                          <input type="tel" formControlName="phone"
                            class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          </div>
                        </div>
    
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">Puesto</label>
                          <input type="text" formControlName="position"
                            class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                          </div>
    
                          <div class="flex justify-end">
                            <button type="submit"
                              [disabled]="profileForm.invalid || updatingProfile"
                              class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                              {{ updatingProfile ? 'Guardando...' : 'Guardar Cambios' }}
                            </button>
                          </div>
    
                          @if (profileSuccess) {
                            <div class="rounded-lg bg-green-50 p-4">
                              <p class="text-green-800 text-sm">Perfil actualizado exitosamente</p>
                            </div>
                          }
                          @if (profileError) {
                            <div class="rounded-lg bg-red-50 p-4">
                              <p class="text-red-800 text-sm">{{ profileError }}</p>
                            </div>
                          }
                        </form>
                      </div>
    
                      <div class="bg-white rounded-xl shadow p-6">
                        <h2 class="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>
    
                        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-6">
                          <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual *</label>
                            <input type="password" formControlName="currentPassword"
                              class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
    
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña *</label>
                                <input type="password" formControlName="newPassword"
                                  class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                </div>
    
                                <div>
                                  <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña *</label>
                                  <input type="password" formControlName="confirmPassword"
                                    class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                  </div>
                                </div>
    
                                <div class="flex justify-end">
                                  <button type="submit"
                                    [disabled]="passwordForm.invalid || changingPassword"
                                    class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                    {{ changingPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
                                  </button>
                                </div>
    
                                @if (passwordSuccess) {
                                  <div class="rounded-lg bg-green-50 p-4">
                                    <p class="text-green-800 text-sm">Contraseña cambiada exitosamente</p>
                                  </div>
                                }
                                @if (passwordError) {
                                  <div class="rounded-lg bg-red-50 p-4">
                                    <p class="text-red-800 text-sm">{{ passwordError }}</p>
                                  </div>
                                }
                              </form>
                            </div>
                          </div>
    
                          <div class="space-y-6">
                            <div class="bg-white rounded-xl shadow p-6">
                              <h2 class="text-xl font-semibold text-gray-900 mb-6">Información de la Cuenta</h2>
    
                              <div class="space-y-4">
                                <div>
                                  <p class="text-sm text-gray-500">Rol</p>
                                  <div class="flex items-center mt-1">
                                    <span class="px-3 py-1 rounded-full text-sm font-medium"
                                      [class]="user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                                      {{ user?.role === 'admin' ? 'Administrador' : 'Usuario' }}
                                    </span>
                                  </div>
                                </div>
    
                                <div>
                                  <p class="text-sm text-gray-500">Estado</p>
                                  <p class="text-sm font-medium text-green-600 mt-1">
                                    {{ user?.is_active ? 'Activo' : 'Inactivo' }}
                                  </p>
                                </div>
    
                                <div>
                                  <p class="text-sm text-gray-500">Miembro desde</p>
                                  <p class="text-sm font-medium text-gray-900 mt-1">
                                    {{ user?.created_at | date:'dd/MM/yyyy' }}
                                  </p>
                                </div>
    
                                <div>
                                  <p class="text-sm text-gray-500">Último acceso</p>
                                  <p class="text-sm font-medium text-gray-900 mt-1">
                                    {{ user?.last_login ? (user?.last_login | date:'dd/MM/yyyy HH:mm') : 'Nunca' }}
                                  </p>
                                </div>
                              </div>
                            </div>
    
                            <div class="bg-white rounded-xl shadow p-6">
                              <h2 class="text-xl font-semibold text-gray-900 mb-6">Acciones</h2>
    
                              <div class="space-y-3">
                                <button (click)="logout()"
                                  class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                  </svg>
                                  Cerrar Sesión
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
    `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;
  updatingProfile = false;
  changingPassword = false;
  profileSuccess = false;
  profileError = '';
  passwordSuccess = false;
  passwordError = '';

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      last_name: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      position: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          name: user.name,
          last_name: user.last_name || '',
          email: user.email,
          phone: user.phone || '',
          position: user.position || ''
        });
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.updatingProfile = true;
    this.profileSuccess = false;
    this.profileError = '';

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.profileSuccess = true;
        this.updatingProfile = false;
        setTimeout(() => this.profileSuccess = false, 3000);
      },
      error: (error) => {
        this.profileError = error.error?.error || 'Error al actualizar el perfil';
        this.updatingProfile = false;
      }
    });
  }

  onChangePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    this.changingPassword = true;
    this.passwordSuccess = false;
    this.passwordError = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.passwordSuccess = true;
        this.passwordForm.reset();
        this.changingPassword = false;
        setTimeout(() => this.passwordSuccess = false, 3000);
      },
      error: (error) => {
        this.passwordError = error.error?.error || 'Error al cambiar la contraseña';
        this.changingPassword = false;
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}