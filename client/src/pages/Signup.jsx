import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

import useAuth from "../context/useAuth";
import "./Auth.css";

export default function Signup() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
  };

  /* ==========================================================
                        FORM VALIDATION
  ========================================================== */

  const validateForm = () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return "Please fill in all required fields.";
    }

    if (name.length < 2) {
      return "Name must be at least 2 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }

    if (!["user", "merchant"].includes(formData.role)) {
      return "Invalid account type.";
    }

    return "";
  };

  /* ==========================================================
                          REGISTRATION
  ========================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
      });

      /*
       * Registration no longer logs the user in.
       *
       * The backend creates the account with:
       * emailVerified = false
       *
       * The user must verify their email before
       * logging in.
       */

      if (data.emailVerificationRequired) {
        setRegistrationSuccess(true);
      } else {
        setError(
          "Account was created, but email verification could not be initialized. Please try again.",
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message || "Unable to create your account. Please try again.",
      );
    } finally {
      setIsLoading(false);
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
            Join <span>KonnectG</span>
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
            {registrationSuccess ? (
              /* ==================================================
                            EMAIL VERIFICATION
              ================================================== */

              <>
                <div className="auth-form-header">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <CheckCircle
                      size={64}
                      strokeWidth={1.8}
                      style={{
                        color: "#198754",
                      }}
                    />
                  </div>

                  <h2>Check Your Email</h2>

                  <p>Your KonnectG account has been created successfully.</p>
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    padding: "18px",
                    borderRadius: "10px",
                    background: "#f8f9fa",
                    textAlign: "center",
                  }}
                >
                  <Mail
                    size={22}
                    style={{
                      marginBottom: "8px",
                      color: "#7B0040",
                    }}
                  />

                  <p
                    style={{
                      margin: 0,
                      color: "#444",
                      lineHeight: 1.6,
                    }}
                  >
                    We&apos;ve sent a verification link to:
                  </p>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#7B0040",
                      wordBreak: "break-word",
                    }}
                  >
                    {formData.email.trim()}
                  </strong>
                </div>

                <p
                  style={{
                    marginTop: "20px",
                    color: "#666",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  Please check your inbox and click the
                  <strong> Verify Email </strong>
                  button. You must verify your email before you can log in.
                </p>

                <p
                  style={{
                    marginTop: "12px",
                    color: "#888",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  If you don&apos;t see the email, check your spam or junk folder.
                </p>

                <Link
                  to="/login"
                  className="auth-submit-btn"
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                  }}
                >
                  Continue to Login
                  <ArrowRight size={18} />
                </Link>

                <Link to="/" className="auth-back-home">
                  ← Back to Home
                </Link>
              </>
            ) : (
              <>
                {/* HEADER */}

                <div className="auth-form-header">
                  <h2>Create Account</h2>

                  <p>Join your local KonnectG community</p>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
                )}

                {/* FORM */}

                <form className="auth-form" onSubmit={handleSubmit}>
                  {/* ==================================================
                                      NAME
                  ================================================== */}

                  <div className="auth-field">
                    <label htmlFor="name">Full Name</label>

                    <div className="auth-input-wrapper">
                      <User size={18} className="auth-input-icon" />

                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        autoComplete="name"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

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
                                      PHONE
                  ================================================== */}

                  <div className="auth-field">
                    <label htmlFor="phone">Phone Number</label>

                    <div className="auth-input-wrapper">
                      <Phone size={18} className="auth-input-icon" />

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* ==================================================
                                  ACCOUNT TYPE
                  ================================================== */}

                  <div className="auth-field">
                    <label htmlFor="role">Account Type</label>

                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={isLoading}
                    >
                      <option value="user">User</option>

                      <option value="merchant">Merchant</option>
                    </select>
                  </div>

                  {/* ==================================================
                                    PASSWORD
                  ================================================== */}

                  <div className="auth-field">
                    <label htmlFor="password">Password</label>

                    <div className="auth-input-wrapper">
                      <LockKeyhole size={18} className="auth-input-icon" />

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
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
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ==================================================
                                CONFIRM PASSWORD
                  ================================================== */}

                  <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>

                    <div className="auth-input-wrapper">
                      <LockKeyhole size={18} className="auth-input-icon" />

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />

                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ==================================================
                                    SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    className="auth-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>Creating account...</>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* ==================================================
                                  LOGIN
                ================================================== */}

                <div className="auth-switch">
                  <span>Already have an account?</span>

                  <Link to="/login">Login</Link>
                </div>

                {/* ==================================================
                                  HOME
                ================================================== */}

                <Link to="/" className="auth-back-home">
                  ← Back to Home
                </Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
