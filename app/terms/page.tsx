import type { Metadata } from "next";
import LegalLayout, { LegalSection } from "@/components/sections/LegalLayout";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms governing use of the K Gems International website, gemstone listings and private enquiries.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Terms"
      title="Terms and Conditions"
      intro="The basis on which this website, its gemstone listings and our enquiry service are provided."
      updated="October 2026"
    >
      <LegalSection number="01" title="About these terms">
        <p>
          These terms govern your use of the {site.name} website. By using the
          site, you agree to them. If you do not agree, please do not use the
          site or submit an enquiry.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Gemstone listings">
        <p>
          Listings on this website are provided for information and enquiry
          purposes. Reference numbers, specifications, origins, treatments,
          certification and availability shown in the current catalogue are
          demonstration entries pending verification against live inventory.
          They are not an offer for sale and do not create a binding contract.
        </p>
        <p>
          Gemstones are natural and individual. Colour, appearance and
          characteristics can vary under different lighting and between screens.
          Any rendering, illustration or digital gemstone on this site is
          representational, not a photograph of a specific stone unless clearly
          stated otherwise.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Availability, pricing and documentation">
        <p>
          Availability and price are confirmed privately for each stone. We do
          not publish prices or guarantee availability through the website.
          Origin, treatment and certification information is provided where it
          has been established and is confirmed for the specific gemstone before
          any transaction.
        </p>
        <p>
          No laboratory report, certificate, seal or registration number should
          be inferred from the website unless a genuine document has been
          supplied to you directly.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Enquiries">
        <p>
          Submitting an enquiry does not reserve a gemstone or create an
          obligation to purchase. We aim to respond personally, but response
          times may vary. Please provide accurate contact details and avoid
          sending sensitive financial information through the form.
        </p>
        <p>
          We may decline or close an enquiry where it appears fraudulent,
          abusive or inconsistent with these terms.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Intellectual property">
        <p>
          The {site.name} name, logo, text, layout and original visual material
          on this site are protected by applicable intellectual property laws.
          You may view and share the site for personal, non-commercial purposes.
          Reproduction or commercial use requires our written permission.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Third-party links">
        <p>
          Links to WhatsApp, Google Maps, email providers or other third-party
          services are provided for convenience. We do not control those
          services and are not responsible for their content or availability.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Limitation of liability">
        <p>
          The website is provided on an “as available” basis. To the extent
          permitted by law, we are not liable for indirect or consequential loss
          arising from use of the site or reliance on demonstration content. This
          does not exclude liability that cannot lawfully be excluded.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Governing law">
        <p>
          These terms are governed by the laws of Sri Lanka. Any dispute is
          subject to the jurisdiction of the courts of Sri Lanka, without
          prejudice to any mandatory consumer protection rights available to you.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${site.email}`} className="text-gold underline underline-offset-4">
            {site.email}
          </a>{" "}
          or discussed on {site.phoneDisplay}.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
