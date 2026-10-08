import LegalLayout, { SUPPORT_EMAIL } from './LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        This Privacy Policy explains how <strong>DigiInvite</strong> ("we", "us", "our")
        collects, uses, and protects your information when you use our website and
        digital invitation services (the "Service"). By using DigiInvite, you agree
        to the practices described here.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Account information</strong> — your name and email address when you register or sign in.</li>
        <li><strong>Invitation details</strong> — the event information you enter (names, dates, venue, messages, guest RSVPs) to create your invitations.</li>
        <li><strong>Payment information</strong> — payments are processed securely by our payment partner <strong>Razorpay</strong>. We do not store your card, UPI, or bank details on our servers; we only receive a confirmation of payment.</li>
        <li><strong>Usage data</strong> — basic technical information such as browser type and pages visited, used to keep the Service working and secure.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create, store, and deliver your digital invitations.</li>
        <li>To process payments and provide order confirmations.</li>
        <li>To respond to your support requests.</li>
        <li>To maintain the security and reliability of the Service.</li>
      </ul>

      <h2>3. How Your Data Is Stored</h2>
      <p>
        Your data is stored securely using <strong>Supabase</strong>, our database and
        storage provider. We take reasonable technical measures to protect your
        information from unauthorised access, loss, or misuse.
      </p>

      <h2>4. Sharing of Information</h2>
      <p>
        We <strong>do not sell</strong> your personal information. We share data only
        with the service providers needed to run DigiInvite — such as Razorpay (payments)
        and Supabase (hosting/storage) — and only to the extent required to provide the
        Service, or where required by law.
      </p>

      <h2>5. Cookies</h2>
      <p>
        We use only the cookies and local storage necessary to keep you signed in and
        to remember your preferences. We do not use them to track you across other
        websites.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by
        contacting us. We will respond within a reasonable time.
      </p>

      <h2>7. Children's Privacy</h2>
      <p>
        DigiInvite is not intended for children under 18. We do not knowingly collect
        personal information from children.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The latest version will
        always be available on this page with the updated date.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For any privacy questions or requests, email us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <div className="legal-note">
        This document is a general template provided for your convenience and is not
        legal advice. Please review and adapt it (and have it checked if needed) before
        relying on it for your business.
      </div>
    </LegalLayout>
  );
}