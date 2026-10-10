import { TestBed } from '@angular/core/testing';
import { provideTranslocoTesting } from '../../../testing/transloco-testing';
import { ConfirmService } from '../../core/ui/confirm.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideTranslocoTesting()] }));

  async function open(kind?: 'danger') {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const confirm = TestBed.inject(ConfirmService);
    const answer = confirm.ask({ title: 'Delete?', message: 'Gone for good.', kind });
    await fixture.whenStable();
    return { element: fixture.nativeElement as HTMLElement, answer };
  }

  it('renders the request and focuses Cancel', async () => {
    const { element } = await open('danger');
    expect(element.querySelector('.modal-title')?.textContent).toContain('Delete?');
    expect(element.querySelector('.btn-danger')?.textContent).toContain('Confirm');
    expect(document.activeElement?.textContent).toContain('Cancel');
  });

  it('confirms from the confirm button', async () => {
    const { element, answer } = await open();
    element.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await expect(answer).resolves.toBe(true);
  });

  it('cancels on Escape', async () => {
    const { answer } = await open();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await expect(answer).resolves.toBe(false);
  });
});
