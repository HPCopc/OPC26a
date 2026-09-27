'use client';

import { useState } from 'react';
import { isDefaultBlocked } from '@/amplify/shared/blockedEmailDomains';

// Same fields and rules as the contact form on the original
// opportunitycrudes.com site.
//
// Not sent anywhere yet: Submit validates and shows a thank-you. When
// sending is added (SES email and/or a saved record), repeat these checks on
// the server, including the admin-managed BlockedEmailDomain table.

const INQUIRY_TYPES = [
  { value: 'ad',                label: 'Advertising Inquiry' },
  { value: 'event',             label: 'Events Inquiry' },
  { value: 'opcconf',           label: 'Opportunity Crudes Conference Inquiry' },
  { value: 'opcconf26abstract', label: 'Request for 2026 Opportunity Crudes Conference Abstract' },
  { value: 'other',             label: 'Other' },
];

const emptyForm = {
  firstName: '', lastName: '', email: '', company: '',
  address: '', city: '', state: '', zip: '', country: '', phone: '',
  inquiryType: '', comments: '',
};

type Field = keyof typeof emptyForm;

const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function validate(form: typeof emptyForm): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const required: [Field, string][] = [
    ['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Company email'],
    ['company', 'Company'], ['city', 'City'], ['state', 'State'],
  ];
  for (const [field, label] of required) {
    if (!form[field].trim()) errors[field] = `${label} is required.`;
  }
  const email = form.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  } else if (email && isDefaultBlocked(email)) {
    errors.email = 'Please use your company email address.';
  }
  if (form.company.toLowerCase().includes('google')) {
    errors.company = 'Enter the company you work for.';
  }
  return errors;
}

export default function ContactForm() {
  const [form, setForm]       = useState(emptyForm);
  const [errors, setErrors]   = useState<Partial<Record<Field, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as Field]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="py-8">
        <p className="text-lg font-semibold text-gray-900 mb-2">Thank you, {form.firstName.trim()}.</p>
        <p className="text-gray-600 mb-6">We received your message and will be in touch.</p>
        <button
          onClick={() => { setForm(emptyForm); setSubmitted(false); }}
          className="text-blue-600 font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const input = (name: Field, placeholder: string, opts: { type?: string; required?: boolean } = {}) => (
    <div>
      <input
        type={opts.type ?? 'text'}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder + (opts.required ? ' *' : '')}
        aria-label={placeholder}
        aria-invalid={!!errors[name]}
        className={`${inputClass} ${errors[name] ? 'border-red-500' : ''}`}
      />
      {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input('firstName', 'First Name', { required: true })}
        {input('lastName', 'Last Name', { required: true })}
      </div>
      {input('email', 'Company Email Address', { type: 'email', required: true })}
      {input('company', 'Company', { required: true })}
      {input('address', 'Address')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input('city', 'City', { required: true })}
        {input('state', 'State', { required: true })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input('zip', 'Postal / Zip Code')}
        {input('country', 'Country')}
      </div>
      {input('phone', 'Phone Number', { type: 'tel' })}

      <select
        name="inquiryType"
        value={form.inquiryType}
        onChange={handleChange}
        aria-label="Inquiry type"
        className={`${inputClass} bg-white ${form.inquiryType ? '' : 'text-gray-400'}`}
      >
        <option value="" disabled>Select Inquiry Type...</option>
        {INQUIRY_TYPES.map(t => (
          <option key={t.value} value={t.value} className="text-gray-900">{t.label}</option>
        ))}
      </select>

      <textarea
        name="comments"
        value={form.comments}
        onChange={handleChange}
        rows={4}
        placeholder="Comments / Questions"
        aria-label="Comments or questions"
        className={inputClass}
      />

      <p className="text-xs text-gray-500">* Required</p>

      <button
        type="submit"
        className="self-center bg-black text-white px-8 py-2.5 text-sm font-semibold hover:opacity-70 transition"
      >
        Submit
      </button>
    </form>
  );
}
