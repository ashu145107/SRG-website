/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { LifeBuoy, Plus, RefreshCw, Send, X } from 'lucide-react';
import { RootState } from '../store';
import { PrimaryButton, SecondaryButton, IconButton } from './ui/Buttons';
import { TextBox, TextArea } from './ui/Inputs';
import { Dropdown } from './ui/SelectionControls';
import { Card, EmptyState, Badge } from './ui/DataComponents';
import { Loader, Alert } from './ui/FeedbackComponents';
import {
  useGetSupportTicketsQuery,
  useGetSupportTicketCategoriesQuery,
  useCreateSupportTicketMutation,
  SupportTicket
} from '../services/supportTicketApi';

const MAX_TICKET_DESCRIPTION_LENGTH = 4000;

const priorityBadgeType = (priority?: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
  const p = (priority || '').toLowerCase();
  if (p.includes('high') || p.includes('urgent')) return 'danger';
  if (p.includes('low')) return 'success';
  if (p.includes('medium') || p.includes('normal')) return 'warning';
  return 'secondary';
};

interface SupportTicketsViewProps {
  setToastMsg: (msg: string) => void;
  createdBy?: number;
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({ setToastMsg, createdBy }) => {
  const { t } = useTranslation();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const createdById = createdBy || Number(authUser?.id) || 0;
  const { data: tickets = [], isLoading, isFetching, isError, refetch } = useGetSupportTicketsQuery();
  const { data: categories = [] } = useGetSupportTicketCategoriesQuery();
  const [createTicket, { isLoading: isCreating }] = useCreateSupportTicketMutation();

  const [showForm, setShowForm] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  const PRIORITY_OPTIONS = [
    { value: 'Low', label: t('tickets.priorityOptions.low') },
    { value: 'Medium', label: t('tickets.priorityOptions.medium') },
    { value: 'High', label: t('tickets.priorityOptions.high') }
  ];

  const resetForm = () => {
    setCategoryId('');
    setSubject('');
    setDescription('');
    setPriority('Medium');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setToastMsg('ERROR:' + t('tickets.errors.fillSubjectAndDescription'));
      return;
    }
    if (description.length > MAX_TICKET_DESCRIPTION_LENGTH) {
      setToastMsg('ERROR:' + t('tickets.errors.descriptionTooLong', { max: MAX_TICKET_DESCRIPTION_LENGTH }));
      return;
    }
    try {
      const result = await createTicket({
        categoryId: categoryId ? Number(categoryId) : 0,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        createdBy: createdById
      }).unwrap();
      setToastMsg(result.message || t('tickets.created'));
      resetForm();
      setShowForm(false);
      refetch();
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.data?.error?.message ||
        (typeof err?.data === 'string' ? err.data : '') ||
        err?.error ||
        'Failed to create support ticket.';
      setToastMsg(`ERROR:${message}`);
    }
  };

  const categoryOptions = [
    { value: '', label: t('tickets.selectCategory') },
    ...categories.map((c) => ({ value: String(c.id), label: c.name }))
  ];

  return (
    <Card title={t('tickets.title')} className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-xs text-slate-500 font-medium">
          {t('tickets.subtitle')}
        </p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <IconButton
            icon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            title={t('tickets.refresh')}
            disabled={isFetching}
          />
          <PrimaryButton
            type="button"
            className="flex-1 sm:flex-none !px-4 !py-2 text-xs"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? t('tickets.cancel') : t('tickets.createTicket')}
          </PrimaryButton>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4 text-left">
          <Dropdown
            label={t('tickets.category')}
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
          <TextBox
            label={t('tickets.subject')}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={t('tickets.subjectPlaceholder')}
            required
          />
          <TextArea
            label={t('tickets.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('tickets.descriptionPlaceholder')}
            maxLength={MAX_TICKET_DESCRIPTION_LENGTH}
            showCount
            required
          />
          <Dropdown
            label={t('tickets.priority')}
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <PrimaryButton type="submit" loading={isCreating} className="w-full sm:w-auto !px-5 !py-2.5 text-xs">
              <Send className="w-4 h-4" /> {t('tickets.submit')}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              className="w-full sm:w-auto !px-5 !py-2.5 text-xs"
              onClick={() => { setShowForm(false); resetForm(); }}
            >
              {t('tickets.cancel')}
            </SecondaryButton>
          </div>
        </form>
      )}

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Alert
          type="danger"
          title={t('tickets.loadError')}
          message="Please check your connection and try again."
        />
      ) : tickets.length === 0 ? (
        !showForm && (
          <div className="space-y-4">
            <EmptyState
              title={t('tickets.emptyTitle')}
              desc={t('tickets.emptyDesc')}
            />
            <div className="flex justify-center">
              <PrimaryButton
                type="button"
                className="w-full sm:w-auto !px-5 !py-2.5 text-xs"
                onClick={() => setShowForm(true)}
              >
                <LifeBuoy className="w-4 h-4" /> {t('tickets.createTicket')}
              </PrimaryButton>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: SupportTicket) => (
            <div
              key={ticket.id}
              className="p-4 bg-white border border-slate-100 rounded-xl text-left space-y-2 hover:border-orange-200 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 break-words">
                    {ticket.subject}
                    {ticket.ticketId ? <span className="text-slate-400 font-medium"> · #{ticket.ticketId}</span> : null}
                  </h4>
                  {ticket.categoryName && (
                    <span className="text-[11px] text-slate-500 font-semibold">{ticket.categoryName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:shrink-0">
                  {ticket.priority && (
                    <Badge type={priorityBadgeType(ticket.priority)}>{ticket.priority}</Badge>
                  )}
                  {ticket.status && <Badge type="secondary">{ticket.status}</Badge>}
                </div>
              </div>
              {ticket.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 break-words">{ticket.description}</p>
              )}
              {ticket.createdDate && (
                <p className="text-[10px] text-slate-400 font-mono">{ticket.createdDate}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
