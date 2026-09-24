import React, { useRef, useState } from 'react';
import { Input, Textarea } from '../Shared/Input';

const PRESET_KEYS = ['royal', 'floral', 'luxury', 'modern', 'traditional', 'minimal'];

const THEMES = [
  { key: 'royal', label: 'Royal' },
  { key: 'floral', label: 'Floral' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'modern', label: 'Modern' },
  { key: 'traditional', label: 'Traditional' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'custom', label: 'Custom' },
];

const MAX_IMAGE_SIZE_MB = 10;
const VALID_IMAGE_EXTS = /\.(jpe?g|png|webp|gif|bmp|svg)$/i;

export default function DesignPreferences({ data, errors = {}, onChange, onFilesChange }) {
  const coupleInputRef = useRef(null);
  const referenceInputRef = useRef(null);
  const [couplePhotoError, setCouplePhotoError] = useState('');

  const isCustom = data.theme === 'custom' || (Boolean(data.theme) && !PRESET_KEYS.includes(data.theme));

  const set = (field) => (e) => onChange(field, e.target.value);

  const handleCouplePhoto = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      onFilesChange('couplePhoto', []);
      setCouplePhotoError('');
      return;
    }

    // Format validation
    if (!file.type.startsWith('image/') && !VALID_IMAGE_EXTS.test(file.name)) {
      setCouplePhotoError('Invalid format. Please select an image file (JPG, PNG, WebP, etc.).');
      if (coupleInputRef.current) coupleInputRef.current.value = '';
      return;
    }

    // Size validation
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setCouplePhotoError(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${MAX_IMAGE_SIZE_MB}MB.`);
      if (coupleInputRef.current) coupleInputRef.current.value = '';
      return;
    }

    setCouplePhotoError('');
    onFilesChange('couplePhoto', [file]);
  };

  const removeCouplePhoto = () => {
    setCouplePhotoError('');
    onFilesChange('couplePhoto', []);
    if (coupleInputRef.current) coupleInputRef.current.value = '';
  };

  const handleReferenceImages = (e) => {
    const files = Array.from(e.target.files || []);
    onFilesChange('referenceImages', [...(data.referenceImages || []), ...files]);
  };

  const removeReferenceImage = (index) => {
    const next = [...(data.referenceImages || [])];
    next.splice(index, 1);
    onFilesChange('referenceImages', next);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: '0 0 4px' }}>
        Shape the look
      </h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '0 0 24px' }}>
        Give the designer a starting point. You can request revisions later.
      </p>

      {/* Theme */}
      <div className="di-field">
        <label className="di-label">Choose Theme</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {THEMES.map((theme) => {
            const selected = theme.key === 'custom' ? isCustom : data.theme === theme.key;
            return (
              <label
                key={theme.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${selected ? 'var(--color-purple-500)' : 'var(--color-border)'}`,
                  background: selected ? 'rgba(139,92,246,0.12)' : 'var(--color-bg-elevated)',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.key}
                  checked={selected}
                  onChange={() => onChange('theme', theme.key)}
                  style={{ accentColor: 'var(--color-purple-500)' }}
                />
                {theme.label}
              </label>
            );
          })}
        </div>

        {isCustom && (
          <div style={{ marginTop: 14 }}>
            <Input
              label="Custom Theme"
              required
              placeholder="e.g. Space, Beach, Vintage, Galaxy"
              value={data.customTheme || ''}
              onChange={(e) => onChange('customTheme', e.target.value)}
              error={errors?.customTheme}
            />
          </div>
        )}
      </div>

      <Input
        label="Preferred Colors"
        placeholder="e.g. Blush pink, ivory, gold"
        value={data.color}
        onChange={set('color')}
      />

      {/* Couple photo upload */}
      <div className="di-field">
        <label className="di-label">Upload Couple Photo</label>
        <UploadZone
          inputRef={coupleInputRef}
          onClick={() => coupleInputRef.current?.click()}
          text={data.couplePhoto?.[0]?.name || 'Click to upload a photo'}
        />
        <input
          ref={coupleInputRef}
          type="file"
          accept="image/*"
          onChange={handleCouplePhoto}
          style={{ display: 'none' }}
        />
        {data.couplePhoto?.[0] && (
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 999,
                padding: '5px 10px',
                fontSize: 12,
                color: 'var(--color-text)',
              }}
            >
              🖼 {data.couplePhoto[0].name}
              <button
                type="button"
                onClick={removeCouplePhoto}
                aria-label="Remove photo"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-danger, #ef4444)',
                  cursor: 'pointer',
                  fontSize: 13,
                  lineHeight: 1,
                  padding: 0,
                  marginLeft: 4,
                }}
              >
                ✕
              </button>
            </span>
          </div>
        )}
        {couplePhotoError && (
          <p className="di-error-text" style={{ marginTop: 6, color: 'var(--color-danger, #ef4444)', fontSize: 13 }}>
            {couplePhotoError}
          </p>
        )}
      </div>

      {/* Reference images upload */}
      <div className="di-field">
        <label className="di-label">Upload Reference Images</label>
        <UploadZone
          inputRef={referenceInputRef}
          onClick={() => referenceInputRef.current?.click()}
          text="Click to add inspiration images (multiple allowed)"
        />
        <input
          ref={referenceInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleReferenceImages}
          style={{ display: 'none' }}
        />

        {(data.referenceImages || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {data.referenceImages.map((file, idx) => (
              <span
                key={`${file.name}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 999,
                  padding: '5px 10px',
                  fontSize: 12,
                  color: 'var(--color-text-muted)',
                }}
              >
                {file.name}
                <button
                  type="button"
                  onClick={() => removeReferenceImage(idx)}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Textarea
        label="Special Design Instructions"
        placeholder="Fonts, motifs, layout ideas — anything specific you'd like."
        rows={3}
        value={data.instructions}
        onChange={set('instructions')}
      />

      <Textarea
        label="Additional Notes"
        placeholder="Anything else the designer should know."
        rows={2}
        value={data.additionalNotes}
        onChange={set('additionalNotes')}
      />
    </div>
  );
}

function UploadZone({ onClick, text }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        border: '1.5px dashed var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '18px 14px',
        background: 'var(--color-bg-elevated)',
        color: 'var(--color-text-muted)',
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      📎 {text}
    </button>
  );
}
