import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Subtask } from '../../shared/models/subtask.model';
import { Task } from '../../shared/models/task.model';
import { CommentsSectionComponent } from '../comments-section/comments-section.component';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { SubtasksListComponent } from '../subtasks-list/subtasks-list.component';

@Component({
    selector: 'app-task-detail-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CommentsSectionComponent,
        SubtasksListComponent,
        ImageGalleryComponent
    ],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div class="p-5">
          <div class="flex justify-between items-start mb-4">
            <div class="pr-4">
              <div class="flex items-center gap-2 mb-2">
                @if (!editingArea) {
                  <div class="relative group">
                    <span class="px-2 py-0.5 text-xs rounded-full font-medium capitalize cursor-pointer hover:opacity-80"
                        [ngClass]="{
                          'bg-blue-100 text-blue-800': task.area === 'frontend',
                          'bg-green-100 text-green-800': task.area === 'backend',
                          'bg-purple-100 text-purple-800': task.area === 'fullstack',
                          'bg-gray-100 text-gray-800': !task.area || task.area === 'other'
                        }"
                      (click)="startEditArea()">
                      {{task.area || 'Sin área'}}
                    </span>
                    <div class="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      Editar área
                    </div>
                  </div>
                }
                @if (editingArea) {
                  <div class="flex items-center gap-2">
                    <select [(ngModel)]="tempArea"
                      (blur)="saveArea()"
                      (keydown.enter)="saveArea()"
                      (keydown.escape)="cancelEditArea()"
                      class="px-2 py-0.5 text-xs rounded-full border border-gray-300 focus:ring-1 focus:ring-blue-500"
                      autofocus>
                      <option value="frontend">frontend</option>
                      <option value="backend">backend</option>
                      <option value="fullstack">fullstack</option>
                      <option value="design">design</option>
                      <option value="qa">qa</option>
                      <option value="devops">devops</option>
                      <option value="general">general</option>
                      <option value="other">other</option>
                    </select>
                    <button (click)="cancelEditArea()" class="text-gray-500 hover:text-gray-700">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
    
                <span class="text-xs text-gray-500">{{formatDate(task.created_at)}}</span>
                <span class="text-xs px-2 py-0.5 rounded-full"
                      [ngClass]="{
                        'bg-red-100 text-red-800': task.priority === 'high',
                        'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                        'bg-green-100 text-green-800': task.priority === 'low'
                      }">
                  Prioridad: {{task.priority || 'sin'}}
                </span>
              </div>
              <h3 class="text-base font-bold text-gray-900 mb-1">{{task.name}}</h3>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{task.description || 'Sin descripción'}}</p>
            </div>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
    
          <app-image-gallery
            [images]="getTaskImages(task)"
            (imageClicked)="showLightbox($event)">
          </app-image-gallery>
    
          <div class="space-y-4">
            <div class="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-sm font-medium text-blue-800">{{task.users.name.charAt(0) || '?'}}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">{{task.users.name || 'Sin asignar'}}</p>
                <p class="text-xs text-gray-500">{{task.users.position || 'Sin posición'}}</p>
              </div>
            </div>
    
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">Estado</p>
                <p class="text-sm font-medium text-gray-900 capitalize">{{task.status}}</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">Tiempo estimado</p>
                <p class="text-sm font-medium text-gray-900">{{task.estimated_time || 0}} min</p>
              </div>
            </div>
    
            <app-subtasks-list
              [taskId]="task.id"
              [subtasks]="task.subtasks || []"
              (subtasksChanged)="onSubtasksChanged($event)">
            </app-subtasks-list>
    
            <app-comments-section
              [taskId]="task.id"
              [comments]="task.comments || []"
              (commentAdded)="onCommentAdded()">
            </app-comments-section>
          </div>
    
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex justify-between">
              <button (click)="deleteTask()"
                class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
                Eliminar Tarea
              </button>
              <div class="flex gap-2">
                @if (task.status !== 'Terminada') {
                  <button
                    (click)="markAsFinished()"
                    class="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600">
                    {{ task.status === 'Production' ? 'Terminar' : 'Marcar como Terminada' }}
                  </button>
                }
                <button (click)="onClose()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    @if (showLightboxFlag) {
      <div class="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4">
        <div class="relative w-full max-w-4xl">
          <button (click)="closeLightbox()" class="absolute top-4 right-4 hover:text-gray-300 z-10">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img [src]="lightboxImages[currentLightboxIndex]" class="w-full h-auto max-h-[80vh] object-contain rounded-lg">
          @if (lightboxImages.length > 1) {
            <button (click)="prevLightboxImage()"
              class="absolute left-4 top-1/2 transform -translate-y-1/2 hover:text-gray-300">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
          }
          @if (lightboxImages.length > 1) {
            <button (click)="nextLightboxImage()"
              class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          }
          @if (lightboxImages.length > 1) {
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {{ currentLightboxIndex + 1 }} / {{ lightboxImages.length }}
            </div>
          }
        </div>
      </div>
    }
    `
})
export class TaskDetailModalComponent implements OnInit {
    @Input() task!: Task;
    @Output() close = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<void>();
    @Output() taskDeleted = new EventEmitter<string>();

    showLightboxFlag = false;
    lightboxImages: string[] = [];
    currentLightboxIndex = 0;
    editingArea = false;
    tempArea: string = '';

    constructor(private apiService: ApiService) { }

    ngOnInit() { }

    getTaskImages(task: Task): string[] {
        if (task.task_images?.length) return task.task_images;
        if (task.task_image_url) return [task.task_image_url];
        return [];
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-MX', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    onClose() {
        this.close.emit();
    }

    deleteTask() {
        if (confirm(`¿Eliminar tarea "${this.task.name}"?`)) {
            this.apiService.deleteTask(this.task.id).subscribe({
                next: () => {
                    this.taskDeleted.emit(this.task.id);
                    this.onClose();
                },
                error: (err) => {
                    console.error('Error eliminando tarea:', err);
                    alert('Error al eliminar la tarea');
                }
            });
        }
    }

    markAsFinished() {
        if (confirm(`¿Marcar "${this.task.name}" como terminada?`)) {
            this.apiService.updateTask(this.task.id, { status: 'Terminada', finished_at: new Date().toISOString() }).subscribe({
                next: () => {
                    this.taskUpdated.emit();
                    this.onClose();
                },
                error: (err) => {
                    console.error('Error al terminar tarea:', err);
                    alert('Error al marcar como terminada');
                }
            });
        }
    }

    onSubtasksChanged(subtasks: Subtask[]) {
        this.task.subtasks = subtasks;
    }

    onCommentAdded() {
        this.apiService.getProjectById(this.task.project_id).subscribe({
            next: (project) => {
                const updatedTask = project.tasks?.find((t: Task) => t.id === this.task.id);
                if (updatedTask) {
                    this.task = updatedTask;
                }
            }
        });
    }

    startEditArea() {
        this.tempArea = this.task.area || '';
        this.editingArea = true;
        setTimeout(() => {
            const select = document.querySelector('select[autofocus]') as HTMLElement;
            select?.focus();
        });
    }

    saveArea() {
        if (this.tempArea === this.task.area) {
            this.cancelEditArea();
            return;
        }
        this.apiService.updateTask(this.task.id, { area: this.tempArea }).subscribe({
            next: (updatedTask: Task) => {
                this.task.area = updatedTask.area;
                this.taskUpdated.emit();
                this.cancelEditArea();
            },
            error: (err) => {
                console.error('Error al actualizar área:', err);
                alert('Error al actualizar el área');
                this.cancelEditArea();
            }
        });
    }

    cancelEditArea() {
        this.editingArea = false;
        this.tempArea = '';
    }

    showLightbox(index: number) {
        this.lightboxImages = this.getTaskImages(this.task);
        this.currentLightboxIndex = index;
        this.showLightboxFlag = true;
    }

    closeLightbox() {
        this.showLightboxFlag = false;
    }

    prevLightboxImage() {
        this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.lightboxImages.length) % this.lightboxImages.length;
    }

    nextLightboxImage() {
        this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.lightboxImages.length;
    }
}