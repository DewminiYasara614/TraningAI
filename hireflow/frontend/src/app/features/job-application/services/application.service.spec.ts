import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageError } from '../../../core/storage/storage-error';
import { SEED_JOB } from '../data/seed-job';
import { APPLICATION_LATENCY_MS, ApplicationService } from './application.service';

const input = {
  role: SEED_JOB,
  fullName: '  Ravi Shah ',
  email: ' ravi@example.com ',
  coverNote: 'Hello Dana.',
  cv: { name: 'cv.pdf', sizeBytes: 1000, type: 'pdf' as const },
};

describe('ApplicationService', () => {
  let service: ApplicationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: APPLICATION_LATENCY_MS, useValue: 0 }],
    });
    service = TestBed.inject(ApplicationService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('trims, stamps id, job title and time, and appends to "applications"', async () => {
    const saved = await firstValueFrom(service.submit(input));

    expect(saved).toMatchObject({
      roleId: 'northgate-senior-dotnet',
      jobTitle: 'Senior .NET Engineer (Remote, UK)',
      fullName: 'Ravi Shah',
      email: 'ravi@example.com',
      coverNote: 'Hello Dana.',
      cv: { name: 'cv.pdf', sizeBytes: 1000, type: 'pdf' },
    });
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Number.isNaN(Date.parse(saved.submittedAt))).toBe(false);
    expect(JSON.parse(localStorage.getItem('applications')!)).toEqual([saved]);
  });

  it('keeps earlier applications (persistence across submissions)', async () => {
    const first = await firstValueFrom(service.submit(input));
    const second = await firstValueFrom(service.submit({ ...input, fullName: 'Asha Patel' }));

    expect(await firstValueFrom(service.all())).toEqual([first, second]);
    expect(await firstValueFrom(service.byId(second.id))).toEqual(second);
    expect(await firstValueFrom(service.byId('nope'))).toBeUndefined();
  });

  it('treats a non-array stored value as empty', async () => {
    localStorage.setItem('applications', '{"id":"x"}');
    expect(await firstValueFrom(service.all())).toEqual([]);
  });

  it('never stores CV contents', async () => {
    await firstValueFrom(
      service.submit({ ...input, cv: { ...input.cv, contents: 'secret' } as never }),
    );
    expect(localStorage.getItem('applications')).not.toContain('secret');
  });

  it('errors with StorageError when the save fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    await expect(firstValueFrom(service.submit(input))).rejects.toBeInstanceOf(StorageError);
  });
});
