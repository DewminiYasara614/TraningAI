import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

/** Labelled text input or textarea whose hint is replaced by its error. */
@Component({
  selector: 'hf-text-field',
  templateUrl: './text-field.html',
  styleUrl: './text-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextField {
  readonly fieldId = input.required<string>();
  readonly label = input.required<string>();
  /** Shown after the label in muted text, e.g. "(optional)". */
  readonly optionalLabel = input('');
  readonly hint = input('');
  /** Replaces the hint and marks the field invalid. */
  readonly error = input<string | undefined>();
  readonly type = input<'text' | 'email'>('text');
  readonly multiline = input(false);
  readonly rows = input(5);
  readonly placeholder = input('');
  readonly maxLength = input<number>();
  readonly autocomplete = input<string>();
  readonly value = model('');

  protected readonly messageId = computed(() => `${this.fieldId()}-message`);
  protected readonly message = computed(() => this.error() || this.hint());

  protected onInput(event: Event): void {
    const control = event.target as HTMLInputElement | HTMLTextAreaElement;
    const max = this.maxLength();
    // Covers paste as well as typing: never hold more than the limit.
    if (max !== undefined && control.value.length > max)
      control.value = control.value.slice(0, max);
    this.value.set(control.value);
  }
}
