import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Comment } from '../../shared/models/comment.model';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h4 class="text-sm font-semibold text-gray-900">
          Comentarios ({{ comments.length }})
        </h4>
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
    
      <div class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
        @for (comment of comments; track comment) {
          <div class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-900">{{ comment.user_name || 'Anónimo' }}</span>
                @if (comment.is_edited) {
                  <span class="text-[10px] text-gray-400">(editado)</span>
                }
              </div>
              <span class="text-[10px] text-gray-500">{{ formatDate(comment.created_at) }}</span>
            </div>
            <p class="text-xs text-gray-700 whitespace-pre-line">{{ comment.text }}</p>
            @if (comment.images && comment.images.length > 0) {
              <div class="flex flex-wrap gap-1 mt-2">
                @for (img of comment.images; track img) {
                  <img [src]="img"
                    class="w-20 h-20 object-cover rounded border cursor-pointer"
                    (click)="openImage(img)">
                }
              </div>
            }
          </div>
        }
        @if (comments.length === 0) {
          <div class="text-center py-4 text-sm text-gray-500">
            No hay comentarios
          </div>
        }
      </div>
    
      @if (showAddForm) {
        <div class="mt-3 p-3 border border-gray-200 rounded-lg bg-white">
          <form [formGroup]="commentForm" (ngSubmit)="addComment()" class="space-y-3">
            <div>
              <textarea formControlName="text" rows="2"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe un comentario..."></textarea>
            </div>
            <div class="flex items-center gap-2">
              <button type="button"
                (click)="fileInput.click()"
                class="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                Adjuntar imágenes
              </button>
              <input #fileInput type="file" multiple accept="image/*" class="hidden" (change)="onFilesSelected($event)">
            </div>
            @if (selectedImages.length > 0) {
              <div class="flex flex-wrap gap-2 mt-2">
                @for (img of selectedImages; track img; let i = $index) {
                  <div class="relative">
                    <img [src]="getImagePreview(img)" class="w-16 h-16 object-cover rounded border">
                    <button type="button" (click)="removeImage(i)"
                    class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✕</button>
                  </div>
                }
              </div>
            }
            <div class="flex justify-end gap-2">
              <button type="button" (click)="cancelAdd()"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
              <button type="submit" [disabled]="commentForm.invalid || loading"
                class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50">
                {{ loading ? 'Enviando...' : 'Agregar' }}
              </button>
            </div>
          </form>
        </div>
      }
    </div>
    `
})
export class CommentsSectionComponent {
  @Input() taskId!: string;
  @Input() comments: Comment[] = [];
  @Output() commentAdded = new EventEmitter<void>();

  commentForm: FormGroup;
  selectedImages: File[] = [];
  loading = false;
  showAddForm = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.commentForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  }

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        this.selectedImages.push(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  addComment() {
    if (this.commentForm.invalid) return;
    this.loading = true;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formData = new FormData();
    formData.append('text', this.commentForm.value.text);
    formData.append('user_id', user.id);
    formData.append('user_name', user.name);
    for (let file of this.selectedImages) {
      formData.append('files', file);
    }
    this.apiService.addComment(this.taskId, formData).subscribe({
      next: (updatedTask) => {
        this.comments = updatedTask.comments || [];
        this.commentForm.reset();
        this.selectedImages = [];
        this.showAddForm = false;
        this.loading = false;
        this.commentAdded.emit();
      },
      error: (err) => {
        console.error('Error al agregar comentario:', err);
        alert('Error al agregar comentario');
        this.loading = false;
      }
    });
  }

  cancelAdd() {
    this.showAddForm = false;
    this.commentForm.reset();
    this.selectedImages = [];
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }
}