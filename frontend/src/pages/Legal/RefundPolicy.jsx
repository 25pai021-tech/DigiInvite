import LegalLayout, { SUPPORT_EMAIL } from './LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy">
      <p>
        At <strong>DigiInvite</strong> we want you to be happy with your purchase. Because
        our invitations are <strong>digital products delivered instantly</strong>, please
        read this policy carefully before buying.
      </p>

      <h2>1. Nature of the Product</h2>
      <p>
        DigiInvite sells personalised <strong>digital</strong> invitations. Once an
        invitation has been generated and made available to you (downloaded or shared),
        it is considered delivered and used.
      </p>

      <h2>2. When You Are Eligible for a Refund</h2>
      <p>We will issue a full refund in these cases:</p>
      <ul>
        <li><strong>Payment deducted but no invitation delivered</strong> — if money was charged but your order failed or the invitation was not created.</li>
        <li><strong>Duplicate payment</strong> — if you were accidentally charged more than once for the same order.</li>
        <li><strong>Technical fault on our side</strong> that prevented you from accessing or using your paid invitation, and which we are unable to fix.</li>
      </ul>

      <h2>3. When Refunds Are Not Available</h2>
      <ul>
        <li>After the invitation has been successfully generated and delivered, simply because you changed your mind.</li>
        <li>For mistakes in the details you entered yourself (you can edit and re-create your invitation).</li>
        <li>For issues caused by factors outside our control (e.g., your device or internet).</li>
      </ul>

      <h2>4. How to Request a Refund</h2>
      <p>
        Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within
        <strong> 7 days</strong> of your payment with your registered email, the order
        details, and a short description of the issue. We may ask for a screenshot of the
        payment.
      </p>

      <h2>5. How Refunds Are Processed</h2>
      <p>
        Approved refunds are returned to your <strong>original payment method</strong>{' '}
        through Razorpay. Once approved, refunds are typically processed within
        <strong> 5–7 business days</strong>, though your bank may take a little longer to
        reflect it.
      </p>

      <h2>6. Cancellations</h2>
      <p>
        Since invitations are delivered instantly, orders generally cannot be cancelled
        once payment is complete. If you have not yet completed payment, simply do not
        proceed with checkout — you will not be charged.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        For any refund or billing questions, email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <div className="legal-note">
        This document is a general template provided for your convenience and is not
        legal advice. Please review and adapt it before relying on it for your business.
      </div>
    </LegalLayout>
  );
}