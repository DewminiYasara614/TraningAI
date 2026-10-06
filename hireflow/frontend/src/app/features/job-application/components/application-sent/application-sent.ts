import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Button } from '../../../../shared/ui/button/button';
import { Card } from '../../../../shared/ui/card/card';
import { firstName, formatDayMonth } from '../../domain/format';
import { Application } from '../../models/application.model';
import { Role } from '../../models/role.model';

/** The "Application sent" confirmation (FR-017, FR-018). */
@Component({
  selector: 'hf-application-sent',
  imports: [Button, Card],
  templateUrl: './application-sent.html',
  styleUrl: './application-sent.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationSent {
  readonly role = input.required<Role>();
  readonly application = input.required<Application>();
  readonly startAgain = output();

  protected readonly greeting = computed(() => firstName(this.application().fullName));
  protected readonly managerFirstName = computed(
    () => this.role().hiringManager.name.split(' ')[0],
  );
  protected readonly replyBy = computed(() => formatDayMonth(this.role().replyBy));

  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  constructor() {
    // Move focus to the confirmation as it replaces the form.
    afterNextRender(() => this.heading().nativeElement.focus());
  }
}
