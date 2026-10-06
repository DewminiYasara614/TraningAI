import { Routes } from '@angular/router';
import { applicationResolver, jobResolver } from './job-application.resolvers';

export const JOB_APPLICATION_ROUTES: Routes = [
  {
    path: 'apply',
    title: 'Senior .NET Engineer — Northgate Labs | HireFlow',
    resolve: { role: jobResolver },
    loadComponent: () => import('./pages/apply-page/apply-page').then((m) => m.ApplyPage),
  },
  {
    path: 'confirmation',
    title: 'Application sent — Northgate Labs | HireFlow',
    resolve: { role: jobResolver, application: applicationResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () =>
      import('./pages/confirmation-page/confirmation-page').then((m) => m.ConfirmationPage),
  },
];
