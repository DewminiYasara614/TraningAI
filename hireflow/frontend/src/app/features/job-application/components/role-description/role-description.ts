import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Role } from '../../models/role.model';

/** The full description — never truncated (FR-002). */
@Component({
  selector: 'hf-role-description',
  template: `
    <section class="description" aria-label="About the role">
      @for (paragraph of role().description.intro; track $index) {
        <p class="paragraph">{{ paragraph }}</p>
      }
      @for (section of role().description.sections; track section.heading) {
        <h2 class="heading">{{ section.heading }}</h2>
        <p class="paragraph">{{ section.body }}</p>
      }
    </section>
  `,
  styleUrl: './role-description.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleDescription {
  readonly role = input.required<Role>();
}
