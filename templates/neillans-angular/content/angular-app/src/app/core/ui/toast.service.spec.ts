import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let toasts: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    toasts = TestBed.inject(ToastService);
  });

  afterEach(() => vi.useRealTimers());

  it('adds a toast and removes it after the timeout', () => {
    toasts.success('Saved', 'All good');
    expect(toasts.toasts()).toEqual([
      expect.objectContaining({ kind: 'success', title: 'Saved', text: 'All good' }),
    ]);
    vi.advanceTimersByTime(5000);
    expect(toasts.toasts()).toEqual([]);
  });

  it('keeps errors up longer', () => {
    toasts.error('Failed');
    vi.advanceTimersByTime(5000);
    expect(toasts.toasts().length).toBe(1);
    vi.advanceTimersByTime(3000);
    expect(toasts.toasts()).toEqual([]);
  });

  it('keeps a toast with no timeout until dismissed', () => {
    const id = toasts.show('info', 'Sticky', undefined, 0);
    vi.advanceTimersByTime(60_000);
    expect(toasts.toasts().length).toBe(1);
    toasts.dismiss(id);
    expect(toasts.toasts()).toEqual([]);
  });
});
