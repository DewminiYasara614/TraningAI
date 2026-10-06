import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'apply' },
  {
    path: '',
    loadChildren: () =>
      import('./features/job-application/job-application.routes').then(
        (m) => m.JOB_APPLICATION_ROUTES,
      ),
  },
  // "All open roles" and other placeholders land on the one role this build has.
  { path: '**', redirectTo: 'apply' },
];
