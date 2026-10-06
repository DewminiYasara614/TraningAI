import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Surface with border and radius. "accent" uses the primary border (success card). */
@Component({
  selector: 'section[hf-card], aside[hf-card], div[hf-card]',
  template: '<ng-content />',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
})
export class Card {
  readonly tone = input<'default' | 'accent'>('default');
  readonly padding = input<'md' | 'lg'>('md');

  protected readonly hostClass = computed(
    () => `hf-card pad-${this.padding()}${this.tone() === 'accent' ? ' accent' : ''}`,
  );
}
