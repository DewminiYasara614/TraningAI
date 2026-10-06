import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Role } from '../../models/role.model';
import { RoleDescription } from '../role-description/role-description';
import { RoleFacts } from '../role-facts/role-facts';
import { RoleHeader } from '../role-header/role-header';

/**
 * The role page frame shared by /apply and /confirmation: header, facts and description, with the
 * form or the confirmation projected underneath. Mobile: facts before description; ≥900px: facts
 * in a sticky right column.
 */
@Component({
  selector: 'hf-role-page-layout',
  imports: [RoleHeader, RoleFacts, RoleDescription],
  template: `
    <hf-role-header [role]="role()" />
    <div class="columns">
      <hf-role-facts class="facts" [role]="role()" />
      <div class="main">
        <hf-role-description [role]="role()" />
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './role-page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolePageLayout {
  readonly role = input.required<Role>();
}
