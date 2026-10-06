import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { map, of } from 'rxjs';
import { Application } from './models/application.model';
import { Role } from './models/role.model';
import { ApplicationService } from './services/application.service';
import { JobService } from './services/job.service';

export const jobResolver: ResolveFn<Role> = () => inject(JobService).current();

/** The sent application named by `?id=`; missing or unknown ids go back to the empty form. */
export const applicationResolver: ResolveFn<Application | RedirectCommand> = (route) => {
  const router = inject(Router);
  const toForm = new RedirectCommand(router.parseUrl('/apply'), { replaceUrl: true });
  const id = route.queryParamMap.get('id');
  if (!id) return of(toForm);
  return inject(ApplicationService)
    .byId(id)
    .pipe(map((application) => application ?? toForm));
};
