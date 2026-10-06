import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Card } from '../../../../shared/ui/card/card';
import { formatLongDate } from '../../domain/format';
import { Role } from '../../models/role.model';

interface Fact {
  label: string;
  value: string;
}

@Component({
  selector: 'hf-role-facts',
  imports: [Card],
  templateUrl: './role-facts.html',
  styleUrl: './role-facts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleFacts {
  readonly role = input.required<Role>();

  protected readonly facts = computed<Fact[]>(() => [
    { label: 'Salary', value: this.role().salary },
    { label: 'Location', value: this.role().location },
    { label: 'Contract', value: this.role().contract },
    { label: 'Team', value: this.role().teamSize },
  ]);
  protected readonly closes = computed(() => formatLongDate(this.role().closesOn));
}
