import { useEffect, useState } from "react";
import { CheckCircle, Edit3, Shield, UserCircle, X } from "lucide-react";

import useAuth from "../../context/useAuth";
import apiRequest from "../../services/api";

import "./Admin.css";

function Profile() {
  const { user, loading, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ==========================================================
                        LOAD USER DATA
  ========================================================== */

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name || "");
    setPhone(user.phone || "");
    setProfileImage(user.profileImage || "");
  }, [user]);

  /* ==========================================================
                          HELPERS
  ========================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (value) => {
    if (!value?.trim()) {
      return "A";
    }

    return value
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";

  const roleLabel = isOwner ? "Owner" : "Administrator";

  const authorityLabel =
    user?.ownerAuthority === "super"
      ? "Super Owner"
      : user?.ownerAuthority === "standard"
        ? "Standard Owner"
        : null;

  /* ==========================================================
                          EDIT PROFILE
  ========================================================== */

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setName(user?.name || "");
    setPhone(user?.phone || "");
    setProfileImage(user?.profileImage || "");

    setIsEditing(true);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setProfileImage(user?.profileImage || "");

    setError("");
    setSuccess("");

    setIsEditing(false);
  };

  /* ==========================================================
                          SAVE PROFILE
  ========================================================== */

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone number cannot be empty.");
      return;
    }

    try {
      setSaving(true);

      await apiRequest("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          profileImage: profileImage.trim(),
        }),
      });

      await refreshUser();

      setSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);

      setError(error.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
                          LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="profile-page">
        <div className="admin-loading">Loading profile...</div>
      </div>
    );
  }

  /* ==========================================================
                        NO USER
  ========================================================== */

  if (!user) {
    return (
      <div className="profile-page">
        <div className="admin-error-message">Unable to load your profile.</div>
      </div>
    );
  }

  /* ==========================================================
                    ROLE PROTECTION
  ========================================================== */

  if (!isAdmin && !isOwner) {
    return (
      <div className="profile-page">
        <div className="admin-error-message">
          This profile section is only available to administrators and owners.
        </div>
      </div>
    );
  }

  /* ==========================================================
                          PAGE
  ========================================================== */

  return (
    <div className="profile-page">
      {/* ======================================================
                            HEADER
      ====================================================== */}

      <div className="profile-page-header">
        <div>
          <h1 className="admin-header">My Profile</h1>

          <p>Manage your personal information and view your account details.</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="admin-add-btn profile-edit-button"
            onClick={handleEdit}
          >
            <Edit3 size={17} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* ======================================================
                            MESSAGES
      ====================================================== */}

      {error && <div className="admin-error-message">{error}</div>}

      {success && <div className="admin-success-message">{success}</div>}

      {/* ======================================================
                        PROFILE HERO
      ====================================================== */}

      <section className="profile-hero-card">
        <div className="profile-avatar">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.name || "User"} profile`}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
        </div>

        <div className="profile-hero-info">
          <h2>{user.name || "Unnamed User"}</h2>

          <p>{user.email || "No email available"}</p>

          <div className="profile-hero-badges">
            <span className="profile-role-badge">
              <Shield size={15} />
              {roleLabel}
            </span>

            {authorityLabel && (
              <span className="profile-authority-badge">{authorityLabel}</span>
            )}

            <span
              className={
                user.isActive
                  ? "profile-active-badge"
                  : "profile-inactive-badge"
              }
            >
              <span className="profile-status-dot" />

              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      {/* ======================================================
                          EDIT MODE
      ====================================================== */}

      {isEditing ? (
        <form className="profile-section-card" onSubmit={handleSave}>
          <div className="profile-section-header">
            <div>
              <h2>Edit Profile</h2>

              <p>Update your personal information.</p>
            </div>
          </div>

          <div className="profile-form-grid">
            {/* NAME */}

            <div className="profile-form-group">
              <label htmlFor="profile-name">Full Name</label>

              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                maxLength={100}
                disabled={saving}
              />
            </div>

            {/* PHONE */}

            <div className="profile-form-group">
              <label htmlFor="profile-phone">Phone</label>

              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                disabled={saving}
              />
            </div>

            {/* PROFILE IMAGE */}

            <div className="profile-form-group profile-form-full">
              <label htmlFor="profile-image">Profile Image URL</label>

              <input
                id="profile-image"
                type="url"
                value={profileImage}
                onChange={(event) => setProfileImage(event.target.value)}
                placeholder="https://example.com/profile.jpg"
                disabled={saving}
              />

              <span className="profile-input-help">
                Enter a publicly accessible image URL.
              </span>
            </div>
          </div>

          {/* FORM ACTIONS */}

          <div className="profile-form-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </button>

            <button type="submit" className="approve-btn" disabled={saving}>
              <CheckCircle size={16} />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* ==================================================
                      PERSONAL INFORMATION
          ================================================== */}

          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h2>Personal Information</h2>

                <p>Your basic account information.</p>
              </div>
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail">
                <span className="profile-detail-label">Full Name</span>

                <strong>{user.name || "Not provided"}</strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">Phone</span>

                <strong>{user.phone || "Not provided"}</strong>
              </div>

              <div className="profile-detail profile-detail-full">
                <span className="profile-detail-label">Email</span>

                <strong>{user.email || "Not provided"}</strong>
              </div>
            </div>
          </section>

          {/* ==================================================
                        ACCOUNT INFORMATION
          ================================================== */}

          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h2>Account Information</h2>

                <p>Your KonnectG administrative account details.</p>
              </div>
            </div>

            <div className="profile-details-grid">
              {/* ROLE */}

              <div className="profile-detail">
                <span className="profile-detail-label">Role</span>

                <strong>{roleLabel}</strong>
              </div>

              {/* OWNER AUTHORITY */}

              {isOwner && (
                <div className="profile-detail">
                  <span className="profile-detail-label">Owner Authority</span>

                  <strong>{authorityLabel || "Not assigned"}</strong>
                </div>
              )}

              {/* EMAIL */}

              <div className="profile-detail">
                <span className="profile-detail-label">Email Verification</span>

                <strong
                  className={
                    user.emailVerified
                      ? "profile-verified"
                      : "profile-unverified"
                  }
                >
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </strong>
              </div>

              {/* STATUS */}

              <div className="profile-detail">
                <span className="profile-detail-label">Account Status</span>

                <strong
                  className={
                    user.isActive ? "profile-verified" : "profile-unverified"
                  }
                >
                  {user.isActive ? "Active" : "Inactive"}
                </strong>
              </div>

              {/* CREATED */}

              <div className="profile-detail">
                <span className="profile-detail-label">Account Created</span>

                <strong>{formatDate(user.createdAt)}</strong>
              </div>

              {/* UPDATED */}

              <div className="profile-detail">
                <span className="profile-detail-label">Last Updated</span>

                <strong>{formatDate(user.updatedAt)}</strong>
              </div>
            </div>
          </section>

          {/* ==================================================
                            SECURITY
          ================================================== */}

          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <h2>Security</h2>

                <p>Security information for your administrative account.</p>
              </div>
            </div>

            <div className="profile-security-row">
              <div className="profile-security-icon">
                <UserCircle size={22} />
              </div>

              <div className="profile-security-content">
                <strong>Password</strong>

                <span>
                  Password changes will be available through the dedicated
                  security settings.
                </span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Profile;
