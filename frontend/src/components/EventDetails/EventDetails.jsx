import React from 'react';
import { Input, Textarea } from '../Shared/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

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
    errors.phone = 'Enter a valid phone number.';
  }
  return errors;
}

const showsCoupleNames = (eventType) => ['wedding', 'engagement', 'anniversary'].includes(eventType);

export default function EventDetails({ data, errors, onChange, eventType }) {
  const set = (field) => (e) => onChange(field, e.target.value);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 4px' }}>
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
          placeholder="+91 98765 43210"
          value={data.phone}
          onChange={set('phone')}
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
