import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-module-form-modal',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Nuevo Módulo</h2>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form [formGroup]="moduleForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input type="text" formControlName="name"
                     class="w-full border border-gray-300 rounded-lg px-4 py-3">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea formControlName="description" rows="4"
                        class="w-full border border-gray-300 rounded-lg px-4 py-3"></textarea>
            </div>
            <div class="flex justify-end gap-4 pt-6 border-t">
              <button type="button" (click)="onClose()"
                      class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">
                Cancelar
              </button>
              <button type="submit" [disabled]="moduleForm.invalid || loading"
                      class="px-6 py-3 bg-green-500 text-white hover:bg-green-600 rounded-lg disabled:opacity-50">
                {{ loading ? 'Creando...' : 'Crear Módulo' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ModuleFormModalComponent {
    @Input() projectId!: string;
    @Output() close = new EventEmitter<void>();
    @Output() moduleCreated = new EventEmitter<void>();

    moduleForm: FormGroup;
    loading = false;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        this.moduleForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.moduleForm.invalid) return;
        this.loading = true;
        const data = { ...this.moduleForm.value, project_id: this.projectId };
        this.apiService.createModule(data).subscribe({
            next: () => {
                this.loading = false;
                this.moduleCreated.emit();
            },
            error: (err) => {
                this.loading = false;
                console.error('Error creando módulo:', err);
                alert('Error al crear módulo');
            }
        });
    }
}