import { render } from '@testing-library/react';
import ReactGA from 'react-ga4';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { GoogleAnalytics } from '../google-analytics';

const mockSubscribe = vi.fn();
const mockRouter = {
  subscribe: mockSubscribe,
};

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('react-ga4', () => ({
  default: {
    isInitialized: false,
    send: vi.fn(),
  },
}));

describe('GoogleAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ReactGA.isInitialized = false;
    (ReactGA.send as ReturnType<typeof vi.fn>).mockClear();
  });

  test('renders nothing', () => {
    const { container } = render(<GoogleAnalytics />);
    expect(container.firstChild).toBeNull();
  });

  test('does not subscribe when not initialized', () => {
    ReactGA.isInitialized = false;
    render(<GoogleAnalytics />);

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  test('subscribes to router when initialized', () => {
    ReactGA.isInitialized = true;
    render(<GoogleAnalytics />);

    expect(mockSubscribe).toHaveBeenCalledWith(
      'onResolved',
      expect.any(Function),
    );
  });

  test('sends pageview on pathChanged', () => {
    ReactGA.isInitialized = true;
    render(<GoogleAnalytics />);

    const callback = mockSubscribe.mock.calls[0][1];

    // Simulate path change
    callback({
      pathChanged: true,
      toLocation: {
        pathname: '/test-path',
      },
    });

    expect(ReactGA.send).toHaveBeenCalledWith({
      hitType: 'pageview',
      page: '/test-path',
    });
  });

  test('does not send pageview when path has not changed', () => {
    ReactGA.isInitialized = true;
    render(<GoogleAnalytics />);

    const callback = mockSubscribe.mock.calls[0][1];

    // Simulate no path change (search param change only)
    callback({
      pathChanged: false,
      toLocation: {
        pathname: '/',
      },
    });

    expect(ReactGA.send).not.toHaveBeenCalled();
  });

  test('cleanup unsubscribes on unmount', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    ReactGA.isInitialized = true;
    const { unmount } = render(<GoogleAnalytics />);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test('does not cleanup when not initialized', () => {
    const mockUnsubscribe = vi.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    ReactGA.isInitialized = false;
    const { unmount } = render(<GoogleAnalytics />);

    unmount();

    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });
});
