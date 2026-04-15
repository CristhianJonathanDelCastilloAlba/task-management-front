import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, interval, Observable, startWith, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Task } from '../shared/models/task.model';
import { CreateProjectDto, Project } from '../shared/models/project.model';
import { CreateModuleDto, Module } from '../shared/models/module.model';
import { NotificationsResponse } from '../shared/models/notification.model';
import { User } from '../shared/models/user.model';
import { Subtask } from '../shared/models/subtask.model';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    private unreadCountSubject = new BehaviorSubject<number>(0);

    notifications$ = this.notificationsSubject.asObservable();
    unreadCount$ = this.unreadCountSubject.asObservable();


    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) {
        this.setupPolling();
    }

    private getHeaders() {
        const headers: any = {
            'Content-Type': 'application/json'
        };

        const authHeaders = this.authService.getAuthHeaders();
        if (authHeaders['Authorization']) {
            headers['Authorization'] = authHeaders['Authorization'];
        }
        return headers;
    }

    private getFormHeaders() {
        const headers: any = {};

        const authHeaders = this.authService.getAuthHeaders();
        if (authHeaders['Authorization']) {
            headers['Authorization'] = authHeaders['Authorization'];
        }

        return headers;
    }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}/users`, { headers: this.getHeaders() });
    }

    createUser(user: User): Observable<{ message: string; user: User; defaultPassword: string }> {
        return this.http.post<{ message: string; user: User; defaultPassword: string }>(
            `${this.apiUrl}/users`,
            user,
            { headers: this.getHeaders() }
        );
    }

    updateUser(id: string, user: Partial<User>): Observable<{ message: string; user: User }> {
        return this.http.put<{ message: string; user: User }>(
            `${this.apiUrl}/users/${id}`,
            user,
            { headers: this.getHeaders() }
        );
    }

    deleteUser(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(
            `${this.apiUrl}/users/${id}`,
            { headers: this.getHeaders() }
        );
    }


    getTasks(filters?: {
        status?: string;
        area?: string;
        responsible_id?: string;
        project_id?: string;
        module_id?: string;
    }): Observable<Task[]> {
        const params: any = {};
        if (filters?.status) params.status = filters.status;
        if (filters?.area) params.area = filters.area;
        if (filters?.responsible_id) params.responsible_id = filters.responsible_id;
        if (filters?.project_id) params.project_id = filters.project_id;
        if (filters?.module_id) params.module_id = filters.module_id;

        return this.http.get<Task[]>(`${this.apiUrl}/tasks`, { params });
    }

    getTasksWithoutProject(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/tasks/without-project`);
    }

    getTaskById(id: string): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
    }

    createTask(taskData: Partial<Task>, images?: File[]): Observable<Task> {
        if (images && images.length > 0) {
            const formData = new FormData();

            Object.keys(taskData).forEach(key => {
                const value = taskData[key as keyof Task];
                if (value !== undefined && value !== null) {
                    if (key === 'task_images' && Array.isArray(value)) {
                        formData.append('task_images', JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            images.forEach((image, index) => {
                formData.append('images', image);
            });

            return this.http.post<Task>(`${this.apiUrl}/tasks`, formData);
        } else {
            return this.http.post<Task>(`${this.apiUrl}/tasks`, taskData);
        }
    }

    updateTask(id: string, taskData: Partial<Task>, images?: File[]): Observable<Task> {
        if (images && images.length > 0) {
            const formData = new FormData();

            Object.keys(taskData).forEach(key => {
                const value = taskData[key as keyof Task];
                if (value !== undefined && value !== null) {
                    if (key === 'task_images' && Array.isArray(value)) {
                        formData.append('task_images', JSON.stringify(value));
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            images.forEach((image, index) => {
                formData.append('images', image);
            });

            return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, formData);
        } else {
            return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, taskData);
        }
    }

    uploadTaskImages(taskId: string, images: File[]): Observable<{
        message: string,
        images: string[],
        all_images: string[]
    }> {
        const formData = new FormData();
        images.forEach((image, index) => {
            formData.append('images', image);
        });

        return this.http.post<{
            message: string,
            images: string[],
            all_images: string[]
        }>(`${this.apiUrl}/tasks/${taskId}/images`, formData);
    }

    deleteTaskImages(taskId: string, imageUrls: string[]): Observable<{
        message: string,
        remaining_images: string[]
    }> {
        return this.http.delete<{
            message: string,
            remaining_images: string[]
        }>(`${this.apiUrl}/tasks/${taskId}/images`, {
            body: { imageUrls }
        });
    }

    deleteTask(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/tasks/${id}`);
    }

    addComment(taskId: string, formData: FormData): Observable<any> {
        return this.http.post(`${this.apiUrl}/tasks/${taskId}/comments`, formData);
    }

    editComment(taskId: string, commentId: string, updateData: any): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}/comments/${commentId}`, updateData);
    }
    uploadTaskImage(image: File): Observable<{ image_url: string }> {
        const formData = new FormData();
        formData.append('image', image);
        return this.http.post<{ image_url: string }>(`${this.apiUrl}/tasks/upload-image`, formData);
    }
    login(credentials: { email: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, credentials);
    }

    register(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, user);
    }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/auth/profile`);
    }

    refreshToken(refreshToken: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refresh-token`, { refreshToken });
    }

    uploadImage(image: File): Observable<{ image_url: string }> {
        const formData = new FormData();
        formData.append('image', image);

        return this.http.post<{ image_url: string }>(
            `${this.apiUrl}/upload-image`,
            formData,
            { headers: this.getFormHeaders() }
        );
    }

    getProjects(filters?: { is_active?: boolean, user_id?: string }): Observable<Project[]> {
        const params: any = {};
        if (filters?.is_active !== undefined) params.is_active = filters.is_active;
        if (filters?.user_id) params.user_id = filters.user_id;

        return this.http.get<Project[]>(this.apiUrl + '/projects', { params });
    }

    getProjectById(id: string): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl + '/projects'}/${id}`);
    }

    getProjectStats(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl + '/projects'}/${id}/stats`);
    }

    createProject(project: CreateProjectDto): Observable<Project> {
        return this.http.post<Project>(this.apiUrl + '/projects', project);
    }

    updateProject(id: string, updates: Partial<Project>): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl + '/projects'}/${id}`, updates);
    }

    deleteProject(id: string, hardDelete = false): Observable<any> {
        return this.http.delete(`${this.apiUrl + '/projects'}/${id}`, {
            body: { hard_delete: hardDelete }
        });
    }

    getProjectModules(projectId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl + '/modules'}`, {
            params: { project_id: projectId }
        });
    }

    getModules(filters?: { project_id?: string, is_active?: boolean }): Observable<Module[]> {
        const params: any = {};
        if (filters?.project_id) params.project_id = filters.project_id;
        if (filters?.is_active !== undefined) params.is_active = filters.is_active;

        return this.http.get<Module[]>(this.apiUrl + '/modules', { params });
    }

    getModuleById(id: string): Observable<Module> {
        return this.http.get<Module>(`${this.apiUrl + '/modules'}/${id}`);
    }

    getModuleStats(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl + '/modules'}/${id}/stats`);
    }

    createModule(module: CreateModuleDto): Observable<Module> {
        return this.http.post<Module>(this.apiUrl + '/modules', module);
    }

    updateModule(id: string, updates: Partial<Module>): Observable<Module> {
        return this.http.put<Module>(`${this.apiUrl + '/modules'}/${id}`, updates);
    }

    deleteModule(id: string, hardDelete = false): Observable<any> {
        return this.http.delete(`${this.apiUrl + '/modules'}/${id}`, {
            body: { hard_delete: hardDelete }
        });
    }

    getModuleTasks(moduleId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl + '/tasks'}'`, {
            params: { module_id: moduleId }
        });
    }

    reorderModules(projectId: string, modules: { id: string, order_index: number }[]): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${projectId}/reorder`, { modules });
    }


    private setupPolling() {
        interval(30000)
            .pipe(
                startWith(0),
                switchMap(() => {
                    const user = localStorage.getItem('currentUser');
                    if (!user) {
                        return EMPTY;
                    }
                    return this.getNotifications();
                })
            )
            .subscribe();
    }

    getNotifications(params?: any): Observable<NotificationsResponse> {
        return new Observable(observer => {

            this.http.get<NotificationsResponse>(`${this.apiUrl}/notifications/my-notifications`, { params })
                .subscribe({
                    next: (response: any) => {
                        this.notificationsSubject.next(response.notifications);
                        this.unreadCountSubject.next(response.unread_count);
                        observer.next(response);
                        observer.complete();
                    },
                    error: (error) => {
                        console.error('Error fetching notifications:', error);
                        observer.error(error);
                    }
                });
        });
    }

    markAsRead(notificationId: string): Observable<any> {
        return this.http.put(`${this.apiUrl + '/notifications'}/${notificationId}/read`, {});
    }

    markAllAsRead(): Observable<any> {
        return this.http.put(`${this.apiUrl + '/notifications'}/mark-all-read`, {});
    }

    deleteNotification(notificationId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl + '/notifications'}/${notificationId}`);
    }

    deleteAllRead(): Observable<any> {
        return this.http.delete(`${this.apiUrl + '/notifications'}`, { params: { read_only: 'true' } });
    }
    
    getNavigationDescription(notification: any): string {
        if (notification.task) {
            return `Tarea: ${notification.task.name}`;
        } else if (notification.project) {
            return `Proyecto: ${notification.project.name}`;
        }
        return 'Ir al detalle';
    }

    formatNotificationDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} d`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }

    getSubtasks(taskId: string): Observable<Subtask[]> {
        return this.http.get<Subtask[]>(`${this.apiUrl}/subtasks/task/${taskId}`);
    }

    createSubtask(taskId: string, formData: FormData): Observable<Subtask> {
        return this.http.post<Subtask>(`${this.apiUrl}/subtasks/task/${taskId}`, formData);
    }

    updateSubtask(subtaskId: string, updates: Partial<Subtask>): Observable<Subtask> {
        return this.http.patch<Subtask>(`${this.apiUrl}/subtasks/${subtaskId}`, updates);
    }

    deleteSubtask(subtaskId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/subtasks/${subtaskId}`);
    }
    updateSubtaskWithImages(subtaskId: string, formData: FormData): Observable<Subtask> {
        return this.http.patch<Subtask>(`${this.apiUrl}/subtasks/${subtaskId}`, formData);
    }
}