import { TestBed } from '@angular/core/testing';
import { ConfirmService } from './confirm.service';

describe('ConfirmService', () => {
  let confirm: ConfirmService;

  beforeEach(() => (confirm = TestBed.inject(ConfirmService)));

  it('resolves with the response and clears the request', async () => {
    const answer = confirm.ask({ title: 'Delete?', message: 'Sure?' });
    expect(confirm.current()?.title).toBe('Delete?');
    confirm.respond(true);
    await expect(answer).resolves.toBe(true);
    expect(confirm.current()).toBeNull();
  });

  it('cancels an open request when a new one arrives', async () => {
    const first = confirm.ask({ title: 'First', message: '' });
    const second = confirm.ask({ title: 'Second', message: '' });
    await expect(first).resolves.toBe(false);
    expect(confirm.current()?.title).toBe('Second');
    confirm.respond(true);
    await expect(second).resolves.toBe(true);
  });
});
