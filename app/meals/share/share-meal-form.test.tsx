import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormState } from 'react-dom';

import ShareMealForm from './share-meal-form';

const mockShareFormAction = jest.fn();
const mockImageFormAction = jest.fn();

jest.mock('@/app/actions/meals', () => ({
  shareMeal: jest.fn(),
  generateMealImage: jest.fn(),
}));

jest.mock('@/components/ui/loading-overlay', () => ({
  __esModule: true,
  default: ({ message = 'Loading...' }: { message?: string }) => <div>{message}</div>,
}));

jest.mock('@/components/meals/image-picker', () => ({
  __esModule: true,
  default: ({
    label,
    name,
    required,
    onImagePick,
  }: {
    label: string;
    name: string;
    required?: boolean;
    onImagePick?: () => void;
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type="file"
        data-testid="image-input"
        aria-required={required}
        onChange={() => onImagePick?.()}
      />
    </div>
  ),
}));

jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    useFormState: jest.fn(),
  };
});

describe('ShareMealForm', () => {
  const useFormStateMock = useFormState as unknown as jest.Mock;
  const originalConsoleError = console.error;
  let consoleErrorSpy: jest.SpyInstance;

  function submitFormWithButton(buttonName: string) {
    const button = screen.getByRole('button', { name: buttonName });
    const form = button.closest('form');

    if (!form) {
      throw new Error('Expected form to exist');
    }

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(submitEvent, 'submitter', {
      value: button,
    });

    fireEvent(form, submitEvent);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const firstArg = args[0];

      if (typeof firstArg === 'string' && firstArg.includes('Invalid value for prop')) {
        return;
      }

      originalConsoleError(...(args as Parameters<typeof console.error>));
    });

    let callIndex = 0;
    useFormStateMock.mockImplementation((_, initialState) => {
      callIndex += 1;

      if (callIndex === 1) {
        return [{ message: null }, mockShareFormAction];
      }

      if (callIndex === 2) {
        return [{ message: null, imagePath: '', requestId: 0 }, mockImageFormAction];
      }

      return [initialState, jest.fn()];
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('shows frontend message and blocks generate when title/summary are empty', async () => {
    render(<ShareMealForm />);

    submitFormWithButton('Generate with AI');

    expect(
      screen.getByText('Please fill in title and summary before generating an image.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate with AI' })).toBeInTheDocument();
  });

  it('switches generate button text to Generating... when title and summary are filled', async () => {
    const user = userEvent.setup();
    render(<ShareMealForm />);

    await user.type(screen.getByLabelText('Title'), 'Pizza');
    await user.type(screen.getByLabelText('Short Summary'), 'Cheesy and crispy');

    submitFormWithButton('Generate with AI');

    expect(screen.getByRole('button', { name: 'Generating...' })).toBeInTheDocument();
  });

  it('shows frontend message and blocks share when no uploaded/applied image exists', async () => {
    const user = userEvent.setup();
    render(<ShareMealForm />);

    await user.type(screen.getByLabelText('Title'), 'Salad');
    await user.type(screen.getByLabelText('Short Summary'), 'Fresh and green');
    await user.type(screen.getByLabelText('Instructions'), 'Mix all ingredients.');

    submitFormWithButton('Share Meal');

    expect(screen.getByText('Please pick an image or generate one with AI.')).toBeInTheDocument();
    expect(mockShareFormAction).not.toHaveBeenCalled();
  });

  it('starts submitting when share is valid and image is uploaded', async () => {
    const user = userEvent.setup();
    render(<ShareMealForm />);

    await user.type(screen.getByLabelText('Title'), 'Soup');
    await user.type(screen.getByLabelText('Short Summary'), 'Warm and cozy');
    await user.type(screen.getByLabelText('Instructions'), 'Boil and serve.');

    const imageInput = screen.getByTestId('image-input') as HTMLInputElement;
    const file = new File(['image-bytes'], 'meal.jpg', { type: 'image/jpeg' });
    await user.upload(imageInput, file);

    submitFormWithButton('Share Meal');

    expect(screen.getByRole('button', { name: 'Submitting...' })).toBeInTheDocument();
  });
});
