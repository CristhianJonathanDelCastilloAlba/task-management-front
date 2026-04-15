import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Module } from '../../shared/models/module.model';
import { User } from '../../shared/models/user.model';

@Component({
    selector: 'app-task-form-modal',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Nueva Tarea</h2>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
    
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input type="text" formControlName="name"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500">
                @if (taskForm.get('name')?.invalid && taskForm.get('name')?.touched) {
                  <div
                  class="text-red-500 text-sm mt-1">Requerido</div>
                }
              </div>
    
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea formControlName="description" rows="3"
                class="w-full border border-gray-300 rounded-lg px-4 py-3"></textarea>
              </div>
    
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Módulo</label>
                  <select formControlName="module_id"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3">
                    <option value="">Selecciona</option>
                    @for (module of modules; track module) {
                      <option [value]="module.id">{{ module.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
                  <select formControlName="responsible_id"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3">
                    <option value="">Seleccionar</option>
                    @for (user of users; track user) {
                      <option [value]="user.id">{{ user.name }}</option>
                    }
                  </select>
                </div>
              </div>
    
              <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Área</label>
                  <select formControlName="area"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3">
                    @for (area of areaOptions; track area) {
                      <option [value]="area">{{ area }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select formControlName="status"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3">
                    @for (status of statusOptions; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select formControlName="priority"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo (min)</label>
                  <input type="number" formControlName="estimated_time"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3" min="0">
                  </div>
                </div>
    
                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Imágenes (opcional)</h3>
                    <span class="text-sm text-gray-500">{{ selectedImages.length }}/10</span>
                  </div>
    
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer"
                    (click)="fileInput.click()"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onDrop($event)">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <p class="mt-2 text-sm text-gray-600">Arrastra imágenes o haz clic</p>
                    <p class="mt-1 text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                    <input #fileInput type="file" multiple accept="image/*" class="hidden" (change)="onFilesSelected($event)">
                  </div>
    
                  @if (selectedImages.length > 0) {
                    <div class="mt-6">
                      <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        @for (image of selectedImages; track image; let i = $index) {
                          <div
                            class="relative group border rounded-lg overflow-hidden">
                            <img [src]="getImagePreview(image)" class="w-full h-24 object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button type="button" (click)="removeImage(i)"
                                class="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
    
                <div class="flex justify-end gap-4 pt-6 border-t">
                  <button type="button" (click)="onClose()"
                    class="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                    Cancelar
                  </button>
                  <button type="submit" [disabled]="taskForm.invalid || loading"
                    class="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 rounded-lg font-medium disabled:opacity-50">
                    {{ loading ? 'Creando...' : 'Crear Tarea' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    `
})
export class TaskFormModalComponent {
    @Input() projectId!: string;
    @Input() modules: Module[] = [];
    @Input() users: User[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() taskCreated = new EventEmitter<void>();

    @ViewChild('fileInput') fileInput!: ElementRef;

    taskForm: FormGroup;
    statusOptions = ['Desarrollo', 'Bug/Fix', 'QA', 'Production', 'Terminada'];
    areaOptions = ['backend', 'frontend', 'db', 'devops', 'design', 'qa', 'general'];
    selectedImages: File[] = [];
    loading = false;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        this.taskForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            module_id: [''],
            responsible_id: [''],
            area: ['general'],
            status: ['Desarrollo'],
            priority: ['medium'],
            estimated_time: [null]
        });
    }

    onClose() {
        this.close.emit();
    }

    onSubmit() {
        if (this.taskForm.invalid) return;
        this.loading = true;
        const taskData = {
            ...this.taskForm.value,
            project_id: this.projectId
        };
        this.apiService.createTask(taskData, this.selectedImages).subscribe({
            next: () => {
                this.loading = false;
                this.taskCreated.emit();
            },
            error: (err) => {
                this.loading = false;
                console.error('Error creando tarea:', err);
                alert('Error al crear la tarea');
            }
        });
    }

    onFilesSelected(event: any) {
        const files: FileList = event.target.files;
        this.processFiles(Array.from(files));
        event.target.value = '';
    }

    onDragOver(e: DragEvent) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.add('border-blue-500', 'bg-blue-50');
    }
    onDragLeave(e: DragEvent) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('border-blue-500', 'bg-blue-50');
    }
    onDrop(e: DragEvent) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).classList.remove('border-blue-500', 'bg-blue-50');
        if (e.dataTransfer?.files) {
            this.processFiles(Array.from(e.dataTransfer.files));
        }
    }

    private processFiles(files: File[]) {
        const imageFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
        const remaining = 10 - this.selectedImages.length;
        const toAdd = imageFiles.slice(0, remaining);
        this.selectedImages.push(...toAdd);
        if (imageFiles.length > remaining) alert(`Solo se pueden agregar ${remaining} imágenes más.`);
    }

    getImagePreview(file: File): string {
        return URL.createObjectURL(file);
    }

    removeImage(index: number) {
        this.selectedImages.splice(index, 1);
    }
}