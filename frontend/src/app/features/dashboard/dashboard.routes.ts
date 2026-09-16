import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
  },
   {
    path: 'register',
    loadComponent: () => import('../auth/register/register.component').then(m => m.RegisterComponent)
  },
    {
    path: 'apply',
    loadComponent: () => import('./job-application-form/job-application-form.component').then(m => m.JobApplicationFormComponent)
  },
  {
    path: 'employee/:id',
    loadComponent: () => import('./employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent)
  },

];