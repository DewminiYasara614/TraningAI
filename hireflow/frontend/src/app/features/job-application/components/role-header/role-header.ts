import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Role } from '../../models/role.model';

@Component({
  selector: 'hf-role-header',
  template: `
    <span class="eyebrow">{{ role().company }} · {{ role().team }}</span>
    <h1 class="title">{{ role().title }}</h1>
    <p class="summary">{{ role().summary }}</p>
  `,
  styleUrl: './role-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleHeader {
  readonly role = input.required<Role>();
}
