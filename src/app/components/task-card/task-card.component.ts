import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../shared/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-md border border-gray-200 p-3 cursor-move hover:shadow-sm transition-all duration-150 hover:border-gray-300 kanban-task">
      <div class="mb-2">
        <div class="flex justify-between items-start mb-1">
          <div class="flex gap-1 items-center">
            <span class="px-2 py-1 text-xs rounded font-medium capitalize"
                  [ngClass]="{
                    'bg-blue-50 text-blue-700 border border-blue-100': task.area === 'frontend',
                    'bg-green-50 text-green-700 border border-green-100': task.area === 'backend',
                    'bg-purple-50 text-purple-700 border border-purple-100': task.area === 'fullstack',
                    'bg-gray-50 text-gray-700 border border-gray-100': !task.area || task.area === 'other'
                  }">
              {{task.area || 'Sin área'}}
            </span>
            <span class="w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-red-500': task.priority === 'high',
                    'bg-yellow-500': task.priority === 'medium',
                    'bg-green-500': task.priority === 'low',
                    'bg-gray-400': !task.priority
                  }"
              [title]="'Prioridad: ' + (task.priority || 'sin prioridad')">
            </span>
          </div>
          <span class="text-[10px] text-gray-400 whitespace-nowrap">
            {{formatDateCompact(task.created_at)}}
          </span>
        </div>
    
        <h4 class="text-xs font-semibold text-gray-900 mb-1 line-clamp-1">{{task.name}}</h4>
        <p class="text-xs text-gray-500 mb-2 kanban-description">
          {{task.description || 'Sin descripción'}}
        </p>
    
        @if (getTaskImages(task).length > 0) {
          <div class="mb-2">
            <div class="flex -space-x-1">
              @for (img of getTaskImages(task).slice(0, 3); track img; let i = $index) {
                <div
                  class="relative">
                  <img [src]="img"
                    class="w-6 h-6 rounded-full border-2 border-white object-cover cursor-pointer"
                    (click)="$event.stopPropagation(); showImageLightbox(task, i)">
                    @if (i === 2 && getTaskImages(task).length > 3) {
                      <div
                        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <span class="text-white text-[8px] font-bold">+{{getTaskImages(task).length - 3}}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
    
          @if (task.subtasks.length) {
            <div class="flex items-center gap-1 mb-1">
              <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="text-xs text-gray-600">
                {{ completedSubtasks }}/{{ task.subtasks.length }} subtareas
              </span>
            </div>
          }
        </div>
    
        <div class="space-y-1">
          <div class="flex items-center gap-1.5">
            <div class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
              <span class="text-xs font-medium text-gray-700">
                {{task.name.charAt(0) || '?'}}
              </span>
            </div>
            <span class="text-xs text-gray-600 truncate" [title]="task.name || 'Sin asignar'">
              {{(task.name || 'Sin asignar').split(' ')[0]}}
            </span>
          </div>
    
          <div class="flex items-center justify-between">
            @if (task.estimated_time) {
              <div class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-xs text-gray-500">{{task.estimated_time}}m</span>
              </div>
            }
            @if (task.comments.length) {
              <div class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span class="text-xs text-gray-500">{{task.comments.length}}</span>
              </div>
            }
          </div>
    
          <div class="pt-2 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
                  [ngClass]="{
                    'bg-blue-50 text-blue-700 border border-blue-200': task.status === 'Desarrollo',
                    'bg-yellow-50 text-yellow-700 border border-yellow-200': task.status === 'QA',
                    'bg-green-50 text-green-700 border border-green-200': task.status === 'Production',
                    'bg-red-50 text-red-700 border border-red-200': task.status === 'Bug/Fix',
                    'bg-gray-50 text-gray-700 border border-gray-200': task.status === 'Terminada'
                  }">
                {{task.status}}
              </span>
            </div>
          </div>
    
          <div class="pt-2 border-t border-gray-100">
            <div class="flex items-center justify-end gap-2">
              <button (click)="onViewDetails()"
                class="text-[10px] text-blue-500 hover:text-blue-700 font-medium">
                Ver
              </button>
              <button (click)="onDelete()"
                class="text-[10px] text-red-500 hover:text-red-700 font-medium">
                Eliminar
              </button>
              @if (task.status !== 'Terminada') {
                <button
                  (click)="onMarkFinished()"
                  class="text-[10px] text-green-500 hover:text-green-700 font-medium">
                  Terminar
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    `,
  styles: [`
    .kanban-task:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .kanban-description { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-height: 2.4em; line-height: 1.2em; }
  `]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() viewDetails = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  @Output() markFinished = new EventEmitter<Task>();

  get completedSubtasks(): number {
    return this.task.subtasks?.filter(s => s.completed).length || 0;
  }

  getTaskImages(task: Task): string[] {
    if (task.task_images?.length) return task.task_images;
    if (task.task_image_url) return [task.task_image_url];
    return [];
  }

  formatDateCompact(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem`;
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' });
  }

  showImageLightbox(task: Task, index: number): void {
    this.viewDetails.emit(task);
  }

  onViewDetails() {
    this.viewDetails.emit(this.task);
  }

  onDelete() {
    this.delete.emit(this.task);
  }

  onMarkFinished() {
    this.markFinished.emit(this.task);
  }
}