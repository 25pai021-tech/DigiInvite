import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import StepIndicator, { STEPS } from '../../components/StepIndicator/StepIndicator';
import EventType from '../../components/EventType/EventType';
import EventDetails, { validateEventDetails } from '../../components/EventDetails/EventDetails';
import DesignPreferences from '../../components/DesignPreferences/DesignPreferences';
import ReviewSubmit from '../../components/ReviewSubmit/ReviewSubmit';
import SuccessPage from '../../components/SuccessPage/SuccessPage';
import Button from '../../components/Shared/Button';
import Card from '../../components/Shared/Card';
import { submitInvitationRequest } from '../../lib/submitInvitationRequest';

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
  customTheme: '',
  color: '',
  couplePhoto: [],
  referenceImages: [],
  instructions: '',
  additionalNotes: '',
};

export default function CreateInvitation() {
  const navigate = useNavigate();
  const location = useLocation();
  const pickedTemplate = location.state?.template || null;

  const [step, setStep] = useState(0);
  const [eventType, setEventType] = useState(pickedTemplate?.event_type || '');

  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = useState({});
  const [design, setDesign] = useState({ ...EMPTY_DESIGN, theme: pickedTemplate?.theme || '' });
  const [designErrors, setDesignErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const updateDetails = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
    if (detailErrors[field]) {
      setDetailErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const updateDesign = (field, value) => {
    setDesign((prev) => ({ ...prev, [field]: value }));
    if (designErrors[field]) {
      setDesignErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === 'theme' && value !== 'custom' && designErrors.customTheme) {
      setDesignErrors((prev) => ({ ...prev, customTheme: undefined }));
    }
  };

  const updateDesignFiles = (field, files) => {
    setDesign((prev) => ({ ...prev, [field]: files }));
  };

  const handleEventTypeSelect = (type) => {
  setEventType(type);
  setStep(1);
  };

  const canProceed = () => {
    if (step === 0) return Boolean(eventType);
    if (step === 1) return true; // validated explicitly on Next
    if (step === 2) {
      if (design.theme === 'custom' && !design.customTheme?.trim()) {
        return false;
      }
      return true;
    }
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
    if (step === 2) {
      if (design.theme === 'custom' && (!design.customTheme || !design.customTheme.trim())) {
        setDesignErrors({ customTheme: 'Please enter a custom theme.' });
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
    setSubmitError(null);
    try {
      const result = await submitInvitationRequest({ eventType, details, design, template: pickedTemplate });
      setRequestId(result.id);
      setStep(4);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong submitting your request. Please try again.');
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
        {pickedTemplate && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 14,
          }}>
            Customizing: <strong>{pickedTemplate.name}</strong>
          </div>
        )}

        <Card>
          {step === 0 && <EventType value={eventType} onChange={handleEventTypeSelect} />}

          {step === 1 && (
            <EventDetails
              data={details}
              errors={detailErrors}
              onChange={updateDetails}
              eventType={eventType}
            />
          )}

          {step === 2 && (
            <DesignPreferences
              data={design}
              errors={designErrors}
              onChange={updateDesign}
              onFilesChange={updateDesignFiles}
            />
          )}

          {step === 3 && (
            <ReviewSubmit
              eventType={eventType}
              details={details}
              design={design}
              onEditStep={setStep}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}

          {step === 4 && (
            <SuccessPage
              requestId={requestId}
              onGoDashboard={resetAndGoDashboard}
              onViewRequests={goToRequests}
            />
          )}

          {step > 0 && step < 3 && (
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
