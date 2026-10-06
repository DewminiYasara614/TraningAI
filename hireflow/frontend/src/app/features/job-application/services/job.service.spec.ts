import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_JOB } from '../data/seed-job';
import { JobService } from './job.service';

describe('JobService', () => {
  let service: JobService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(JobService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('seeds the role into "job" on first load', async () => {
    expect(await firstValueFrom(service.current())).toEqual(SEED_JOB);
    expect(JSON.parse(localStorage.getItem('job')!)).toEqual(SEED_JOB);
  });

  it('re-seeds an out-of-date or malformed stored role', async () => {
    localStorage.setItem('job', JSON.stringify({ ...SEED_JOB, closesOn: '2026-08-29' }));
    expect((await firstValueFrom(service.current())).closesOn).toBe('2026-11-27');

    localStorage.setItem('job', '{broken');
    expect(await firstValueFrom(service.current())).toEqual(SEED_JOB);
  });

  it('falls back to the seed when storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(await firstValueFrom(service.current())).toEqual(SEED_JOB);
  });
});
