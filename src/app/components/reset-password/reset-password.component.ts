import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña para recuperar tu cuenta
          </p>
        </div>

        @if (!tokenValid) {
          <div class="rounded-lg bg-red-50 p-4 border border-red-200">
            <p class="text-red-800">{{ errorMessage }}</p>
            <a routerLink="/login" class="text-red-600 hover:text-red-700 font-medium mt-2 block">
              Volver al inicio de sesión
            </a>
          </div>
        }

        @if (tokenValid) {
          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6">
            <div class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <input id="password" type="password" formControlName="newPassword"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••">
                @if (resetForm.get('newPassword')?.invalid && resetForm.get('newPassword')?.touched) {
                  <p class="text-red-500 text-sm mt-2">La contraseña debe tener al menos 8 caracteres</p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <input id="confirmPassword" type="password" formControlName="confirmPassword"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••">
                @if (resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched) {
                  <p class="text-red-500 text-sm mt-2">Las contraseñas no coinciden</p>
                }
              </div>
            </div>

            @if (errorMessage) {
              <div class="rounded-lg bg-red-50 p-3 border border-red-200">
                <p class="text-red-800 text-sm">{{ errorMessage }}</p>
              </div>
            }

            @if (successMessage) {
              <div class="rounded-lg bg-green-50 p-3 border border-green-200">
                <p class="text-green-800 text-sm">{{ successMessage }}</p>
              </div>
            }

            <button type="submit" [disabled]="resetForm.invalid || loading"
              class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium">
              {{ loading ? 'Restableciendo...' : 'Restablecer Contraseña' }}
            </button>

            <a routerLink="/login" class="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium">
              Volver al inicio de sesión
            </a>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  tokenValid = false;
  token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Token inválido o no proporcionado';
        this.tokenValid = false;
      } else {
        this.tokenValid = true;
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, this.resetForm.value.newPassword).subscribe({
      next: () => {
        this.successMessage = 'Contraseña restablecida exitosamente. Redirigiendo...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: any) => {
        this.errorMessage = error.error?.error || 'Error al restablecer la contraseña';
        this.loading = false;
      }
    });
  }
}
