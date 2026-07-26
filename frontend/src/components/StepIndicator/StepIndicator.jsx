import React from 'react';

export const STEPS = [
  { key: 'event-type', label: 'Choose Event' },
  { key: 'event-details', label: 'Event Details' },
  { key: 'design-preferences', label: 'Design Preferences' },
  { key: 'review', label: 'Review' },
  { key: 'submitted', label: 'Submitted' },
];

/**
 * currentStep: 0-based index into STEPS
 */
export default function StepIndicator({ currentStep }) {
  return (
    <nav className="step-indicator" aria-label="Progress">
      {STEPS.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        const stateClass = isComplete
          ? 'step-indicator__item--complete'
          : isCurrent
          ? 'step-indicator__item--current'
          : '';

        return (
          <div className={`step-indicator__item ${stateClass}`} key={step.key}>
            <div className={`step-indicator__thread ${isComplete ? 'step-indicator__thread--filled' : ''}`} />
            <div className="step-indicator__seal" aria-current={isCurrent ? 'step' : undefined}>
              {isComplete ? '✓' : index + 1}
            </div>
            <div className="step-indicator__label">{step.label}</div>
          </div>
        );
      })}
    </nav>
  );
}
