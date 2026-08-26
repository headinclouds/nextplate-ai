import { render, screen } from '@testing-library/react';

import LoadingOverlay from './loading-overlay';

describe('LoadingOverlay', () => {
  it('renders default loading message', () => {
    render(<LoadingOverlay />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom loading message', () => {
    render(<LoadingOverlay message="Generating image..." />);

    expect(screen.getByText('Generating image...')).toBeInTheDocument();
  });
});
