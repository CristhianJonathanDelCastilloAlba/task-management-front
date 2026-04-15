import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginCredentials } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="h-full w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
            <img src="./taskManagement2.jpeg" class="h-full w-full object-contain rounded-lg">
          </div>
          <h2 class="text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            O
            <a routerLink="/register" class="font-medium text-blue-600 hover:text-blue-500">
              regístrate aquí
            </a>
          </p>
        </div>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input #emailInput id="email" name="email" type="email" autocomplete="email" required
                formControlName="email"
                class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="correo@ejemplo.com">
                @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                  <div
                    class="text-red-500 text-sm mt-2">
                    Por favor ingresa un correo válido
                  </div>
                }
              </div>
    
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input id="password" name="password" type="password" autocomplete="current-password" required
                  formControlName="password"
                  class="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••">
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <div
                      class="text-red-500 text-sm mt-2">
                      La contraseña es requerida
                    </div>
                  }
                </div>
              </div>
    
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input formControlName="remember" id="remember-me" name="remember-me" type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                    <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                      Recordarme
                    </label>
                  </div>
    
                  <div class="text-sm">
                    <button type="button" (click)="showForgotPassword()" class="font-medium text-blue-600 hover:text-blue-500">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>
                <div>
                  <button type="submit"
                    [disabled]="loginForm.invalid || loading"
                    class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                      <svg class="h-5 w-5 text-blue-300 group-hover:text-blue-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
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
              <div class="text-center">
                <p class="text-xs text-gray-500">
                  Credenciales de prueba: admin{{'@'}}ejemplo.com / Pass123$
                </p>
              </div>
            </div>
          </div>
    
    @if (showForgotPasswordModal) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
              <button (click)="closeForgotPassword()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <p class="text-gray-600 mb-4">Ingresa tu correo electrónico para recibir un enlace de recuperación</p>
            
            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onForgotPassword()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input type="email" formControlName="email"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu-correo@ejemplo.com">
                @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                  <p class="text-red-500 text-sm mt-2">Por favor ingresa un correo válido</p>
                }
              </div>
              
              @if (forgotPasswordMessage) {
                <div class="rounded-lg bg-green-50 p-3 border border-green-200">
                  <p class="text-green-800 text-sm">{{ forgotPasswordMessage }}</p>
                </div>
              }
              
              @if (forgotPasswordError) {
                <div class="rounded-lg bg-red-50 p-3 border border-red-200">
                  <p class="text-red-800 text-sm">{{ forgotPasswordError }}</p>
                </div>
              }
              
              <div class="flex gap-3 pt-4">
                <button type="button" (click)="closeForgotPassword()"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                  Cancelar
                </button>
                <button type="submit" [disabled]="forgotPasswordForm.invalid || forgotPasswordLoading"
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">
                  {{ forgotPasswordLoading ? 'Enviando...' : 'Enviar Enlace' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
    `
})
export class LoginComponent {
  loginForm: FormGroup;
  forgotPasswordForm: FormGroup;
  loading = false;
  error = '';
  showForgotPasswordModal = false;
  forgotPasswordLoading = false;
  forgotPasswordMessage = '';
  forgotPasswordError = '';
  @ViewChild('emailInput') emailInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });

    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.validateSesion();
      const savedEmail = localStorage.getItem('remember_email');
      if (savedEmail) {
        this.loginForm.patchValue({
          email: savedEmail,
          remember: true
        });
      }
      this.emailInput.nativeElement.focus();
    });
  }

  validateSesion(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/projects']);
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        if (this.loginForm.value.remember)
          localStorage.setItem('remember_email', this.loginForm.value.email);
        else
          localStorage.removeItem('remember_email');
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.error = error.error?.error || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }

  showForgotPassword() {
    this.forgotPasswordLoading = false;
    this.showForgotPasswordModal = true;
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
  }

  closeForgotPassword() {
    this.showForgotPasswordModal = false;
    this.forgotPasswordForm.reset();
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.forgotPasswordLoading = true;
    this.forgotPasswordError = '';
    this.forgotPasswordMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.forgotPasswordMessage = 'Se ha enviado un enlace de recuperación a tu correo electrónico';
        this.forgotPasswordForm.reset();
        setTimeout(() => {
          this.closeForgotPassword();
        }, 2000);
      },
      error: (error: any) => {
        this.forgotPasswordError = error.error?.error || 'Error al solicitar recuperación de contraseña';
      },
      complete: () => {
        this.forgotPasswordLoading = false;
      }
    });
  }

  getTokenFromLink(link: string): string {
    const tokenMatch = link.match(/token=([^&]*)/);
    return tokenMatch ? tokenMatch[1].substring(0, 20) + '...' : '';
  }
}