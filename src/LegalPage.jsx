import { useState } from 'react'
import './LegalPage.css'

function LegalPage({ initialSection = 'terms', onBack }) {
  const [section, setSection] = useState(initialSection)

  return (
    <main className="legal-page">
      <header className="legal-header">
        <button type="button" className="legal-back" onClick={onBack}>← Back</button>
        <span>northstar<span>.</span></span>
      </header>
      <article className="legal-content">
        <p className="legal-eyebrow">NORTHSTAR · LEGAL</p>
        <h1>Terms &amp; Privacy</h1>
        <p className="legal-updated">Last updated: November 5, 2026</p>
        <div className="legal-notice" role="note">
          This is a general template, not legal advice. Before publishing, replace the operator, contact, and governing-law details with your information and have the document reviewed for the laws that apply to you.
        </div>
        <div className="legal-tabs" role="tablist" aria-label="Legal documents">
          <button type="button" role="tab" aria-selected={section === 'terms'} className={section === 'terms' ? 'selected' : ''} onClick={() => setSection('terms')}>Terms of Service</button>
          <button type="button" role="tab" aria-selected={section === 'privacy'} className={section === 'privacy' ? 'selected' : ''} onClick={() => setSection('privacy')}>Privacy Policy</button>
        </div>

        {section === 'terms' ? (
          <section className="legal-document" aria-labelledby="terms-heading">
            <h2 id="terms-heading">Terms of Service</h2>
            <p>These Terms apply to your access to and use of Northstar (the “Service”). By using the Service, you agree to these Terms. If you do not agree, do not use it. The Service operator is the person or organization that makes Northstar available (“Northstar,” “we,” “us,” or “our”). Add your legal name and contact details before publishing.</p>

            <h3>1. The Service and eligibility</h3>
            <p>Northstar provides a market-workspace interface, including charts, sample quotes, educational ideas, and optional account and leaderboard features. You must be legally able to agree to these Terms where you live. The Service is not directed to children under 13; if local law sets a higher minimum age, that age applies.</p>

            <h3>2. No financial or investment advice</h3>
            <p>Northstar is for general information and education only. Nothing in the Service is financial, investment, trading, tax, or legal advice, or a recommendation to buy, sell, or hold any asset. Quotes, market depth, headlines, and other sample values may be simulated, delayed, incomplete, or inaccurate. Do your own research and consult a qualified professional. Trading involves risk, including the possible loss of your entire investment.</p>

            <h3>3. Accounts and security</h3>
            <p>You are responsible for providing accurate account information, safeguarding your login credentials, and activity under your account. Notify us promptly if you believe your account has been accessed without authorization. Authentication is provided through Supabase and is subject to its applicable terms and privacy practices.</p>

            <h3>4. Acceptable use and user submissions</h3>
            <p>Do not misuse the Service, interfere with its operation, attempt unauthorized access, or use it unlawfully. If you submit a leaderboard name or score, you are responsible for it and must not impersonate another person, submit unlawful or abusive content, or manipulate the feature. Leaderboard entries may be visible to other users. We may remove content or suspend access when reasonably needed to protect users or the Service.</p>

            <h3>5. Third-party services and intellectual property</h3>
            <p>The Service may link to or embed third-party products, including TradingView and Supabase. Those products are operated independently and governed by their own terms and privacy policies. We do not control or endorse their services. Northstar and its original content are owned by their respective rights holders; these Terms grant you a limited, personal, revocable right to use the Service, not ownership of it.</p>

            <h3>6. Availability, disclaimers, and liability</h3>
            <p>We may change, suspend, or discontinue any part of the Service. To the extent permitted by law, the Service is provided “as is” and “as available,” without warranties of any kind. To the extent permitted by law, Northstar and its operator will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data, profits, or trading losses arising from your use of the Service. Nothing in these Terms excludes liability that cannot lawfully be excluded.</p>

            <h3>7. Changes, termination, and contact</h3>
            <p>We may update these Terms by posting a revised version and updating the date above. Continued use after an update means you accept the revised Terms, where permitted by law. You may stop using the Service at any time. For questions or account requests, contact: <strong>[Add your support email and legal operator name]</strong>.</p>

            <h3>8. Governing law</h3>
            <p>These Terms are governed by the laws of <strong>[Add the applicable country/state or region]</strong>, excluding conflict-of-law rules, except where mandatory consumer-protection laws provide otherwise.</p>
          </section>
        ) : (
          <section className="legal-document" aria-labelledby="privacy-heading">
            <h2 id="privacy-heading">Privacy Policy</h2>
            <p>This policy describes how the Northstar Service handles information. It is a template and must be completed by the Service operator before public use. Add the operator's legal identity, contact details, and any region-specific disclosures that apply.</p>

            <h3>1. Information we handle</h3>
            <ul>
              <li><strong>Account information:</strong> email address and, if entered during signup, your name. Supabase Auth processes credentials; Northstar does not need to receive or store your plain-text password.</li>
              <li><strong>Leaderboard information:</strong> player name, score, and creation time submitted to the leaderboard database. Leaderboard entries can be read by signed-in users and should not contain private information.</li>
              <li><strong>Technical information:</strong> our hosting, authentication, and embedded service providers may process connection, device, diagnostic, and usage data as needed to provide and secure their services.</li>
            </ul>

            <h3>2. How information is used</h3>
            <p>Information is used to create and secure accounts, provide sign-in, show leaderboard entries, operate and maintain the Service, diagnose failures, and respond to support or legal requests. We do not use the Service to execute trades or make personalized investment decisions.</p>

            <h3>3. Providers and sharing</h3>
            <p>We use Supabase for authentication and database hosting. Market charts and widgets may be supplied by TradingView, which may receive information such as your IP address and browser data when its content loads. These providers handle information under their own privacy policies. We do not sell personal information. We may disclose information if required by law or when reasonably necessary to protect rights, users, and the Service.</p>

            <h3>4. Retention and security</h3>
            <p>Information is retained only as long as needed for the purposes above, subject to legal, security, and operational needs. We use reasonable safeguards, but no internet transmission or storage system can be guaranteed completely secure. Contact the Service operator to request account deletion or removal of a leaderboard entry. Deleting an account may not automatically remove separate leaderboard records unless the database is configured to do so.</p>

            <h3>5. Your choices and rights</h3>
            <p>Depending on where you live, you may have rights to access, correct, delete, or restrict use of your personal information, or to object to certain processing. Contact the operator at <strong>[Add your privacy contact email]</strong> to make a request. You can also stop using the Service and manage account credentials through Supabase where available.</p>

            <h3>6. Children and international processing</h3>
            <p>The Service is not intended for children under 13, or a higher minimum age required by local law. Our providers may process information in countries other than the country where you live, subject to the safeguards and rules that apply to them.</p>

            <h3>7. Changes and contact</h3>
            <p>We may update this policy and will post the revised version with a new date. For privacy questions or requests, contact: <strong>[Add your legal operator name, postal address, and privacy email]</strong>.</p>
          </section>
        )}
      </article>
    </main>
  )
}

export default LegalPage
