import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProjectFormComponent } from './components/project-form/project-form.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';

export const routes: Routes = [
    {
        path: 'kanban/projects/:id',
        component: KanbanBoardComponent,
        canActivate: [authGuard]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    {
        path: 'projects',
        component: ProjectListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'projects/new',
        component: ProjectFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'projects/edit/:id',
        component: ProjectFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'users',
        component: UserListComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'users/new',
        component: UserFormComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'users/edit/:id',
        component: UserFormComponent,
        canActivate: [authGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard]
    },
    { path: '', redirectTo: '/projects', pathMatch: 'full' },
    { path: '**', redirectTo: '/login' }
];