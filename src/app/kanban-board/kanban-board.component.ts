import { Component, OnInit } from '@angular/core';

import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { ApiService } from '../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../shared/models/task.model';
import { Column } from '../shared/models/column.model';
import { User } from '../shared/models/user.model';
import { TaskCardComponent } from '../components/task-card/task-card.component';
import { TaskDetailModalComponent } from '../components/task-detail-modal/task-detail-modal.component';
import { TaskFormModalComponent } from '../components/task-form-modal/task-form-modal.component';
import { ModuleFormModalComponent } from '../components/module-form-modal/module-form-modal.component';
import { Module } from '../shared/models/module.model';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { FormsModule } from '@angular/forms';
Object.assign(pdfMake, { vfs: pdfFonts['vfs'] });

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    TaskCardComponent,
    TaskDetailModalComponent,
    TaskFormModalComponent,
    ModuleFormModalComponent,
    FormsModule
  ],
  template: `
    <div class="kanban-board">
      <div class="mb-6 m-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 class="text-xl font-bold text-gray-900">Tablero</h2>
          <div class="flex flex-wrap gap-2">
            <div class="flex gap-2">
              <button class="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium" (click)="showDateModal = true">Generar reporte PDF</button>
    
              <button (click)="showTaskForm = true"
                class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nueva Tarea
              </button>
              <button (click)="showModuleForm = true"
                class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Nuevo Módulo
              </button>
            </div>
    
            <div class="flex gap-3">
              @for (column of columns; track column) {
                <div class="flex items-center gap-1.5">
                  <div class="w-2 h-2 rounded-full" [style.backgroundColor]="column.color"></div>
                  <span class="text-xs font-medium text-gray-600">{{column.title}} ({{column.tasks.length}})</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    
      <div cdkDropListGroup class="m-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (column of columns; track column) {
          <div
            class="flex flex-col h-full">
            <div class="mb-3">
              <div class="flex items-center justify-between bg-white rounded-lg px-3 py-2 border shadow-sm">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" [style.backgroundColor]="column.color"></div>
                  <h3 class="text-sm font-semibold" [style.color]="column.textColor">
                    {{column.title}}
                  </h3>
                </div>
                <span class="text-xs font-bold bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                  {{column.tasks.length}}
                </span>
              </div>
            </div>
            <div
              cdkDropList
              [cdkDropListData]="column.tasks"
              [cdkDropListConnectedTo]="getConnectedLists()"
              class="flex-1 overflow-y-auto rounded-lg border-2 border-dashed p-2 transition-all duration-200 kanban-scroll"
              [style.backgroundColor]="column.bgColor"
              [style.borderColor]="column.borderColor"
              (cdkDropListDropped)="drop($event, column.status)"
              style="max-height: 70vh; min-height: 200px;">
              @for (task of column.tasks; track task) {
                <div
                  cdkDrag
                  class="mb-2">
                  <app-task-card
                    [task]="task"
                    (viewDetails)="showTaskDetails($event)"
                    (delete)="deleteTask($event)"
                    (markFinished)="markAsFinished($event)">
                  </app-task-card>
                </div>
              }
              @if (column.tasks.length === 0) {
                <div
                  class="h-full flex flex-col items-center justify-center p-4 text-center">
                  <svg class="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                  <p class="text-xs text-gray-400">Arrastra tareas aquí</p>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
    
    @if (selectedTask) {
      <app-task-detail-modal
        [task]="selectedTask"
        (close)="selectedTask = null"
        (taskUpdated)="loadProject(projectId)"
        (taskDeleted)="handleTaskDeleted($event)">
      </app-task-detail-modal>
    }
    
    @if (showTaskForm) {
      <app-task-form-modal
        [projectId]="projectId"
        [modules]="modules"
        [users]="users"
        (close)="closeTaskForm()"
        (taskCreated)="handleTaskCreated()">
      </app-task-form-modal>
    }
    
    @if (showModuleForm) {
      <app-module-form-modal
        [projectId]="projectId"
        (close)="closeModuleForm()"
        (moduleCreated)="handleModuleCreated()">
      </app-module-form-modal>
    }
    
    @if (showDateModal) {
      <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 class="text-xl font-bold text-gray-800">📅 Seleccionar período</h3>
            <button (click)="showDateModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <span class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Fecha inicio
                </span>
              </label>
              <input
                type="date"
                [(ngModel)]="startDate"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                [max]="endDate"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <span class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Fecha fin
                  </span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="endDate"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  [min]="startDate"
                  >
                </div>
                <p class="text-xs text-gray-500 flex items-center gap-1 mt-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Las tareas se filtrarán por su fecha de creación
                </p>
              </div>
              <div class="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                <button
                  (click)="showDateModal = false"
                  class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                  >
                  Cancelar
                </button>
                <button
                  (click)="generarReporteConFechas()"
                  class="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                  >
                  Generar reporte
                </button>
              </div>
            </div>
          </div>
        }
    `,
  styles: [`
    .kanban-scroll::-webkit-scrollbar { width: 6px; }
    .kanban-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
    .kanban-scroll::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
    .kanban-scroll::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
    .cdk-drag-preview { box-sizing: border-box; border-radius: 4px; box-shadow: 0 3px 3px -2px rgba(0,0,0,0.1); opacity: 0.9; transform: rotate(1deg); }
    .cdk-drag-placeholder { opacity: 0.2; background: #f0f0f0; border: 2px dashed #d1d5db; border-radius: 6px; }
    .cdk-drag-animating { transition: transform 200ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) { transition: transform 200ms cubic-bezier(0, 0, 0.2, 1); }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
    }
    .modal-content label {
      display: block;
      margin: 10px 0;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  tasks: Task[] = [];
  modules: Module[] = [];
  users: User[] = [];
  projectId: string = '';
  selectedTask: Task | null = null;
  showTaskForm = false;
  showModuleForm = false;
  projectData: any = {};
  showDateModal = false;
  startDate: string = '';
  endDate: string = '';
  pendingTaskId: string | null = null;

  columns: Column[] = [
    { id: 'inprocess', title: 'In Process', status: 'Desarrollo', color: '#3b82f6', bgColor: '#eff6ff', textColor: '#1e40af', borderColor: '#93c5fd', tasks: [] },
    { id: 'bugfix', title: 'Bug/Fix', status: 'Bug/Fix', color: '#ef4444', bgColor: '#fef2f2', textColor: '#991b1b', borderColor: '#fca5a5', tasks: [] },
    { id: 'qa', title: 'QA', status: 'QA', color: '#f59e0b', bgColor: '#fffbeb', textColor: '#92400e', borderColor: '#fcd34d', tasks: [] },
    { id: 'production', title: 'Production', status: 'Production', color: '#10b981', bgColor: '#ecfdf5', textColor: '#065f46', borderColor: '#6ee7b7', tasks: [] }
  ];

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router
  ) { }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';

    this.route.queryParams.subscribe(params => {
      this.pendingTaskId = params['taskId'] || null;
      this.tryOpenTask();
    });

    if (this.projectId) {
      this.loadProject(this.projectId);
    }
  }

  openTaskFromRoute(taskId: string) {
    const findTask = () => {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        this.selectedTask = task;
      }
    };
    if (this.tasks.length) {
      findTask();
    } else {
      setTimeout(findTask, 500);
    }
  }

  loadProject(id: string) {
    this.apiService.getProjectById(id).subscribe({
      next: (project: any) => {
        this.projectData = project;
        this.tasks = project.tasks || [];
        this.organizeTasks();
        setTimeout(() => this.tryOpenTask(), 100);
      }
    });
  }

  tryOpenTask() {
    if (!this.pendingTaskId || !this.tasks.length) return;
    const task = this.tasks.find(t => t.id.toString() === this.pendingTaskId);
    if (task) {
      this.selectedTask = task;
      this.pendingTaskId = null;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { taskId: null },
        replaceUrl: true
      });
    } else {
      setTimeout(() => this.tryOpenTask(), 200);
    }
  }
  loadModules() {
    this.apiService.getModules({ project_id: this.projectId, is_active: true }).subscribe({
      next: (modules) => this.modules = modules,
      error: (err) => console.error('Error cargando módulos:', err)
    });
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  organizeTasks() {
    this.columns.forEach(col => col.tasks = []);
    const activeTasks = this.tasks.filter(t => t.status !== 'Terminada');
    activeTasks.forEach(task => {
      const col = this.columns.find(c => c.status === task.status);
      if (col) col.tasks.push(task);
      else this.columns[0].tasks.push(task);
    });
  }

  getConnectedLists(): string[] {
    return this.columns.map(col => col.id);
  }

  drop(event: CdkDragDrop<Task[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      task.status = newStatus;
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      this.apiService.updateTask(task.id, { status: newStatus }).subscribe({
        error: (err) => {
          console.error('Error actualizando estado:', err);
          this.organizeTasks();
        }
      });
    }
  }

  showTaskDetails(task: Task) {
    this.selectedTask = task;
  }

  deleteTask(task: Task) {
    if (confirm(`¿Eliminar tarea "${task.name}"?`)) {
      this.apiService.deleteTask(task.id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.organizeTasks();
          if (this.selectedTask?.id === task.id) this.selectedTask = null;
        },
        error: (err) => {
          console.error('Error eliminando tarea:', err);
          alert('Error al eliminar la tarea');
        }
      });
    }
  }

  markAsFinished(task: Task) {
    if (confirm(`¿Marcar "${task.name}" como terminada?`)) {
      this.apiService.updateTask(task.id, { status: 'Terminada', finished_at: new Date().toISOString() }).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== task.id);
          this.organizeTasks();
          if (this.selectedTask?.id === task.id) this.selectedTask = null;
        },
        error: (err) => {
          console.error('Error al terminar tarea:', err);
          alert('Error al marcar como terminada');
        }
      });
    }
  }

  closeTaskForm() {
    this.showTaskForm = false;
  }

  closeModuleForm() {
    this.showModuleForm = false;
  }

  handleTaskCreated() {
    this.loadProject(this.projectId);
    this.showTaskForm = false;
  }

  handleModuleCreated() {
    this.loadModules();
    this.showModuleForm = false;
  }

  handleTaskDeleted(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.organizeTasks();
    this.selectedTask = null;
  }

  generarReporteConFechas() {
    this.showDateModal = false;
    const start = this.startDate ? new Date(this.startDate) : null;
    const end = this.endDate ? new Date(this.endDate) : null;
    if (end) {
      end.setHours(23, 59, 59, 999);
    }
    this.generarReporte(start, end);
  }

  generarReporte(start: Date | null, end: Date | null) {
    const project = this.projectData;
    let tasks = project.tasks || [];

    if (start || end) {
      tasks = tasks.filter((task: any) => {
        const created = new Date(task.created_at);
        if (start && created < start) return false;
        if (end && created > end) return false;
        return true;
      });
    }

    const totalTasks = tasks.length;
    const terminatedTasks = tasks.filter((t: any) => t.status === 'Terminada').length;
    const pendingTasks = totalTasks - terminatedTasks;
    const totalSubtasks = tasks.reduce((acc: number, t: any) => acc + (t.subtasks?.length || 0), 0);
    const completedSubtasks = tasks.reduce((acc: number, t: any) =>
      acc + (t.subtasks?.filter((s: any) => s.completed).length || 0), 0);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '—';
      const d = new Date(dateStr);
      return d.toLocaleDateString();
    };

    const tableBody = [
      ['Tarea', 'Estado', 'Responsable', 'Prioridad', 'Área', 'Creado', 'Finalizado', 'Subtareas', 'Comentarios']
    ];

    tasks.forEach((task: any) => {
      const responsibleName = task.users?.name || task.responsible_id || '—';
      const priority = task.priority || '—';
      const area = task.area || '—';
      const created = formatDate(task.created_at);
      const finished = task.finished_at ? formatDate(task.finished_at) : 'Pendiente';
      const subtaskCount = task.subtasks?.length || 0;
      const completedSubtasksTask = task.subtasks?.filter((s: any) => s.completed).length || 0;
      const subtasksText = subtaskCount > 0 ? `${completedSubtasksTask}/${subtaskCount}` : '—';
      const commentsCount = task.comments?.length || 0;
      const commentsText = commentsCount > 0 ? `${commentsCount}` : '—';

      tableBody.push([
        task.name,
        task.status || '—',
        responsibleName,
        priority,
        area,
        created,
        finished,
        subtasksText,
        commentsText
      ]);
    });

    const content: any[] = [
      { text: `Reporte de Proyecto: ${project.name}`, style: 'header' },
      { text: `Descripción: ${project.description || 'Sin descripción'}`, style: 'subheader' },
      { text: `Fecha de generación: ${new Date().toLocaleString()}`, style: 'date' },
      { text: ' ', margin: [0, 5, 0, 5] },
      {
        text: [
          { text: `Total de tareas: ${totalTasks}  |  ` },
          { text: `Terminadas: ${terminatedTasks}  |  ` },
          { text: `Pendientes: ${pendingTasks}  |  ` },
          { text: `Subtareas: ${completedSubtasks}/${totalSubtasks}` }
        ],
        style: 'summary'
      },
      { text: ' ', margin: [0, 5, 0, 5] },
      {
        table: {
          headerRows: 1,
          widths: ['20%', '10%', '15%', '8%', '8%', '10%', '10%', '8%', '8%'],
          body: tableBody
        },
        layout: 'lightHorizontalLines',
        fontSize: 8
      }
    ];

    if (totalTasks === 0) {
      content.push({ text: 'No hay tareas en el rango seleccionado.', italics: true, margin: [0, 10, 0, 0] });
    }

    const styles = {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 5] },
      subheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 3] },
      date: { fontSize: 9, italics: true, margin: [0, 0, 0, 10] },
      summary: { fontSize: 10, bold: true }
    };

    const docDefinition: any = {
      content,
      styles,
      defaultStyle: { font: 'Roboto', fontSize: 8 },
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [20, 30, 20, 30]
    };

    pdfMake.createPdf(docDefinition).download(`Reporte_${project.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}