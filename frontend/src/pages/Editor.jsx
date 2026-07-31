import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Editor() {
  const { requestId } = useParams();      // the card id from the URL
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  // must be logged in
  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  // load this specific request
  useEffect(() => {
    if (!user || !requestId) return;
    async function load() {
      const { data, error } = await supabase
        .from('invitation_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error || !data) setError('Could not load this card.');
      else setRequest(data);
      setBusy(false);
    }
    load();
  }, [user, requestId]);

  if (loading || busy) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Loading…</div>;
  }
  if (error) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>{error}</div>;
  }
  if (!request) return null;

  const isPaid = request.status === 'Paid' || request.status === 'Completed';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 'calc(var(--nav-h) + 40px) 24px 60px' }}>
      <button onClick={() => navigate('/my-requests')} style={backBtn}>← Back to My Requests</button>

      <h1 style={{ fontSize: 28, margin: '16px 0 4px' }}>{request.event_name}</h1>
      <p style={{ color: 'var(--muted, #888)', marginBottom: 24 }}>
        {request.event_type} · {request.date} · {request.venue}
      </p>

      {/* ===== EDITOR CANVAS AREA ===== */}
      {/* Gladis: replace this image with the Fabric.js canvas.
          - Use request.generated_image_url as the background image
          - Load request.editor_state (if present) to restore saved edits
          - Add a Save button that writes the Fabric JSON back to editor_state */}
      <div style={canvasWrap}>
        {request.generated_image_url ? (
          <img
            src={request.generated_image_url}
            alt="Your card"
            style={{ maxWidth: '100%', borderRadius: 12, display: 'block' }}
          />
        ) : (
          <p style={{ color: 'var(--muted, #888)' }}>Your card is still being prepared.</p>
        )}
      </div>

      {/* ===== ACTIONS ===== */}
      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Gladis: this Save button should save the Fabric.js edits.
            For now it just shows the intent. */}
        <button style={btnStyle} onClick={() => alert('Editing (Save) will be added with the Fabric.js editor.')}>
          Save Edits
        </button>

        {isPaid ? (
          <button style={btnStyle} onClick={() => alert('Download will be added with the editor.')}>
            Download
          </button>
        ) : (
          <button
            style={{ ...btnStyle, background: '#22c55e' }}
            onClick={() => navigate(`/pricing`)}   // later: real payment
          >
            Pay to Download
          </button>
        )}
      </div>

      <p style={{ color: 'var(--muted, #888)', fontSize: 13, marginTop: 16 }}>
        {isPaid
          ? 'You have paid — you can edit and download this card anytime.'
          : 'You can preview and edit your card. Downloading unlocks after payment.'}
      </p>
    </div>
  );
}

const canvasWrap = {
  background: 'var(--card, #fff)',
  border: '1px solid var(--border, #eee)',
  borderRadius: 14,
  padding: 16,
  display: 'grid',
  placeItems: 'center',
  minHeight: 300,
};
const btnStyle = {
  background: 'var(--purple, #6d28d9)',
  color: '#fff', border: 'none', padding: '10px 20px',
  borderRadius: 10, cursor: 'pointer', fontSize: 14,
};
const backBtn = {
  background: 'transparent', border: 'none', color: 'var(--muted, #888)',
  cursor: 'pointer', fontSize: 14, padding: 0,
};