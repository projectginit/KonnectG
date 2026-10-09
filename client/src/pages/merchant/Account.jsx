// import { useContext } from "react";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

import "./Merchant.css";

function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    const name = user?.name || user?.email || "Merchant";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  return (
    <div className="merchant-account-page">
      <div className="merchant-account-header">
        <div>
          <h1>Account</h1>

          <p>Manage your merchant account settings.</p>
        </div>
      </div>

      <section className="merchant-account-profile-card">
        <div className="merchant-account-avatar">{getInitials()}</div>

        <div className="merchant-account-profile-info">
          <h2>{user?.name || "Merchant"}</h2>

          <p>{user?.email || "No email available"}</p>

          <span className="merchant-account-role">
            {user?.role || "merchant"}
          </span>
        </div>
      </section>

      <section className="merchant-account-section">
        <div className="merchant-account-section-heading">
          <div>
            <h2>Account Information</h2>

            <p>Your current account details.</p>
          </div>
        </div>

        <div className="merchant-account-details">
          <div className="merchant-account-field">
            <span className="merchant-account-label">Full Name</span>

            <strong>{user?.name || "Not provided"}</strong>
          </div>

          <div className="merchant-account-field">
            <span className="merchant-account-label">Email Address</span>

            <strong>{user?.email || "Not provided"}</strong>
          </div>

          <div className="merchant-account-field">
            <span className="merchant-account-label">Phone Number</span>

            <strong>{user?.phone || "Not provided"}</strong>
          </div>

          <div className="merchant-account-field">
            <span className="merchant-account-label">Account Role</span>

            <strong className="merchant-account-role-text">
              {user?.role || "merchant"}
            </strong>
          </div>
        </div>
      </section>

      <section className="merchant-account-section">
        <div className="merchant-account-section-heading">
          <div>
            <h2>Security</h2>

            <p>Manage your account access.</p>
          </div>
        </div>

        <div className="merchant-account-security-row">
          <div>
            <h3>Password</h3>

            <p>
              Your password is securely managed through your KonnectG account.
            </p>
          </div>

          <button
            type="button"
            className="merchant-account-secondary-button"
            disabled
          >
            Change Password
          </button>
        </div>
      </section>

      <section className="merchant-account-section merchant-account-danger-section">
        <div className="merchant-account-section-heading">
          <div>
            <h2>Account Actions</h2>

            <p>Sign out of your KonnectG merchant account.</p>
          </div>
        </div>

        <button
          type="button"
          className="merchant-account-logout-button"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </section>
    </div>
  );
}

export default Account;
