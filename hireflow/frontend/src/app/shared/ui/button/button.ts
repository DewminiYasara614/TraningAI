import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

const DEFAULT_SIZE: Record<ButtonVariant, ButtonSize> = {
  primary: 'lg',
  secondary: 'md',
  ghost: 'sm',
};

/**
 * Styles a native <button> or <a>. While `busy`, it stays focusable (aria-disabled, not disabled)
 * but ignores activation, so keyboard focus is not lost mid-submit.
 */
@Component({
  selector: 'button[hf-button], a[hf-button]',
  template: `
    <span class="content" [hidden]="showBusyLabel()"><ng-content /></span>
    @if (showBusyLabel()) {
      <span>{{ busyLabel() }}</span>
    }
  `,
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-busy]': 'busy() || null',
    '[attr.aria-disabled]': 'busy() || null',
    '(click)': 'guard($event)',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>();
  readonly fullWidth = input(false);
  readonly busy = input(false);
  readonly busyLabel = input('');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly showBusyLabel = computed(() => this.busy() && !!this.busyLabel());
  protected readonly hostClass = computed(() =>
    [
      'hf-button',
      this.variant(),
      this.size() ?? DEFAULT_SIZE[this.variant()],
      this.fullWidth() ? 'full-width' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  focus(): void {
    this.host.nativeElement.focus();
  }

  protected guard(event: Event): void {
    if (this.busy()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
