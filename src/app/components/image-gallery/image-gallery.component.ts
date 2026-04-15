import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'app-image-gallery',
    standalone: true,
    imports: [],
    template: `
    @if (images.length > 0) {
      <div class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-semibold text-gray-900">Galería de imágenes</h4>
          <span class="text-xs text-gray-500">{{ images.length }} imágenes</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          @for (img of images; track img; let i = $index) {
            <div
              class="relative group cursor-pointer"
              (click)="onImageClick(i)">
              <img [src]="img" class="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity">
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>
                </svg>
              </div>
            </div>
          }
        </div>
      </div>
    }
    `
})
export class ImageGalleryComponent {
    @Input() images: string[] = [];
    @Output() imageClicked = new EventEmitter<number>();

    onImageClick(index: number) {
        this.imageClicked.emit(index);
    }
}