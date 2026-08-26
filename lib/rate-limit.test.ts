import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
  it('allows requests up to the limit and blocks the next one', () => {
    const id = `test-user-${Date.now()}-${Math.random()}`;

    const first = checkRateLimit(id, 2, 1000);
    const second = checkRateLimit(id, 2, 1000);
    const third = checkRateLimit(id, 2, 1000);

    expect(first.success).toBe(true);
    expect(first.remaining).toBe(1);

    expect(second.success).toBe(true);
    expect(second.remaining).toBe(0);

    expect(third.success).toBe(false);
    expect(third.remaining).toBe(0);
    expect(third.resetTime).toBeInstanceOf(Date);
  });

  it('allows requests again after the time window passes', () => {
    const nowSpy = jest.spyOn(Date, 'now');
    let now = 1000;
    nowSpy.mockImplementation(() => now);

    const id = `window-user-${Math.random()}`;

    const first = checkRateLimit(id, 1, 1000);
    now = 1500;
    const blocked = checkRateLimit(id, 1, 1000);
    now = 2101;
    const allowedAgain = checkRateLimit(id, 1, 1000);

    expect(first.success).toBe(true);
    expect(blocked.success).toBe(false);
    expect(allowedAgain.success).toBe(true);

    nowSpy.mockRestore();
  });
});
