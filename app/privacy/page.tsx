import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/sections/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How K Gems International collects, uses and protects personal information submitted through gemstone enquiries.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="How we handle the information you share with us when you enquire about a gemstone or contact our team."
      updated="October 2026"
    >
      <LegalSection number="01" title="Who we are">
        <p>
          {site.legalName}, company registration {site.registration}, is a
          gemstone business with a head office at 199 2/1, Galle Road, Colombo
          03, Sri Lanka, and a branch in Oddamavadi, Sri Lanka. For privacy
          questions, contact us at{" "}
          <a href={`mailto:${site.email}`} className="text-gold underline underline-offset-4">
            {site.email}
          </a>{" "}
          or on {site.phoneDisplay}.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Information we collect">
        <p>
          When you submit the enquiry form, we collect the details you choose to
          provide: your name, email address, phone or WhatsApp number, country,
          gemstone of interest, optional budget range, your message and your
          confirmation of consent.
        </p>
        <p>
          Our hosting and infrastructure providers may process limited technical
          information, such as request logs, as necessary to deliver and secure
          the website. We do not use advertising cookies or third-party
          advertising trackers on this site.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Why we use it">
        <p>
          We use your information to respond to your enquiry, discuss gemstone
          availability and documentation, arrange a viewing where appropriate, and
          keep a record of the correspondence. We do not sell or rent personal
          information.
        </p>
      </LegalSection>

      <LegalSection number="04" title="How it is stored and shared">
        <p>
          Enquiries are stored securely on our systems and may be shared with
          service providers that help us operate the website, email or messaging
          tools. Those providers receive only what is necessary to perform their
          service. We may also disclose information where required by law.
        </p>
        <p>
          Please avoid sending sensitive financial information, such as card
          numbers, through the enquiry form. Payment arrangements, where relevant,
          are discussed separately.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Retention">
        <p>
          We retain enquiry records only for as long as needed to respond and
          maintain a reasonable record of the relationship, or for the period
          required by applicable law. You may ask us to delete an enquiry that has
          not resulted in a transaction.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Your rights">
        <p>
          Subject to applicable law, you may request access to the personal
          information we hold about you, ask for corrections, request deletion, or
          withdraw consent for future contact. To exercise these rights, email{" "}
          <a href={`mailto:${site.email}`} className="text-gold underline underline-offset-4">
            {site.email}
          </a>
          . We may need to verify your identity before responding.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Links to other services">
        <p>
          The site includes links to WhatsApp, Google Maps and email tools. When
          you use those links, the relevant provider’s own privacy policy applies.
          We encourage you to review it before sharing information.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Changes">
        <p>
          We may update this policy to reflect changes in our practices or the
          law. The revised version will be published on this page with a new
          update date.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
