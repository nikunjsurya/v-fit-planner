import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import WorkoutsTab from './WorkoutsTab';

// Guards added in the senior-QA pass: workout edit must reject blank /
// whitespace-only names. The same path is the only one that mutates the
// canonical workouts list from the UI, so a regression here is high-
// impact (the bad name would propagate to sidebar, missed banner, and
// every tracking FK).
describe('WorkoutsTab edit guard', () => {
  beforeEach(() => {
    // window.alert isn't implemented in jsdom and would throw "not
    // implemented"; stub it so we can assert on the call.
    window.alert = vi.fn();
  });

  it('alerts and does not save when name is blanked out', async () => {
    render(
      <AppProvider>
        <WorkoutsTab />
      </AppProvider>,
    );

    // Open the first workout card. The card root is the title's nearest
    // clickable div; clicking the title itself bubbles up to the card's
    // onClick.
    const dayTitles = screen.getAllByRole('heading', { name: /day \d/i });
    expect(dayTitles.length).toBeGreaterThan(0);
    fireEvent.click(dayTitles[0]!);

    // Enter edit mode.
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    // Clear the workout name. The first text input in edit mode is the
    // workout name field.
    const nameInput = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: '   ' } });

    // Click Save.
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    // The guard fires alert + bails.
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/workout name cannot be empty/i),
    );

    // Edit mode should still be open (Save was rejected, not committed).
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
