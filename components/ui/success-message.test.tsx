import { act, fireEvent, render, screen } from '@testing-library/react';

import SuccessMessage from './success-message';

describe('SuccessMessage', () => {
  it('renders the provided message', () => {
    render(<SuccessMessage message="Saved successfully" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(<SuccessMessage message="Saved successfully" />);

    fireEvent.click(screen.getByRole('button', { name: 'Close message' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('auto dismisses after 5 seconds', () => {
    jest.useFakeTimers();

    render(<SuccessMessage message="Saved successfully" />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    jest.useRealTimers();
  });
});
