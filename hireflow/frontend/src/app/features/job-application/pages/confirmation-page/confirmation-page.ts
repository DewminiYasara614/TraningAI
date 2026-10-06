import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationSent } from '../../components/application-sent/application-sent';
import { RolePageLayout } from '../../components/role-page-layout/role-page-layout';
import { Application } from '../../models/application.model';
import { Role } from '../../models/role.model';

/** /confirmation?id=… — the sent application, read back from storage so it survives reload. */
@Component({
  selector: 'hf-confirmation-page',
  imports: [RolePageLayout, ApplicationSent],
  template: `
    <hf-role-page-layout [role]="role()">
      <hf-application-sent
        [role]="role()"
        [application]="application()"
        (startAgain)="startAgain()"
      />
    </hf-role-page-layout>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPage {
  /** From jobResolver and applicationResolver (router component input binding). */
  readonly role = input.required<Role>();
  readonly application = input.required<Application>();

  private readonly router = inject(Router);

  protected startAgain(): void {
    void this.router.navigate(['/apply']);
  }
}
