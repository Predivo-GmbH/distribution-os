import { LegalLayout } from './LegalLayout'

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="Last updated: 2 August 2026" canonicalPath="/terms">
      <section>
        <h2>Agreement</h2>
        <p>
          By creating an account or using Distribution-OS ("the Service"), you agree to these Terms of Service. The Service is operated by Predivo GmbH, Bahnhofstrasse 55, 6403 Küssnacht am Rigi, Switzerland ("Predivo", "we"). If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2>The Service</h2>
        <p>
          Distribution-OS is an AI-assisted distribution and growth workspace for software founders. It generates content, outreach drafts, audits, and playbooks across six distribution engines. AI features run either on an allowance included with your plan or on an AI provider key you supply yourself ("bring your own key"). Distribution-OS does not guarantee the accuracy, completeness, or results of any AI-generated output. All decisions to publish, send, or act on that output remain your responsibility.
        </p>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and be at least 18 years old, or the age of majority in your jurisdiction. You may not use the Service for unlawful purposes, to send spam or content that violates a third party's rights, or in a way that disrupts the Service.
        </p>
      </section>

      <section>
        <h2>Plans, billing and cancellation</h2>
        <p>
          The Service offers a free plan and paid subscription plans (Starter, Growth, Scale). Paid plans are billed monthly in advance through our payment processor, Stripe. Prices are shown on the pricing page; where Swiss or Liechtenstein VAT applies it is added at checkout in accordance with Stripe Tax. You can upgrade, downgrade, or cancel at any time from Settings → Billing, which opens the Stripe customer portal. Cancellation takes effect at the end of the current billing period; access continues until then. Except where required by mandatory law, payments already made are non-refundable.
        </p>
      </section>

      <section>
        <h2>Your content and third-party services</h2>
        <p>
          You retain ownership of the product information, prompts, and other content you put into the Service. You grant Predivo the limited right to process that content solely to operate the Service for you. If you connect a third-party service (for example an AI provider key or an integration), your use of that service is also governed by that provider's own terms, and you are responsible for any charges they bill you directly.
        </p>
      </section>

      <section>
        <h2>Availability and warranty</h2>
        <p>
          The Service is provided "as is" and "as available", without warranties of any kind, whether express or implied, including fitness for a particular purpose. We do not warrant that the Service will be uninterrupted, error-free, or that AI output will meet your expectations.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Predivo shall not be liable for any indirect, incidental, or consequential damages, or for lost profits, revenue, or data, arising out of your use of the Service. Nothing in these Terms excludes liability that cannot be excluded under applicable Swiss law.
        </p>
      </section>

      <section>
        <h2>Changes and termination</h2>
        <p>
          We may update these Terms or the Service from time to time. Material changes will be communicated by a notice in the app or by email. We may suspend or terminate accounts that breach these Terms. You may stop using the Service and delete your account at any time.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These Terms are governed by the laws of Switzerland. The exclusive place of jurisdiction is Küssnacht am Rigi, Switzerland, to the extent permitted by law.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these Terms: <a href="mailto:hello@predivo.ch">hello@predivo.ch</a>.
        </p>
      </section>
    </LegalLayout>
  )
}
