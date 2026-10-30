/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import '../test/polyfills';
import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportTicketsView } from './SupportTicketsView';
import {
  renderWithProviders,
  authenticatedAuthState,
} from '../test/test-utils';
import {
  useGetSupportTicketsQuery,
  useGetSupportTicketCategoriesQuery,
  useCreateSupportTicketMutation,
  SupportTicket,
} from '../services/supportTicketApi';

jest.mock('../services/baseApi', () => ({
  baseApi: {
    reducerPath: 'srgApi',
    reducer: (state: unknown = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
    util: { resetApiState: () => ({ type: 'srgApi/resetApiState' }) },
  },
  getApiBaseUrl: () => '',
}));

jest.mock('../services/supportTicketApi', () => ({
  useGetSupportTicketsQuery: jest.fn(),
  useGetSupportTicketCategoriesQuery: jest.fn(),
  useCreateSupportTicketMutation: jest.fn(),
  SupportTicket: {},
}));

const ticketsQuery = useGetSupportTicketsQuery as jest.Mock;
const categoriesQuery = useGetSupportTicketCategoriesQuery as jest.Mock;
const createMutation = useCreateSupportTicketMutation as jest.Mock;

const queryResult = (overrides: Record<string, unknown> = {}) => ({
  data: [],
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

let createTicketMock: jest.Mock;

const renderView = (setToastMsg = jest.fn()) => {
  const utils = renderWithProviders(
    <SupportTicketsView setToastMsg={setToastMsg} />,
    {
      preloadedState: { auth: authenticatedAuthState({ role: 'CANDIDATE' }) },
    }
  );
  return { setToastMsg, ...utils };
};

describe('SupportTicketsView', () => {
  beforeEach(() => {
    ticketsQuery.mockReturnValue(queryResult());
    categoriesQuery.mockReturnValue({ data: [] });
    createTicketMock = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({ message: 'ok' }),
    });
    createMutation.mockReturnValue([createTicketMock, { isLoading: false }]);
  });

  it('renders the card title', () => {
    renderView();
    expect(
      screen.getByRole('heading', { name: /Support Tickets/ })
    ).toBeInTheDocument();
  });

  it('shows the empty state when there are no tickets', () => {
    renderView();
    expect(screen.getByText(/No tickets yet/)).toBeInTheDocument();
  });

  it('shows the loader while loading', () => {
    ticketsQuery.mockReturnValue(queryResult({ isLoading: true }));
    renderView();
    expect(screen.getByText('Shree Swami Samarth...')).toBeInTheDocument();
  });

  it('shows an alert on error', () => {
    ticketsQuery.mockReturnValue(queryResult({ isError: true }));
    renderView();
    expect(screen.getByText(/Failed to load tickets/)).toBeInTheDocument();
  });

  it('renders a list of tickets with priority and status badges', () => {
    const tickets: Partial<SupportTicket>[] = [
      {
        id: 1,
        ticketId: 101,
        subject: 'Login issue',
        categoryName: 'Account',
        priority: 'High',
        status: 'Open',
        description: 'Cannot login to my account',
        createdDate: '2024-01-01',
      },
    ];
    ticketsQuery.mockReturnValue(queryResult({ data: tickets }));
    renderView();

    expect(screen.getByText(/Login issue/)).toBeInTheDocument();
    expect(screen.getByText(/#101/)).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Cannot login to my account')).toBeInTheDocument();
  });

  it('opens the create-ticket form and updates the description character counter', async () => {
    renderView();

    await userEvent.click(screen.getAllByRole('button', { name: /Create Ticket/ })[0]);

    expect(screen.getByText('0/4000')).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Describe your issue/);
    await userEvent.type(textarea, 'abc');

    expect(screen.getByText('3/4000')).toBeInTheDocument();
  });

  it('validates that subject and description are required on submit', async () => {
    const { setToastMsg, container } = renderView();

    await userEvent.click(screen.getAllByRole('button', { name: /Create Ticket/ })[0]);
    fireEvent.submit(container.querySelector('form')!);

    expect(setToastMsg).toHaveBeenCalledWith(
      expect.stringContaining('Please fill in subject and description')
    );
    expect(createTicketMock).not.toHaveBeenCalled();
  });

  it('submits a filled ticket and reports the server message', async () => {
    const { setToastMsg, container } = renderView();

    await userEvent.click(screen.getAllByRole('button', { name: /Create Ticket/ })[0]);
    await userEvent.type(screen.getByPlaceholderText(/Ticket subject/), 'My issue');
    await userEvent.type(screen.getByPlaceholderText(/Describe your issue/), 'More details');
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => expect(createTicketMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(setToastMsg).toHaveBeenCalledWith('ok'));
  });
});
