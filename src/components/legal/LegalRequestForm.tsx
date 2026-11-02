import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send } from 'lucide-react';

interface LegalRequestFormProps {
  kind: 'dsar' | 'grievance';
}

const GRIEVANCE_EMAIL = 'admin@dindoripranit.org';

export function LegalRequestForm({ kind }: LegalRequestFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('candidate');
  const [requestType, setRequestType] = useState('access');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const isDsar = kind === 'dsar';
  const title = isDsar ? t('legal.form.dsarTitle') : t('legal.form.grievanceTitle');
  const intro = isDsar ? t('legal.form.dsarIntro') : t('legal.form.grievanceIntro');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !details.trim()) {
      setError(t('legal.form.validation'));
      return;
    }
    setError('');

    const requestLabel = isDsar
      ? t(`legal.form.requests.${requestType}`)
      : subject.trim();

    const body = [
      `${t('legal.form.fullName')}: ${name}`,
      `${t('legal.form.email')}: ${email}`,
      `${t('legal.form.phone')}: ${phone || '-'}`,
      `${t('legal.form.role')}: ${t(`legal.form.roles.${role}`)}`,
      isDsar ? `${t('legal.form.requestType')}: ${requestLabel}` : `${t('legal.form.subject')}: ${requestLabel}`,
      '',
      `${t('legal.form.details')}:`,
      details,
    ].join('\n');

    const mailSubject = isDsar
      ? `${t('legal.form.dsarMailSubject')} - ${requestLabel}`
      : `${t('legal.form.grievanceMailSubject')} - ${requestLabel}`;

    window.location.href = `mailto:${GRIEVANCE_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(body)}`;
  };

  const inputClass =
    'w-full rounded-xl border border-theme-lightViolet bg-white px-3.5 py-2.5 text-sm font-medium text-theme-darkViolet outline-none transition focus:border-theme-lavender focus:ring-2 focus:ring-theme-lavender/25';
  const labelClass = 'mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-theme-darkViolet/70';

  return (
    <section className="mt-8 rounded-3xl border border-theme-lightViolet bg-white p-5 sm:p-7 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-lightViolet text-theme-lavender">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-theme-darkViolet">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-theme-darkViolet/65">{intro}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="legal-name">{t('legal.form.fullName')}</label>
            <input id="legal-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="legal-email">{t('legal.form.email')}</label>
            <input id="legal-email" type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass} htmlFor="legal-phone">{t('legal.form.phone')}</label>
            <input id="legal-phone" type="tel" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="legal-role">{t('legal.form.role')}</label>
            <select id="legal-role" className={inputClass} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="candidate">{t('legal.form.roles.candidate')}</option>
              <option value="employer">{t('legal.form.roles.employer')}</option>
              <option value="other">{t('legal.form.roles.other')}</option>
            </select>
          </div>
        </div>

        {isDsar ? (
          <div>
            <label className={labelClass} htmlFor="legal-request-type">{t('legal.form.requestType')}</label>
            <select id="legal-request-type" className={inputClass} value={requestType} onChange={(e) => setRequestType(e.target.value)}>
              <option value="access">{t('legal.form.requests.access')}</option>
              <option value="correction">{t('legal.form.requests.correction')}</option>
              <option value="erasure">{t('legal.form.requests.erasure')}</option>
              <option value="withdraw">{t('legal.form.requests.withdraw')}</option>
              <option value="nominate">{t('legal.form.requests.nominate')}</option>
            </select>
          </div>
        ) : (
          <div>
            <label className={labelClass} htmlFor="legal-subject">{t('legal.form.subject')}</label>
            <input id="legal-subject" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="legal-details">{t('legal.form.details')}</label>
          <textarea id="legal-details" rows={5} className={inputClass} value={details} onChange={(e) => setDetails(e.target.value)} required />
        </div>

        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-theme-darkViolet/50">{t('legal.form.mailtoNote')}</p>
          <button
            type="submit"
            className="btn-gloss inline-flex items-center justify-center gap-2 rounded-full bg-theme-lavender px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-theme-lavender/30 transition hover:bg-theme-darkViolet"
          >
            <Send className="h-4 w-4" />
            {isDsar ? t('legal.form.submitDsar') : t('legal.form.submitGrievance')}
          </button>
        </div>
      </form>
    </section>
  );
}
