import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StorageError } from './storage-error';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(StorageService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('round-trips JSON values', async () => {
    await firstValueFrom(service.write('applications', [{ id: 'a1' }]));

    expect(await firstValueFrom(service.read('applications', []))).toEqual([{ id: 'a1' }]);
    expect(localStorage.getItem('applications')).toBe('[{"id":"a1"}]');
  });

  it('returns the fallback for a missing or malformed value', async () => {
    expect(await firstValueFrom(service.read('applications', []))).toEqual([]);

    localStorage.setItem('applications', '{not json');
    expect(await firstValueFrom(service.read('applications', ['fallback']))).toEqual(['fallback']);
  });

  it('does nothing until subscribed', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    service.write('applications', []);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('maps a quota error to StorageError("quota")', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });

    const error = await firstValueFrom(service.write('applications', [])).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(StorageError);
    expect((error as StorageError).kind).toBe('quota');
  });

  it('maps a security error to StorageError("unavailable") and anything else to "unknown"', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');

    setItem.mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    await expect(firstValueFrom(service.write('k', 1))).rejects.toMatchObject({
      kind: 'unavailable',
    });

    setItem.mockImplementation(() => {
      throw new Error('boom');
    });
    await expect(firstValueFrom(service.write('k', 1))).rejects.toMatchObject({ kind: 'unknown' });
  });
});
