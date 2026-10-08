import LegalLayout, { SUPPORT_EMAIL } from './LegalLayout';

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These Terms of Service ("Terms") govern your use of <strong>DigiInvite</strong>
        {' '}(the "Service"). By creating an account or using the Service, you agree to
        these Terms. If you do not agree, please do not use the Service.
      </p>

      <h2>1. The Service</h2>
      <p>
        DigiInvite is an online platform that lets you create, customise, and share
        digital invitation cards for personal and other events. All designs and
        templates are created and owned by DigiInvite.
      </p>

      <h2>2. Accounts</h2>
      <ul>
        <li>You must provide accurate information when creating an account.</li>
        <li>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
      </ul>

      <h2>3. Pricing & Payment</h2>
      <ul>
        <li>The price for each paid invitation is shown clearly before you pay.</li>
        <li>Payments are processed securely through <strong>Razorpay</strong>. By paying, you agree to Razorpay's terms as well.</li>
        <li>All prices are in Indian Rupees (INR) unless stated otherwise.</li>
      </ul>

      <h2>4. Intellectual Property</h2>
      <p>
        The DigiInvite name, templates, designs, and software are the property of
        DigiInvite and are protected by applicable laws. When you purchase an invitation,
        you receive a licence to use that personalised invitation for your own personal
        or event-related purposes. You may not resell, redistribute, or claim ownership
        of our templates or designs.
      </p>

      <h2>5. Your Content</h2>
      <p>
        You retain ownership of the information and content you enter (such as names,
        dates, and messages). You are responsible for ensuring you have the right to use
        any content you add, and that it is lawful and not offensive.
      </p>

      <h2>6. Acceptable Use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Break any law or infringe anyone's rights.</li>
        <li>Upload harmful, misleading, offensive, or fraudulent content.</li>
        <li>Attempt to disrupt, hack, or misuse the Service or other users' data.</li>
      </ul>

      <h2>7. Service Availability</h2>
      <p>
        We work to keep the Service available and reliable, but we do not guarantee it
        will be uninterrupted or error-free. We may update, change, or suspend features
        at any time.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, DigiInvite is not liable for any
        indirect or consequential loss arising from your use of the Service. Our total
        liability for any claim is limited to the amount you paid for the relevant order.
      </p>

      <h2>9. Refunds</h2>
      <p>
        Refunds are handled as described in our <a href="/refund">Refund Policy</a>.
      </p>

      <h2>10. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India, and any disputes will be subject
        to the courts of India.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        Questions about these Terms? Email us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <div className="legal-note">
        This document is a general template provided for your convenience and is not
        legal advice. Please review and adapt it before relying on it for your business.
      </div>
    </LegalLayout>
  );
}