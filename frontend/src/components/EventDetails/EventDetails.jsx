import React from 'react';
import { Input, Textarea } from '../Shared/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9]{10}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]{2,}$/i;

export const REQUIRED_FIELDS = ['hostName', 'eventName', 'date', 'time', 'venue', 'phone', 'email'];

export function validateEventDetails(data) {
  const errors = {};
  REQUIRED_FIELDS.forEach((field) => {
    if (!data[field] || !data[field].trim()) {
      errors[field] = 'This field is required.';
    }
  });
  if (data.email && !EMAIL_RE.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (data.phone && !PHONE_RE.test(data.phone)) {
    errors.phone = 'Enter a valid 10-digit phone number.';
  }
  if (data.mapLink && data.mapLink.trim() && !URL_RE.test(data.mapLink.trim())) {
    errors.mapLink = 'Enter a valid link starting with http:// or https://';
  }
  return errors;
}

const showsCoupleNames = (eventType) => ['wedding', 'engagement', 'anniversary'].includes(eventType);

export default function EventDetails({ data, errors, onChange, eventType }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  const handlePhoneChange = (e) => {
    // Strip anything that isn't a digit, then hard-cap at 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    onChange('phone', digitsOnly);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 4px', color: 'var(--color-text)' }}>
        Tell us about the event
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        These details will appear on the invitation itself, so double-check the spelling.
      </p>

      <div className="di-field-row">
        <Input
          label="Host Name"
          required
          placeholder="e.g. The Sharma Family"
          value={data.hostName}
          onChange={set('hostName')}
          error={errors.hostName}
        />
        <Input
          label="Event Name"
          required
          placeholder="e.g. Ananya & Rohan's Wedding"
          value={data.eventName}
          onChange={set('eventName')}
          error={errors.eventName}
        />
      </div>

      {showsCoupleNames(eventType) && (
        <div className="di-field-row">
          <Input
            label="Bride Name"
            placeholder="Optional"
            value={data.brideName}
            onChange={set('brideName')}
          />
          <Input
            label="Groom Name"
            placeholder="Optional"
            value={data.groomName}
            onChange={set('groomName')}
          />
        </div>
      )}

      <div className="di-field-row">
        <Input label="Date" required type="date" value={data.date} onChange={set('date')} error={errors.date} />
        <Input label="Time" required type="time" value={data.time} onChange={set('time')} error={errors.time} />
      </div>

      <Input
        label="Venue"
        required
        placeholder="Venue name and address"
        value={data.venue}
        onChange={set('venue')}
        error={errors.venue}
      />

      <div className="di-field-row">
        <Input
          label="Phone"
          required
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          value={data.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />
        <Input
          label="Email"
          required
          type="email"
          placeholder="you@example.com"
          value={data.email}
          onChange={set('email')}
          error={errors.email}
        />
      </div>

      <Input
        label="Google Maps Link"
        placeholder="Optional — helps guests find the venue"
        value={data.mapLink}
        onChange={set('mapLink')}
        error={errors.mapLink}
      />

      <Textarea
        label="Special Message"
        placeholder="A line you'd like included on the invitation, e.g. a quote or welcome note"
        rows={3}
        value={data.specialMessage}
        onChange={set('specialMessage')}
      />
    </div>
  );
}
