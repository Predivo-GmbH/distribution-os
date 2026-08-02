import { LegalLayout } from './LegalLayout'

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="Last updated: 2 August 2026" canonicalPath="/privacy">
      <section>
        <h2>Who we are</h2>
        <p>
          Distribution-OS is operated by Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi, Switzerland. We are the controller of the personal data described here. This policy explains what we collect, why, and your rights under the Swiss Federal Act on Data Protection (revDSG) and, where it applies, the EU General Data Protection Regulation (GDPR).
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <p>
          <strong className="text-slate-300">Account data</strong> — your email address and name when you sign up.<br />
          <strong className="text-slate-300">Workspace data</strong> — the product details, prompts, tasks, and content you create in the Service.<br />
          <strong className="text-slate-300">AI provider keys</strong> — if you bring your own AI key, it is stored encrypted (AES-GCM) and protected by row-level security so only your account can use it.<br />
          <strong className="text-slate-300">Billing data</strong> — handled by our payment processor Stripe. We do not store your card number; we keep a customer reference and your subscription status.<br />
          <strong className="text-slate-300">Usage data</strong> — basic technical logs needed to operate and secure the Service.
        </p>
      </section>

      <section>
        <h2>Why we process it</h2>
        <p>
          We process your data to provide and secure the Service (performance of our contract with you), to bill paid plans, and to comply with legal obligations. We do not sell your personal data.
        </p>
      </section>

      <section>
        <h2>Processors we use</h2>
        <p>
          <strong className="text-slate-300">Supabase</strong> — database and authentication hosting (EU region, Frankfurt).<br />
          <strong className="text-slate-300">Stripe</strong> — payment processing and tax.<br />
          <strong className="text-slate-300">AI and integration providers you connect</strong> — when you use an AI feature or connect an integration, the necessary content is sent to that provider (for example the AI provider whose key you supplied) to produce the requested output, subject to that provider's own terms and privacy policy.
        </p>
      </section>

      <section>
        <h2>Retention</h2>
        <p>
          We keep your data for as long as your account is active. When you delete your account, we delete your personal data except where we must retain limited records to meet legal obligations (for example accounting records). You can request deletion at any time.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You have the right to access, correct, delete, or export your personal data, and to object to or restrict certain processing. To exercise any of these rights, email us at <a href="mailto:hello@predivo.ch">hello@predivo.ch</a>. You may also lodge a complaint with the Swiss Federal Data Protection and Information Commissioner (FDPIC) or your local supervisory authority.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy or your data: <a href="mailto:hello@predivo.ch">hello@predivo.ch</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
