import React from 'react';
import Button from '../Shared/Button';

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding',
  birthday: 'Birthday',
  engagement: 'Engagement',
  housewarming: 'Housewarming',
  'baby-shower': 'Baby Shower',
  corporate: 'Corporate',
  graduation: 'Graduation',
  anniversary: 'Anniversary',
  custom: 'Custom',
};

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--color-border-soft)', fontSize: 14 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

function SectionTitle({ children, onEdit }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 6px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: 0 }}>{children}</h3>
      {onEdit && <Button variant="text" onClick={onEdit}>Edit</Button>}
    </div>
  );
}

export default function ReviewSubmit({ eventType, details, design, onEditStep, onSubmit, submitting }) {
  const allImages = [
    ...(design.couplePhoto || []),
    ...(design.referenceImages || []),
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 4px' }}>
        Review your request
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 8px' }}>
        Make sure everything is correct before you submit.
      </p>

      <SectionTitle onEdit={() => onEditStep(0)}>Selected Event</SectionTitle>
      <Row label="Event Type" value={EVENT_TYPE_LABELS[eventType] || eventType} />

      <SectionTitle onEdit={() => onEditStep(1)}>Event Details</SectionTitle>
      <Row label="Host Name" value={details.hostName} />
      <Row label="Event Name" value={details.eventName} />
      <Row label="Bride Name" value={details.brideName} />
      <Row label="Groom Name" value={details.groomName} />
      <Row label="Date" value={details.date} />
      <Row label="Time" value={details.time} />
      <Row label="Venue" value={details.venue} />
      <Row label="Phone" value={details.phone} />
      <Row label="Email" value={details.email} />
      <Row label="Google Maps Link" value={details.mapLink} />
      <Row label="Special Message" value={details.specialMessage} />

      <SectionTitle onEdit={() => onEditStep(2)}>Design Preferences</SectionTitle>
      <Row label="Theme" value={design.theme} />
      <Row label="Preferred Colors" value={design.color} />
      <Row label="Special Instructions" value={design.instructions} />
      <Row label="Additional Notes" value={design.additionalNotes} />

      {allImages.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '22px 0 10px' }}>
            Uploaded Images
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allImages.map((file, idx) => (
              <span
                key={`${file.name}-${idx}`}
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 999,
                  padding: '5px 10px',
                }}
              >
                🖼 {file.name}
              </span>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: 30 }}>
        <Button variant="primary" onClick={onSubmit} loading={submitting}>
          {submitting ? 'Submitting…' : 'Submit Design Request'}
        </Button>
      </div>
    </div>
  );
}
