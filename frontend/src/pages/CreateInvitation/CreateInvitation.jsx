import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StepIndicator, { STEPS } from '../../components/StepIndicator/StepIndicator';
import EventType from '../../components/EventType/EventType';
import EventDetails, { validateEventDetails } from '../../components/EventDetails/EventDetails';
import DesignPreferences from '../../components/DesignPreferences/DesignPreferences';
import ReviewSubmit from '../../components/ReviewSubmit/ReviewSubmit';
import SuccessPage from '../../components/SuccessPage/SuccessPage';
import Button from '../../components/Shared/Button';
import Card from '../../components/Shared/Card';

import '../../styles/createInvitation.css';
import './CreateInvitation.css';

const EMPTY_DETAILS = {
  hostName: '',
  brideName: '',
  groomName: '',
  eventName: '',
  date: '',
  time: '',
  venue: '',
  phone: '',
  email: '',
  mapLink: '',
  specialMessage: '',
};

const EMPTY_DESIGN = {
  theme: '',
  color: '',
  couplePhoto: [],
  referenceImages: [],
  instructions: '',
  additionalNotes: '',
};

function generateRequestId() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  return `DI-${stamp}`;
}

/**
 * Phase 11 (future): swap this local-state submit for a Supabase insert
 * into `invitation_requests`, uploading files to Supabase Storage first
 * and storing their resulting URLs instead of File objects.
 *
 * async function submitToSupabase(payload) {
 *   const { data, error } = await supabase
 *     .from('invitation_requests')
 *     .insert([{ ...payload, status: 'Pending' }])
 *     .select()
 *     .single();
 *   if (error) throw error;
 *   return data;
 * }
 */
async function mockSubmit(payload) {
  // Simulates network latency until Supabase is wired in.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { id: generateRequestId(), ...payload, status: 'Pending', created_at: new Date().toISOString() };
}

export default function CreateInvitation() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState('');
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = useState({});
  const [design, setDesign] = useState(EMPTY_DESIGN);
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState(null);

  const updateDetails = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (detailErrors[field]) {
      setDetailErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateDesign = (field, value) => {
    setDesign((prev) => ({ ...prev, [field]: value }));
  };

  const updateDesignFiles = (field, files) => {
    setDesign((prev) => ({ ...prev, [field]: files }));
  };

  const canProceed = () => {
    if (step === 0) return Boolean(eventType);
    if (step === 1) return true; // validated explicitly on Next
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      const errors = validateEventDetails(details);
      if (Object.keys(errors).length > 0) {
        setDetailErrors(errors);
        return;
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (step === 0) {
      navigate('/dashboard');
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await mockSubmit({
        event_type: eventType,
        ...details,
        theme: design.theme,
        color: design.color,
        instructions: design.instructions,
        additional_notes: design.additionalNotes,
      });
      setRequestId(result.id);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndGoDashboard = () => navigate('/dashboard');
  const goToRequests = () => navigate('/my-requests');

  return (
    <div className="di-root">
      <div className="di-page">
        <header className="di-header">
          <p className="di-eyebrow">DigiInvite · New Request</p>
          <h1 className="di-title">Create Invitation</h1>
          <p className="di-subtitle">A few steps and your designer has everything they need.</p>
        </header>

        <StepIndicator currentStep={step} />

        <Card>
          {step === 0 && <EventType value={eventType} onChange={setEventType} />}

          {step === 1 && (
            <EventDetails
              data={details}
              errors={detailErrors}
              onChange={updateDetails}
              eventType={eventType}
            />
          )}

          {step === 2 && (
            <DesignPreferences data={design} onChange={updateDesign} onFilesChange={updateDesignFiles} />
          )}

          {step === 3 && (
            <ReviewSubmit
              eventType={eventType}
              details={details}
              design={design}
              onEditStep={setStep}
              onSubmit={handleSubmit}
              submitting={submitting}
            />
          )}

          {step === 4 && (
            <SuccessPage
              requestId={requestId}
              onGoDashboard={resetAndGoDashboard}
              onViewRequests={goToRequests}
            />
          )}

          {step < 3 && (
            <div className="di-nav">
              <Button variant="ghost" onClick={goBack}>Back</Button>
              <div className="di-nav__spacer" />
              <Button variant="primary" onClick={goNext} disabled={!canProceed()}>Next</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
