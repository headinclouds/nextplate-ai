import { fireEvent, render, screen } from '@testing-library/react';

import Pagination from './pagination';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('Pagination', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders nothing when only one page exists', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders current page and navigation controls', () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '← Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('navigates to the clicked page', () => {
    render(<Pagination currentPage={2} totalPages={5} />);

    fireEvent.click(screen.getByRole('button', { name: '3' }));

    expect(pushMock).toHaveBeenCalledWith('/meals?page=3');
  });
});
