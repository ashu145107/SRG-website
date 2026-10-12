/**
 * Support tickets API.
 *
 * - GET  /api/v1/supporttickets           → list current user's tickets
 * - GET  /api/v1/supportticketcategorys   → ticket category dropdown
 * - POST /api/v1/createsupportticket      → create a new ticket
 *
 * Auth is attached automatically by baseApi (Bearer token from auth state).
 */

import { baseApi } from './baseApi';

export interface SupportTicket {
  id: number;
  ticketId?: number;
  categoryId?: number;
  categoryName?: string;
  subject: string;
  description?: string;
  priority?: string;
  status?: string;
  createdBy?: number;
  createdDate?: string;
}

export interface SupportTicketCategory {
  id: number;
  name: string;
}

export interface CreateSupportTicketPayload {
  categoryId: number;
  subject: string;
  description: string;
  priority: string;
  createdBy: number;
}

const extractList = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const direct = data.value ?? data.data ?? data.items ?? data.results ?? data.tickets ?? data.supportTickets;
  if (Array.isArray(direct)) return direct;
  if (direct && typeof direct === 'object') {
    const nested = direct.data ?? direct.items ?? direct.list ?? direct.results ?? direct.tickets;
    if (Array.isArray(nested)) return nested;
  }
  return [];
};

export const supportTicketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportTickets: builder.query<SupportTicket[], void>({
      query: () => '/api/v1/supporttickets',
      transformResponse: (data: any): SupportTicket[] =>
        extractList(data).map((t: any, idx: number): SupportTicket => {
          const rawId = t.supportTicketId ?? t.ticketId ?? t.id ?? idx + 1;
          return {
            id: Number(rawId) || idx + 1,
            ticketId: Number(rawId) || undefined,
            categoryId: Number(t.categoryId ?? t.supportTicketCategoryId ?? t.ticketCategoryId ?? 0) || undefined,
            categoryName: t.categoryName || t.supportTicketCategory || t.category || '',
            subject: String(t.subject || t.title || 'Support Ticket'),
            description: t.description || t.details || '',
            priority: t.priority || t.priorityName || '',
            status: t.status || t.statusName || t.ticketStatus || '',
            createdBy: Number(t.createdBy ?? t.userId ?? 0) || undefined,
            createdDate: t.createdDate || t.createdOn || t.createdAt || t.date || ''
          };
        }),
      providesTags: ['SupportTicket']
    }),

    getSupportTicketCategories: builder.query<SupportTicketCategory[], void>({
      query: () => '/api/v1/supportticketcategorys',
      transformResponse: (data: any): SupportTicketCategory[] =>
        extractList(data)
          .map((c: any, idx: number): SupportTicketCategory => ({
            id: Number(c.supportTicketCategoryId ?? c.categoryId ?? c.id ?? idx + 1) || idx + 1,
            name: String(c.categoryName || c.name || c.category || c.categoryTitle || '').trim()
          }))
          .filter((c) => c.name)
    }),

    createSupportTicket: builder.mutation<{ success: boolean; message: string }, CreateSupportTicketPayload>({
      query: (body) => ({
        url: '/api/v1/createsupportticket',
        method: 'POST',
        body
      }),
      transformResponse: (data: any) => {
        if (typeof data === 'string') {
          return { success: true, message: data.trim() || 'Support ticket created successfully.' };
        }
        const success = data?.isSuccess !== false && data?.isFailure !== true;
        const message =
          (typeof data?.value === 'string' && data.value) ||
          data?.message ||
          data?.error?.message ||
          (success ? 'Support ticket created successfully.' : 'Failed to create support ticket.');
        return { success, message };
      },
      invalidatesTags: ['SupportTicket']
    })
  })
});

export const {
  useGetSupportTicketsQuery,
  useGetSupportTicketCategoriesQuery,
  useCreateSupportTicketMutation
} = supportTicketApi;
