import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { formatFileSize } from '../../domain/format';
import { toCvFile, validateCvFile } from '../../domain/validation';
import { CvFile } from '../../models/cv-file.model';
import { Button } from '../../../../shared/ui/button/button';

/** CV picker: a drop area (a real <button>) that becomes a file row with "Remove" once a file is chosen. */
@Component({
  selector: 'hf-cv-file-drop',
  imports: [Button],
  templateUrl: './cv-file-drop.html',
  styleUrl: './cv-file-drop.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvFileDrop {
  readonly fieldId = input.required<string>();
  readonly value = input<CvFile | null>(null);
  readonly error = input<string | undefined>();
  /** Id of the hint/error element describing this control. */
  readonly hintId = input.required<string>();
  /** Id of the visible "CV" label. */
  readonly labelledBy = input.required<string>();

  readonly changed = output<CvFile | null>();
  /** Emits the reason when a chosen or dropped file is not acceptable. */
  readonly rejected = output<string>();

  protected readonly dragging = signal(false);
  protected readonly actionId = computed(() => `${this.fieldId()}-action`);
  protected readonly chooseLabelledBy = computed(() => `${this.labelledBy()} ${this.actionId()}`);
  protected readonly typeLabel = computed(() => this.value()?.type.toUpperCase() ?? '');
  protected readonly sizeLabel = computed(() => {
    const file = this.value();
    return file ? formatFileSize(file.sizeBytes) : '';
  });
  protected readonly removeLabel = computed(() => `Remove ${this.value()?.name ?? ''}`);

  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  private readonly chooseButton = viewChild<ElementRef<HTMLButtonElement>>('chooseButton');
  private readonly removeButton = viewChild<Button>('removeButton');
  private readonly injector = inject(Injector);

  constructor() {
    // A file dropped outside the drop area must not make the browser open it and lose the form.
    const block = (event: DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    });
  }

  protected openPicker(): void {
    this.fileInput().nativeElement.click();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.take(input.files?.[0], true);
    // Reset so choosing the same file again still fires a change.
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    const target = event.currentTarget as HTMLElement;
    if (target.contains(event.relatedTarget as Node | null)) return;
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.take(event.dataTransfer?.files[0], false);
  }

  protected remove(): void {
    this.changed.emit(null);
    this.focusAfterRender(() => this.chooseButton()?.nativeElement.focus());
  }

  private take(file: File | undefined, refocus: boolean): void {
    if (!file) return;
    const problem = validateCvFile(file);
    if (problem) {
      this.rejected.emit(problem);
      return;
    }
    this.changed.emit(toCvFile(file));
    // Keep keyboard users on the control as it swaps from drop area to file row.
    if (refocus) this.focusAfterRender(() => this.removeButton()?.focus());
  }

  private focusAfterRender(focus: () => void): void {
    afterNextRender(focus, { injector: this.injector });
  }
}
