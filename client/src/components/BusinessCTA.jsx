import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const GOOGLE_SCRIPT_URL = import.meta.env.VITE_MERCHANT_LEAD_URL;

export default function BusinessCTA() {
  const [form, setForm] = useState({
    name: "",
    business: "",
    phone: "",
  });

  const [status, setStatus] = useState("idle");
  // idle | submitting | success | error

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, "");

    return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const business = form.business.trim();
    const phone = form.phone.trim();

    if (!name || !business || !phone) {
      setStatus("error");
      setErrorMessage("Please fill in all three fields.");
      return;
    }

    if (!validatePhone(phone)) {
      setStatus("error");
      setErrorMessage("Please enter a valid Indian phone number.");
      return;
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.error("VITE_MERCHANT_LEAD_URL is not configured.");

      setStatus("error");
      setErrorMessage(
        "The form is temporarily unavailable. Please try again later.",
      );

      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          name,
          business,
          phone,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Unable to submit your details.");
      }

      setForm({
        name: "",
        business: "",
        phone: "",
      });

      setStatus("success");
    } catch (error) {
      console.error("Merchant lead submission failed:", error);

      setStatus("error");

      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section
      className="
        px-5
        py-8
        pb-14
        sm:px-6
        sm:pb-16
      "
      aria-labelledby="business-cta-title"
    >
      <div
        className="
          mx-auto
          max-w-6xl
          overflow-hidden
          rounded-[28px]
          bg-gradient-to-br
          from-purple-950
          via-purple-600
          to-purple-700
          px-6
          py-12
          text-white
          shadow-xl
          shadow-purple-950/10
          sm:px-16
          sm:py-16
        "
      >
        <div className="mx-auto max-w-2xl text-center">
          {/* ==================================================
                              BADGE
          ================================================== */}

          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-white/10
              px-4
              py-1.5
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-purple-100
              ring-1
              ring-white/10
            "
          >
            For Local Businesses
          </span>

          {/* ==================================================
                              HEADING
          ================================================== */}

          <h2
            id="business-cta-title"
            className="
              mt-5
              text-2xl
              font-bold
              leading-tight
              sm:text-3xl
            "
          >
            Want Your Business on KonnectG?
          </h2>

          {/* ==================================================
                            DESCRIPTION
          ================================================== */}

          <p
            className="
              mx-auto
              mt-4
              max-w-lg
              text-sm
              leading-6
              text-purple-100
              sm:text-base
              sm:leading-7
            "
          >
            Tell us a little about your business. We&apos;ll contact you and
            help get your business listed on KonnectG.
          </p>

          {/* ==================================================
                              FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="
              mx-auto
              mt-8
              max-w-xl
              space-y-3
              text-left
            "
          >
            {/* NAME */}

            <div>
              <label
                htmlFor="merchant-lead-name"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-purple-100
                "
              >
                Your Name
              </label>

              <input
                id="merchant-lead-name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                maxLength={100}
                autoComplete="name"
                disabled={status === "submitting"}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/15
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-gold
                  focus:ring-2
                  focus:ring-gold/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* BUSINESS */}

            <div>
              <label
                htmlFor="merchant-lead-business"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-purple-100
                "
              >
                Business / Service
              </label>

              <input
                id="merchant-lead-business"
                name="business"
                type="text"
                value={form.business}
                onChange={handleChange}
                placeholder="e.g. Sharma Electronics / AC Repair"
                maxLength={150}
                autoComplete="organization"
                disabled={status === "submitting"}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/15
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-gold
                  focus:ring-2
                  focus:ring-gold/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* PHONE */}

            <div>
              <label
                htmlFor="merchant-lead-phone"
                className="
                  mb-1.5
                  block
                  text-xs
                  font-semibold
                  text-purple-100
                "
              >
                Phone Number
              </label>

              <input
                id="merchant-lead-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={13}
                inputMode="numeric"
                autoComplete="tel"
                disabled={status === "submitting"}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/15
                  bg-white
                  px-4
                  py-3.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-400
                  focus:border-gold
                  focus:ring-2
                  focus:ring-gold/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="
                mt-3
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gold
                px-6
                py-3.5
                text-sm
                font-bold
                text-purple-950
                shadow-lg
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-60
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-gold
              "
            >
              {status === "submitting" ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                "Get Started →"
              )}
            </button>
          </form>

          {/* ==================================================
                              SUCCESS
          ================================================== */}

          {status === "success" && (
            <div
              className="
                mx-auto
                mt-5
                flex
                max-w-xl
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-400/10
                px-4
                py-3
                text-sm
                font-medium
                text-emerald-200
              "
              role="status"
            >
              <CheckCircle2 size={17} aria-hidden="true" />
              Thanks! We&apos;ll contact you shortly.
            </div>
          )}

          {/* ==================================================
                              ERROR
          ================================================== */}

          {status === "error" && (
            <p
              className="
                mx-auto
                mt-4
                max-w-xl
                text-sm
                font-medium
                text-red-200
              "
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {/* ==================================================
                            FOOTNOTE
          ================================================== */}

          <p
            className="
              mt-5
              text-xs
              text-purple-200
            "
          >
            No account required. We&apos;ll contact you to help get your
            business listed.
          </p>
        </div>
      </div>
    </section>
  );
}
