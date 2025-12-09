export default function PrivacyPage() {
  return (
    <div className="card space-y-4">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p>
        AI Refund Generator only stores the flight eligibility scans and purchase details
        necessary to deliver your claim letter. We never sell or share your information and
        you may request deletion at any time by emailing support@example.com.
      </p>
      <p>
        Flight data and generated letters are retained for 30 days for quality monitoring.
        Payment information is handled exclusively by Stripe.
      </p>
    </div>
  );
}
