import { LegalLayout } from './LegalLayout'

export function ImprintPage() {
  return (
    <LegalLayout title="Imprint" canonicalPath="/imprint">
      <section>
        <h2>Company</h2>
        <p>
          Predivo GmbH<br />
          Bahnhofstrasse 55<br />
          6403 Küssnacht am Rigi<br />
          Switzerland
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Email: <a href="mailto:hello@predivo.ch">hello@predivo.ch</a>
        </p>
      </section>

      <section>
        <h2>Commercial register</h2>
        <p>Predivo GmbH is registered in the Commercial Register of the Canton of Schwyz, Switzerland.</p>
      </section>

      <section>
        <h2>Responsible for content</h2>
        <p>
          Predivo GmbH<br />
          Bahnhofstrasse 55<br />
          6403 Küssnacht am Rigi, Switzerland
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          The content of this website has been prepared with the greatest possible care. However, Predivo GmbH does not guarantee the accuracy, completeness, or timeliness of the content provided. Use of the content is at the user's own risk.
        </p>
        <p>
          This website contains links to external third-party websites over whose content Predivo GmbH has no influence. Therefore, we cannot accept any liability for this third-party content. The respective provider or operator of the linked pages is always responsible for the content of those pages.
        </p>
      </section>
    </LegalLayout>
  )
}
