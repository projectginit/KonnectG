import { useState } from "react";

const CONSENT_KEY = "konnectg_legal_consent";

export default function LegalModal({ onAccept }) {
  const [activeSection, setActiveSection] = useState("terms");

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "true");
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#66023c] text-lg font-bold text-white">
              K
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Welcome to KonnectG
              </h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Please review our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 sm:px-7">
          <button
            type="button"
            onClick={() => setActiveSection("terms")}
            className={`border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
              activeSection === "terms"
                ? "border-[#66023c] text-[#66023c]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Terms & Conditions
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("privacy")}
            className={`ml-6 border-b-2 px-1 py-3 text-sm font-semibold transition-colors ${
              activeSection === "privacy"
                ? "border-[#66023c] text-[#66023c]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {activeSection === "terms" ? (
            <div className="space-y-6 text-sm leading-6 text-slate-600">
              <section>
                <h3 className="mb-2 text-base font-bold text-slate-900">
                  Terms of Use
                </h3>

                <p className="mb-4">
                  Welcome to KonnectG. By accessing or using this platform, you
                  agree to the following:
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Purpose of the Platform
                </h4>

                <p>
                  KonnectG is a hyperlocal discovery platform that helps users
                  find nearby verified services and businesses.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Platform Role
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>We act only as a connector.</li>
                  <li>We do not provide services directly.</li>
                  <li>
                    Transactions, pricing and service delivery are between
                    users and businesses.
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  User Responsibilities
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>Provide accurate information.</li>
                  <li>Do not misuse the platform.</li>
                  <li>Do not post false or misleading content.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Limitations
                </h4>

                <p>
                  KonnectG is not responsible for service quality, disputes,
                  delays or outcomes between users and businesses.
                </p>

                <p className="mt-2">
                  We reserve the right to update these terms as the platform
                  evolves.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Merchant Listing Policy
                </h4>

                <p className="mb-3">
                  Our goal is trust and quality.
                </p>

                <h5 className="mb-1 font-semibold text-slate-800">
                  Eligibility
                </h5>

                <ul className="mb-3 list-disc space-y-1 pl-5">
                  <li>Local businesses operating within listed areas.</li>
                  <li>Genuine services with valid contact details.</li>
                </ul>

                <h5 className="mb-1 font-semibold text-slate-800">
                  Verification
                </h5>

                <ul className="mb-3 list-disc space-y-1 pl-5">
                  <li>
                    Listings may be verified through calls, documents or
                    physical checks.
                  </li>
                  <li>Verification status is displayed for transparency.</li>
                </ul>

                <h5 className="mb-1 font-semibold text-slate-800">
                  Listing Rules
                </h5>

                <ul className="mb-3 list-disc space-y-1 pl-5">
                  <li>Accurate business information is mandatory.</li>
                  <li>Misleading claims or fake listings are not allowed.</li>
                </ul>

                <h5 className="mb-1 font-semibold text-slate-800">
                  Delisting
                </h5>

                <p>
                  KonnectG reserves the right to suspend or remove listings
                  that violate trust, accuracy or community standards.
                  Listings are informational and discovery-based only.
                </p>
              </section>

              <section className="rounded-xl bg-slate-50 p-4">
                <h4 className="mb-2 font-bold text-slate-800">
                  Disclaimer
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    KonnectG does not guarantee service quality, availability
                    or pricing.
                  </li>
                  <li>We are not involved in transactions or payments.</li>
                  <li>
                    Any disputes must be resolved directly between the user
                    and the service provider.
                  </li>
                  <li>Using the platform is at your discretion.</li>
                </ul>
              </section>
            </div>
          ) : (
            <div className="space-y-6 text-sm leading-6 text-slate-600">
              <section>
                <h3 className="mb-2 text-base font-bold text-slate-900">
                  Privacy Policy
                </h3>

                <p className="text-xs text-slate-400">
                  Last updated: 11th October, 2026
                </p>

                <p className="mt-4">
                  At KonnectG, your privacy matters. We collect only what is
                  necessary to connect you with trusted local businesses.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  What Information We Collect
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Name, phone number or email when you sign up or request
                    alerts.
                  </li>
                  <li>
                    Business details provided by merchants for listing and
                    verification.
                  </li>
                  <li>Basic usage data to improve platform performance.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  How We Use Your Information
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>To connect users with local businesses.</li>
                  <li>To verify listings and prevent spam or fraud.</li>
                  <li>
                    To send important updates related to the platform.
                  </li>
                  <li>We do NOT sell or misuse your data.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  What We Do NOT Do
                </h4>

                <ul className="list-disc space-y-1 pl-5">
                  <li>No spam calls.</li>
                  <li>No selling your phone number.</li>
                  <li>No unnecessary tracking.</li>
                </ul>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Data Protection
                </h4>

                <p>
                  We take reasonable technical and organisational measures to
                  protect your data. Only authorised access is allowed.
                </p>
              </section>

              <section>
                <h4 className="mb-2 font-bold text-slate-800">
                  Third Parties
                </h4>

                <p>
                  We do not share your personal data with third parties except
                  when legally required.
                </p>
              </section>

              <section className="rounded-xl bg-slate-50 p-4">
                <p>
                  By using KonnectG, you agree to this Privacy Policy.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
          <p className="mb-3 text-xs leading-5 text-slate-500">
            By clicking &quot;I Agree & Continue&quot;, you acknowledge that
            you have read and agree to the Terms & Conditions and Privacy
            Policy of KonnectG.
          </p>

          <button
            type="button"
            onClick={handleAccept}
            className="w-full rounded-xl bg-[#66023c] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#52022f] focus:outline-none focus:ring-2 focus:ring-[#66023c] focus:ring-offset-2"
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}