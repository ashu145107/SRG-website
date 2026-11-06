/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  getApiBaseUrl: () => '',
}));

jest.mock('react-router-dom', () => {
  const util = require('util');
  (global as any).TextEncoder = (global as any).TextEncoder || util.TextEncoder;
  (global as any).TextDecoder = (global as any).TextDecoder || util.TextDecoder;
  return jest.requireActual('react-router-dom');
});

import React from 'react';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from './NotificationBell';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  AppNotification,
} from '../services/notificationService';
import {
  makeStore,
  authenticatedAuthState,
  defaultAuthState,
  TestAuthState,
} from '../test/test-utils';

jest.mock('../services/notificationService', () => ({
  fetchNotifications: jest.fn(),
  markNotificationRead: jest.fn(),
  markAllNotificationsRead: jest.fn(),
}));

const mockedFetch = fetchNotifications as jest.MockedFunction<typeof fetchNotifications>;
const mockedMarkRead = markNotificationRead as jest.MockedFunction<typeof markNotificationRead>;
const mockedMarkAll = markAllNotificationsRead as jest.MockedFunction<typeof markAllNotificationsRead>;

const notification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'n1',
  title: 'A notification',
  message: 'Details here',
  isRead: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

function renderBell(
  preloadedState: Partial<{ auth: TestAuthState }>,
  variant: 'light' | 'dark' = 'light'
) {
  const store = makeStore(preloadedState);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchInterval: false } },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <MemoryRouter>
          <NotificationBell variant={variant} />
        </MemoryRouter>
      </Provider>
    </QueryClientProvider>
  );
  return { ...utils, queryClient };
}

describe('NotificationBell', () => {
  beforeEach(() => {
    mockedMarkRead.mockResolvedValue();
    mockedMarkAll.mockResolvedValue();
  });

  it('renders nothing and does not fetch when unauthenticated', () => {
    const { container } = renderBell({ auth: defaultAuthState });

    expect(container).toBeEmptyDOMElement();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('fetches notifications on mount and shows unread status before the bell is opened', async () => {
    mockedFetch.mockResolvedValue([notification()]);
    renderBell({ auth: authenticatedAuthState() });

    const bell = screen.getByRole('button', { name: 'Notifications' });
    await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
    await waitFor(() => expect(bell.querySelector('span')).toBeInTheDocument());
  });

  it('shows a loading state while notifications are pending', async () => {
    mockedFetch.mockReturnValue(new Promise<AppNotification[]>(() => {}));
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByText('Shree Swami Samarth...')).toBeInTheDocument();
  });

  it('shows an empty state when there are no notifications', async () => {
    mockedFetch.mockResolvedValue([]);
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByText('No notifications yet')).toBeInTheDocument();
  });

  it('opens the panel and lists notifications with an unread badge', async () => {
    mockedFetch.mockResolvedValue([
      notification({ id: 'a', title: 'First alert', isRead: false }),
      notification({ id: 'b', title: 'Second alert', isRead: true }),
    ]);
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByText('First alert')).toBeInTheDocument();
    expect(screen.getByText('Second alert')).toBeInTheDocument();
    expect(screen.getByText('1 new')).toBeInTheDocument();
    expect(screen.getByText('2 notifications')).toBeInTheDocument();
  });

  it('marks a notification read when it is clicked', async () => {
    mockedFetch.mockResolvedValue([notification({ id: 'abc', title: 'Click me', isRead: false })]);
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    await userEvent.click(await screen.findByText('Click me'));

    await waitFor(() => expect(mockedMarkRead).toHaveBeenCalledWith('abc'));
  });

  it('marks all notifications read from the header action', async () => {
    mockedFetch.mockResolvedValue([
      notification({ id: 'a', isRead: false }),
      notification({ id: 'b', isRead: false }),
    ]);
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    await userEvent.click(await screen.findByRole('button', { name: /Mark all read/i }));

    await waitFor(() => expect(mockedMarkAll).toHaveBeenCalledTimes(1));
  });

  it('disables "Mark all read" when nothing is unread', async () => {
    mockedFetch.mockResolvedValue([notification({ id: 'a', isRead: true })]);
    renderBell({ auth: authenticatedAuthState() });

    await userEvent.click(screen.getByRole('button', { name: 'Notifications' }));

    expect(await screen.findByRole('button', { name: /Mark all read/i })).toBeDisabled();
  });
});
