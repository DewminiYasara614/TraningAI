import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { StorageService } from '../../../core/storage/storage.service';
import { SEED_JOB } from '../data/seed-job';
import { Role } from '../models/role.model';

export const JOB_KEY = 'job';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly storage = inject(StorageService);

  /**
   * The advertised role. Seeds SEED_JOB into storage on first load (or when the stored copy is out of
   * date) and falls back to SEED_JOB if storage can't be written.
   */
  current(): Observable<Role> {
    return this.storage.read<Role | null>(JOB_KEY, null).pipe(
      switchMap((stored) =>
        JSON.stringify(stored) === JSON.stringify(SEED_JOB)
          ? of(stored as Role)
          : this.storage.write(JOB_KEY, SEED_JOB).pipe(
              map(() => SEED_JOB),
              catchError(() => of(SEED_JOB)),
            ),
      ),
    );
  }
}
