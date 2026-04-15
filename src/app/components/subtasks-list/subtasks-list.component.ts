import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Subtask } from '../../shared/models/subtask.model';

@Component({
  selector: 'app-subtasks-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <div>
          <h4 class="text-sm font-semibold text-gray-900">
            Subtareas ({{ subtasks.length }})
          </h4>
          <span class="text-xs text-gray-500">
            {{ completedCount }} completadas
          </span>
        </div>
    
        @if (!showAddForm) {
          <button
            (click)="showAddForm = true"
            class="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar
          </button>
        }
      </div>
    
    
      <div class="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
        @for (subtask of subtasks; track subtask) {
          <div
            class="flex items-start gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:shadow-sm">
            <input type="checkbox"
              [checked]="subtask.completed"
              (change)="toggleSubtask(subtask)"
              class="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-sm text-gray-800 break-words"
                    [class.line-through]="subtask.completed"
                    [class.text-gray-400]="subtask.completed">
                    {{ subtask.text }}
                  </p>
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                    [ngClass]="{
                      'bg-red-500': subtask.priority === 'high',
                      'bg-yellow-500': subtask.priority === 'medium',
                      'bg-green-500': subtask.priority === 'low'
                    }"
                    [title]="'Prioridad: ' + subtask.priority">
                  </span>
                </div>
                @if (subtask.images && subtask.images.length > 0) {
                  <div class="flex flex-wrap gap-1 mt-1">
                    @for (img of subtask.images.slice(0, 3); track img; let i = $index) {
                      <div class="relative">
                        <img [src]="img" class="w-8 h-8 rounded object-cover border border-gray-200 cursor-pointer"
                          (click)="openImage(img)">
                          @if (i === 2 && subtask.images.length > 3) {
                            <div
                              class="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center text-white text-xs">
                              +{{subtask.images.length - 3}}
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                  <div class="flex items-center gap-2 mt-1">
                    <button (click)="openEditModal(subtask)"
                    class="text-xs text-blue-500 hover:text-blue-700">Editar</button>
                    <button (click)="deleteSubtask(subtask.id)"
                    class="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                  </div>
                </div>
              </div>
            }
            @if (subtasks.length === 0) {
              <div class="text-center py-4 text-sm text-gray-500">
                No hay subtareas
              </div>
            }
          </div>
    
          @if (showAddForm) {
            <div class="mt-3 p-3 border border-gray-200 rounded-lg bg-white">
              <form [formGroup]="subtaskForm" (ngSubmit)="addSubtask()" class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Nueva subtarea</label>
                  <input type="text" formControlName="text"
                    placeholder="Ej: Revisar documentación"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
                    <select formControlName="priority"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">Imágenes (opcional)</label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer"
                      (click)="newFileInput.click()">
                      <span class="text-sm text-gray-600">Haz clic para seleccionar imágenes</span>
                      <input #newFileInput type="file" multiple accept="image/*" class="hidden" (change)="onNewFilesSelected($event)">
                    </div>
                    @if (newSelectedImages.length > 0) {
                      <div class="flex flex-wrap gap-2 mt-2">
                        @for (img of newSelectedImages; track img; let i = $index) {
                          <div class="relative">
                            <img [src]="getImagePreview(img)" class="w-16 h-16 object-cover rounded border">
                            <button type="button" (click)="removeNewImage(i)"
                            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                  <div class="flex justify-end gap-2">
                    <button type="button" (click)="cancelAdd()"
                      class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      Cancelar
                    </button>
                    <button type="submit" [disabled]="subtaskForm.invalid || loading"
                      class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50">
                      {{ loading ? 'Agregando...' : 'Agregar' }}
                    </button>
                  </div>
                </form>
              </div>
            }
    
            @if (showEditModal) {
              <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div class="p-5">
                    <h3 class="text-lg font-bold mb-4">Editar Subtarea</h3>
                    <form [formGroup]="editForm" (ngSubmit)="saveEdit()" class="space-y-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                        <input type="text" formControlName="text"
                          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                          <select formControlName="priority" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            <option value="low">Baja</option>
                            <option value="medium">Media</option>
                            <option value="high">Alta</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
                          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer"
                            (click)="editFileInput.click()">
                            <span class="text-sm text-gray-600">Haz clic para seleccionar imágenes</span>
                            <input #editFileInput type="file" multiple accept="image/*" class="hidden" (change)="onEditFilesSelected($event)">
                          </div>
                          @if (editSelectedImages.length > 0) {
                            <div class="flex flex-wrap gap-2 mt-2">
                              @for (img of editSelectedImages; track img; let i = $index) {
                                <div class="relative">
                                  <img [src]="getImagePreview(img)" class="w-16 h-16 object-cover rounded border">
                                  <button type="button" (click)="removeEditImage(i)"
                                  class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                </div>
                              }
                            </div>
                          }
                          @if (editingSubtask?.images?.length) {
                            <div class="mt-2">
                              <p class="text-xs text-gray-500 mb-1">Imágenes actuales:</p>
                              <div class="flex flex-wrap gap-2">
                                @for (img of editingSubtask?.images; track img; let i = $index) {
                                  <div class="relative">
                                    <img [src]="img" class="w-16 h-16 object-cover rounded border">
                                    <button type="button" (click)="markImageForDeletion(img)"
                                    class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                                  </div>
                                }
                              </div>
                            </div>
                          }
                        </div>
                        <div class="flex justify-end gap-2 pt-4">
                          <button type="button" (click)="closeEditModal()"
                          class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                          <button type="submit" [disabled]="editForm.invalid || editLoading"
                            class="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50">
                            {{ editLoading ? 'Guardando...' : 'Guardar' }}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              }
            </div>
    `
})
export class SubtasksListComponent implements OnInit {
  @Input() taskId!: string;
  @Input() subtasks: Subtask[] = [];
  @Output() subtasksChanged = new EventEmitter<Subtask[]>();

  subtaskForm: FormGroup;
  loading = false;
  showAddForm = false;
  newSelectedImages: File[] = [];

  showEditModal = false;
  editingSubtask: Subtask | null = null;
  editForm: FormGroup;
  editLoading = false;
  editSelectedImages: File[] = [];
  imagesToDelete: string[] = [];

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.subtaskForm = this.fb.group({
      text: ['', Validators.required],
      priority: ['medium']
    });
    this.editForm = this.fb.group({
      text: ['', Validators.required],
      priority: ['medium']
    });
  }

  ngOnInit() { }

  get completedCount(): number {
    return this.subtasks.filter(s => s.completed).length;
  }

  addSubtask() {
    if (this.subtaskForm.invalid) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('text', this.subtaskForm.value.text);
    formData.append('priority', this.subtaskForm.value.priority);
    for (let file of this.newSelectedImages) {
      formData.append('files', file);
    }

    this.apiService.createSubtask(this.taskId, formData).subscribe({
      next: (created) => {
        this.subtasks = [...this.subtasks, created];
        this.subtasksChanged.emit(this.subtasks);
        this.subtaskForm.reset({ priority: 'medium' });
        this.newSelectedImages = [];
        this.showAddForm = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creando subtarea:', err);
        alert('Error al crear subtarea');
        this.loading = false;
      }
    });
  }

  cancelAdd() {
    this.showAddForm = false;
    this.subtaskForm.reset({ priority: 'medium' });
    this.newSelectedImages = [];
  }

  toggleSubtask(subtask: Subtask) {
    const updated = { ...subtask, completed: !subtask.completed };
    this.apiService.updateSubtask(subtask.id, { completed: updated.completed }).subscribe({
      next: () => {
        this.subtasks = this.subtasks.map(s => s.id === subtask.id ? updated : s);
        this.subtasksChanged.emit(this.subtasks);
      },
      error: (err) => {
        console.error('Error actualizando subtarea:', err);
        alert('Error al actualizar subtarea');
      }
    });
  }

  openEditModal(subtask: Subtask) {
    this.editingSubtask = { ...subtask };
    this.editForm.patchValue({
      text: subtask.text,
      priority: subtask.priority
    });
    this.editSelectedImages = [];
    this.imagesToDelete = [];
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingSubtask = null;
    this.editSelectedImages = [];
    this.imagesToDelete = [];
  }

  onEditFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        this.editSelectedImages.push(file);
      }
    }
  }

  removeEditImage(index: number) {
    this.editSelectedImages.splice(index, 1);
  }

  markImageForDeletion(imageUrl: string) {
    if (confirm('¿Eliminar esta imagen?')) {
      this.imagesToDelete.push(imageUrl);
      if (this.editingSubtask) {
        this.editingSubtask.images = this.editingSubtask.images?.filter(img => img !== imageUrl);
      }
    }
  }

  saveEdit() {
    if (this.editForm.invalid || !this.editingSubtask) return;
    this.editLoading = true;

    const formValue = this.editForm.value;
    const existingImages = (this.editingSubtask.images || []).filter(img => !this.imagesToDelete.includes(img));

    const formData = new FormData();
    formData.append('text', formValue.text);
    formData.append('priority', formValue.priority);
    formData.append('images', JSON.stringify(existingImages));

    for (let file of this.editSelectedImages) {
      formData.append('files', file);
    }

    this.apiService.updateSubtaskWithImages(this.editingSubtask.id, formData).subscribe({
      next: (updated) => {
        const index = this.subtasks.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.subtasks[index] = updated;
          this.subtasks = [...this.subtasks];
        }
        this.subtasksChanged.emit(this.subtasks);
        this.closeEditModal();
        this.editLoading = false;
      },
      error: (err) => {
        console.error('Error actualizando subtarea:', err);
        alert('Error al guardar cambios');
        this.editLoading = false;
      }
    });
  }

  deleteSubtask(subtaskId: string) {
    if (confirm('¿Eliminar esta subtarea?')) {
      this.apiService.deleteSubtask(subtaskId).subscribe({
        next: () => {
          this.subtasks = this.subtasks.filter(s => s.id !== subtaskId);
          this.subtasksChanged.emit(this.subtasks);
        },
        error: (err) => {
          console.error('Error eliminando subtarea:', err);
          alert('Error al eliminar subtarea');
        }
      });
    }
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }

  onNewFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        this.newSelectedImages.push(file);
      }
    }
  }

  removeNewImage(index: number) {
    this.newSelectedImages.splice(index, 1);
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
}