import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationForm } from '../../components/application-form/application-form';
import { RolePageLayout } from '../../components/role-page-layout/role-page-layout';
import { Application } from '../../models/application.model';
import { Role } from '../../models/role.model';

/** /apply — the role and an empty application form. */
@Component({
  selector: 'hf-apply-page',
  imports: [RolePageLayout, ApplicationForm],
  template: `
    <hf-role-page-layout [role]="role()">
      <hf-application-form [role]="role()" (sent)="showConfirmation($event)" />
    </hf-role-page-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyPage {
  /** From jobResolver (router component input binding). */
  readonly role = input.required<Role>();

  private readonly router = inject(Router);

  protected showConfirmation(application: Application): void {
    void this.router.navigate(['/confirmation'], { queryParams: { id: application.id } });
  }
}
