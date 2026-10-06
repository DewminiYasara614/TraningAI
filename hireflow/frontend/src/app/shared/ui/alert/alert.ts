import { ChangeDetectionStrategy, Component, ElementRef, input, viewChild } from '@angular/core';

/** Error summary / failure alert: announced when it appears, focusable so callers can move focus to it. */
@Component({
  selector: 'hf-alert',
  template: `
    <div #box class="alert" role="alert" tabindex="-1">
      <span class="heading">{{ heading() }}</span>
      @if (body()) {
        <span class="body">{{ body() }}</span>
      }
    </div>
  `,
  styleUrl: './alert.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alert {
  readonly heading = input.required<string>();
  readonly body = input('');

  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');

  focus(): void {
    this.box().nativeElement.focus();
  }
}
