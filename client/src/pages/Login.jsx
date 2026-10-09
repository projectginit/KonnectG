import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import useAuth from "../context/useAuth";
import apiRequest from "../services/api.js";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const [emailVerificationRequired, setEmailVerificationRequired] =
    useState(false);

  /* ==========================================================
                        FORM CHANGE
  ========================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }

    if (emailVerificationRequired) {
      setEmailVerificationRequired(false);
    }
  };

  /* ==========================================================
                        FORM VALIDATION
  ========================================================== */

  const validateForm = () => {
    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      return "Please enter your email and password.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  /* ==========================================================
                            LOGIN
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || isResendingVerification) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    setEmailVerificationRequired(false);

    try {
      const data = await login(formData.email.trim(), formData.password);

      /*
        Redirect based on the authenticated user's role.
      */

      if (data.user.role === "admin" || data.user.role === "owner") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "merchant") {
        navigate("/merchant");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);

      /*
        Backend returns emailVerificationRequired: true
        when the user's email has not been verified.
      */

      if (error.data?.emailVerificationRequired) {
        setEmailVerificationRequired(true);
        setError(
          error.message ||
            "Please verify your email address before logging in.",
        );
      } else {
        setError(error.message || "Unable to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ==========================================================
                  RESEND VERIFICATION EMAIL
  ========================================================== */

  const handleResendVerification = async () => {
    const email = formData.email.trim();

    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (isResendingVerification) {
      return;
    }

    setIsResendingVerification(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      setSuccessMessage(
        data.message ||
          "If an account exists with this email, a verification email has been sent.",
      );
    } catch (error) {
      console.error("Resend verification error:", error);

      setError(
        error.message ||
          "Unable to resend the verification email. Please try again later.",
      );
    } finally {
      setIsResendingVerification(false);
    }
  };

  /* ==========================================================
                            UI
  ========================================================== */

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* ====================================================
                            BRAND PANEL
        ==================================================== */}

        <section className="auth-brand-panel">
          <div className="auth-brand-logo">K</div>

          <h1>
            Welcome back to <span>KonnectG</span>
          </h1>

          <p>
            Discover trusted businesses and services around your local
            community.
          </p>
        </section>

        {/* ====================================================
                            FORM PANEL
        ==================================================== */}

        <section className="auth-form-panel">
          <div className="auth-form-container">
            {/* HEADER */}

            <div className="auth-form-header">
              <h2>Welcome Back</h2>

              <p>Login to your KonnectG account</p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div className="auth-success" role="status">
                <CheckCircle size={18} />

                <span>{successMessage}</span>
              </div>
            )}

            {/* EMAIL VERIFICATION */}

            {emailVerificationRequired && (
              <div className="auth-verification-box">
                <div>
                  <strong>Verify your email address</strong>

                  <p>You need to verify your email before you can log in.</p>
                </div>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification || isLoading}
                  className="auth-verification-btn"
                >
                  {isResendingVerification
                    ? "Sending..."
                    : "Resend verification email"}
                </button>
              </div>
            )}

            {/* FORM */}

            <form className="auth-form" onSubmit={handleSubmit}>
              {/* ==================================================
                                EMAIL
              ================================================== */}

              <div className="auth-field">
                <label htmlFor="email">Email Address</label>

                <div className="auth-input-wrapper">
                  <Mail size={18} className="auth-input-icon" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* ==================================================
                              PASSWORD
              ================================================== */}

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>
                </div>

                <div className="auth-input-wrapper">
                  <LockKeyhole size={18} className="auth-input-icon" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* ==================================================
                            REMEMBER ME
              ================================================== */}

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading || isResendingVerification}
                  />

                  <span>Remember me</span>
                </label>
              </div>

              {/* ==================================================
                              SUBMIT
              ================================================== */}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading || isResendingVerification}
              >
                {isLoading ? (
                  <>Logging in...</>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* ====================================================
                            SIGN UP
            ==================================================== */}

            <div className="auth-switch">
              <span>Don&apos;t have an account?</span>

              <Link to="/signup">Create an account</Link>
            </div>

            {/* ====================================================
                            HOME
            ==================================================== */}

            <Link to="/" className="auth-back-home">
              ← Back to Home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
