import { useState } from "react";

export default function NotifyForm() {
  const [businessName, setBusinessName] = useState("");

  const [status, setStatus] = useState("idle");
  // idle | submitting | success | error


  /* ==========================================================
                        SUBMIT
  ========================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = businessName.trim();

    if (!trimmedName) {
      return;
    }

    setStatus("submitting");

    /*
      Backend integration will eventually go here.

      Example:

      await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName: trimmedName,
        }),
      });
    */

    try {
      // Temporary frontend-only simulation.
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      console.log(
        "Business suggestion:",
        trimmedName
      );

      setBusinessName("");

      setStatus("success");

    } catch (error) {

      console.error(
        "Business suggestion failed:",
        error
      );

      setStatus("error");
    }
  };


  /* ==========================================================
                            RENDER
  ========================================================== */

  return (
    <section
      className="
        px-5
        py-8
        sm:px-6
      "
      aria-labelledby="business-suggestion-title"
    >

      <div
        className="
          mx-auto
          max-w-6xl
          rounded-[28px]
          bg-gradient-to-br
          from-[#F8E9F3]
          to-[#FBF7DA]
          px-5
          py-12
          text-center
          sm:px-16
          sm:py-14
        "
      >

        {/* ==================================================
                            HEADING
        ================================================== */}

        <h2
          id="business-suggestion-title"
          className="
            text-2xl
            font-bold
            text-slate-800
            sm:text-3xl
          "
        >
          Know a Great Local Business?
        </h2>


        {/* ==================================================
                            DESCRIPTION
        ================================================== */}

        <p
          className="
            mx-auto
            mt-2.5
            max-w-md
            text-sm
            leading-6
            text-slate-500
            sm:text-base
          "
        >
          Recommend a business from your community.
          Help them get discovered!
        </p>


        {/* ==================================================
                            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            mx-auto
            mt-7
            flex
            max-w-md
            flex-col
            gap-3
            sm:flex-row
          "
        >

          <label
            htmlFor="business-suggestion"
            className="sr-only"
          >
            Business name or type
          </label>


          <input
            id="business-suggestion"
            type="text"
            value={businessName}
            onChange={(event) => {
              setBusinessName(
                event.target.value
              );

              if (status !== "idle") {
                setStatus("idle");
              }
            }}
            placeholder="Business name or type..."
            disabled={status === "submitting"}
            maxLength={150}
            autoComplete="off"
            className="
              min-w-0
              flex-1
              rounded-full
              border
              border-[#E5E0EE]
              bg-white
              px-5
              py-3
              text-sm
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-purple-600
              focus:ring-2
              focus:ring-purple-600/10
              disabled:cursor-not-allowed
              disabled:bg-slate-50
            "
          />


          <button
            type="submit"
            disabled={
              !businessName.trim() ||
              status === "submitting"
            }
            className="
              rounded-full
              bg-purple-700
              px-7
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-purple-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {status === "submitting"
              ? "Submitting..."
              : "Suggest"}
          </button>

        </form>


        {/* ==================================================
                            SUCCESS
        ================================================== */}

        {status === "success" && (

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-emerald-600
            "
            role="status"
          >
            Thanks! We&apos;ll review the suggestion
            and reach out to them shortly.
          </p>

        )}


        {/* ==================================================
                            ERROR
        ================================================== */}

        {status === "error" && (

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-red-600
            "
            role="alert"
          >
            Something went wrong. Please try again.
          </p>

        )}

      </div>

    </section>
  );
}