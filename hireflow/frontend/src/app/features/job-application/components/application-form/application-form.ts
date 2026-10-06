import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Alert } from '../../../../shared/ui/alert/alert';
import { Button } from '../../../../shared/ui/button/button';
import { Card } from '../../../../shared/ui/card/card';
import { TextField } from '../../../../shared/ui/text-field/text-field';
import { MAX_COVER_NOTE, validateApplication } from '../../domain/validation';
import { Application, ApplicationDraft, FieldErrors } from '../../models/application.model';
import { CvFile } from '../../models/cv-file.model';
import { Role } from '../../models/role.model';
import { ApplicationService } from '../../services/application.service';
import { CvFileDrop } from '../cv-file-drop/cv-file-drop';

const FAILURE_MESSAGE =
  "We couldn't send your application. Your details are still here — please try again.";
const CV_HINT = 'PDF, DOC or DOCX, up to 10MB.';

/** The application form: owns the draft, validation and sending (smart component). */
@Component({
  selector: 'hf-application-form',
  imports: [Alert, Button, Card, CvFileDrop, TextField],
  templateUrl: './application-form.html',
  styleUrl: './application-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationForm {
  readonly role = input.required<Role>();
  readonly sent = output<Application>();

  private readonly applications = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly coverNote = signal('');
  protected readonly cv = signal<CvFile | null>(null);
  protected readonly cvRejection = signal<string | null>(null);
  protected readonly tried = signal(false);
  protected readonly submitting = signal(false);
  protected readonly saveFailed = signal(false);

  protected readonly maxCoverNote = MAX_COVER_NOTE;
  protected readonly failureMessage = FAILURE_MESSAGE;

  private readonly draft = computed<ApplicationDraft>(() => ({
    fullName: this.fullName(),
    email: this.email(),
    coverNote: this.coverNote(),
    cv: this.cv(),
  }));

  /** Errors appear only after the first send attempt, then track every change live (FR-005, FR-007). */
  protected readonly errors = computed<FieldErrors>(() =>
    this.tried() ? validateApplication(this.draft()) : {},
  );
  protected readonly errorCount = computed(() => Object.keys(this.errors()).length);
  protected readonly summaryHeading = computed(() =>
    this.errorCount() === 1
      ? 'One thing needs fixing before you can send this.'
      : 'A few things need fixing before you can send this.',
  );
  /** A rejected file's reason shows straight away and takes priority (FR-005 exception). */
  protected readonly cvMessage = computed(() => this.cvRejection() ?? this.errors().cv);
  protected readonly cvHint = computed(() => this.cvMessage() ?? CV_HINT);
  protected readonly noteHint = computed(() =>
    this.coverNote().length === 0
      ? 'Up to 500 characters.'
      : `${this.coverNote().length} / ${MAX_COVER_NOTE} characters`,
  );
  protected readonly notePlaceholder = computed(
    () =>
      `Anything you'd like ${this.role().hiringManager.name.split(' ')[0]} to know before reading your CV.`,
  );

  private readonly summary = viewChild<Alert>('summary');
  private readonly failure = viewChild<Alert>('failure');

  protected chooseCv(file: CvFile | null): void {
    this.cv.set(file);
    this.cvRejection.set(null);
  }

  protected send(event: Event): void {
    event.preventDefault();
    if (this.submitting()) return;
    this.saveFailed.set(false);

    const cv = this.cv();
    if (!cv || this.errorCountFor(this.draft()) > 0) {
      this.tried.set(true);
      this.focusAfterRender(() => this.summary()?.focus());
      return;
    }

    this.submitting.set(true);
    this.applications
      .submit({
        role: this.role(),
        fullName: this.fullName(),
        email: this.email(),
        coverNote: this.coverNote(),
        cv,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (application) => this.sent.emit(application),
        error: () => {
          this.submitting.set(false);
          this.saveFailed.set(true);
          this.focusAfterRender(() => this.failure()?.focus());
        },
      });
  }

  private errorCountFor(draft: ApplicationDraft): number {
    return Object.keys(validateApplication(draft)).length;
  }

  private focusAfterRender(focus: () => void): void {
    afterNextRender(focus, { injector: this.injector });
  }
}
