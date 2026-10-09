import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import apiRequest from "../services/api.js";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token was provided.");
        return;
      }

      try {
        const data = await apiRequest("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        setStatus("success");
        setMessage(data.message);
      } catch (error) {
        console.error("Email verification error:", error.message);

        setStatus("error");
        setMessage(error.message || "Unable to verify your email address.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          bg-white
          p-8
          text-center
          shadow-lg
        "
      >
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Verifying your email
            </h1>

            <p className="mt-3 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Email verified!
            </h1>

            <p className="mt-3 text-sm text-gray-600">{message}</p>

            <Link
              to="/login"
              className="
                mt-6
                inline-flex
                rounded-lg
                bg-[#7B0040]
                px-6
                py-3
                text-sm
                font-bold
                text-white
                transition-opacity
                hover:opacity-90
              "
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
              !
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Verification failed
            </h1>

            <p className="mt-3 text-sm text-gray-600">{message}</p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/login"
                className="
                  rounded-lg
                  bg-[#7B0040]
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition-opacity
                  hover:opacity-90
                "
              >
                Go to Login
              </Link>

              <Link
                to="/"
                className="
                  rounded-lg
                  border
                  border-gray-300
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-gray-700
                  transition-colors
                  hover:bg-gray-50
                "
              >
                Go Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
