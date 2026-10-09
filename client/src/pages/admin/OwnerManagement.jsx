import { useEffect, useState } from "react";

import { ShieldCheck, Shield, UserPlus, Crown, ArrowDown } from "lucide-react";

import apiRequest from "../../services/api.js";

const OwnerManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [adminCandidates, setAdminCandidates] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [owners, setOwners] = useState([]);

  const [loading, setLoading] = useState(true);

  const [assigningUserId, setAssigningUserId] = useState(null);

  const [changingUserId, setChangingUserId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  /* ==========================================================
                    LOAD MANAGEMENT DATA
  ========================================================== */

  const loadManagementData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        currentUserResponse,
        candidatesResponse,
        adminCandidatesResponse,
        adminsResponse,
        ownersResponse,
      ] = await Promise.all([
        apiRequest("/users/me"),
        apiRequest("/users/owner-candidates"),
        apiRequest("/users/admin-candidates"),
        apiRequest("/users/admins"),
        apiRequest("/users/owners"),
      ]);

      setCurrentUser(currentUserResponse.user);

      setCandidates(candidatesResponse.users || []);

      setAdminCandidates(adminCandidatesResponse.users || []);

      setAdmins(adminsResponse.users || []);

      setOwners(ownersResponse.users || []);
    } catch (error) {
      console.error("Owner management data error:", error);

      setError(error.message || "Unable to load owner management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagementData();
  }, []);

  /* ==========================================================
                    CLEAR MESSAGES
  ========================================================== */

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  /* ==========================================================
                    MAKE OWNER
  ========================================================== */

  const handleAssignOwner = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to make ${user.name} an owner?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setAssigningUserId(user._id);
      clearMessages();

      await apiRequest(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: "owner",
        }),
      });

      setSuccessMessage(`${user.name} is now a Standard Owner.`);

      await loadManagementData();
    } catch (error) {
      console.error("Assign owner error:", error);

      setError(error.message || "Unable to assign owner role.");
    } finally {
      setAssigningUserId(null);
    }
  };

  /* ==========================================================
                    MAKE ADMIN
  ========================================================== */

  const handleMakeAdmin = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to make ${user.name} an administrator?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingUserId(user._id);
      clearMessages();

      await apiRequest(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: "admin",
        }),
      });

      setSuccessMessage(`${user.name} is now an Administrator.`);

      await loadManagementData();
    } catch (error) {
      console.error("Make admin error:", error);

      setError(error.message || "Unable to assign admin role.");
    } finally {
      setChangingUserId(null);
    }
  };

  /* ==========================================================
                    DEMOTE ADMIN
  ========================================================== */

  const handleDemoteAdmin = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the administrator role from ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingUserId(user._id);
      clearMessages();

      await apiRequest(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: "user",
        }),
      });

      setSuccessMessage(`${user.name} is no longer an Administrator.`);

      await loadManagementData();
    } catch (error) {
      console.error("Demote admin error:", error);

      setError(error.message || "Unable to remove admin role.");
    } finally {
      setChangingUserId(null);
    }
  };

  /* ==========================================================
                    DEMOTE OWNER
  ========================================================== */

  const handleDemoteOwner = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the owner role from ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingUserId(user._id);
      clearMessages();

      await apiRequest(`/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: "user",
        }),
      });

      setSuccessMessage(`${user.name} is no longer an Owner.`);

      await loadManagementData();
    } catch (error) {
      console.error("Demote owner error:", error);

      setError(error.message || "Unable to remove owner role.");
    } finally {
      setChangingUserId(null);
    }
  };

  /* ==========================================================
                    MAKE SUPER OWNER
  ========================================================== */

  const handleMakeSuperOwner = async (user) => {
    const confirmed = window.confirm(
      `Transfer Super Owner authority to ${user.name}? Your account will become a Standard Owner.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setChangingUserId(user._id);
      clearMessages();

      await apiRequest(`/users/${user._id}/owner-authority`, {
        method: "PATCH",
        body: JSON.stringify({
          ownerAuthority: "super",
        }),
      });

      setSuccessMessage(
        `Super Owner authority has been transferred to ${user.name}.`,
      );

      await loadManagementData();
    } catch (error) {
      console.error("Transfer Super Owner error:", error);

      setError(error.message || "Unable to transfer Super Owner authority.");
    } finally {
      setChangingUserId(null);
    }
  };

  /* ==========================================================
                        LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p>Loading owner management...</p>
        </div>
      </div>
    );
  }

  const isSuperOwner =
    currentUser?.role === "owner" && currentUser?.ownerAuthority === "super";

  return (
    <div className="admin-page">
      {/* ======================================================
                            HEADER
      ====================================================== */}

      <div className="admin-page-header">
        <div>
          <h1>Owner Management</h1>

          <p>Manage owners, administrators, and platform authority.</p>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-3">
            {isSuperOwner ? <Crown size={24} /> : <ShieldCheck size={24} />}

            <div>
              <strong>{isSuperOwner ? "Super Owner" : "Standard Owner"}</strong>

              <p>{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
                            MESSAGES
      ====================================================== */}

      {error && <div className="auth-error">{error}</div>}

      {successMessage && <div className="auth-success">{successMessage}</div>}

      {/* ======================================================
                        PROMOTE OWNERS
      ====================================================== */}

      <section className="admin-card">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus size={22} />

          <div>
            <h2>Promote Owners</h2>

            <p>Promote verified users and merchants to Standard Owner.</p>
          </div>
        </div>

        {candidates.length === 0 ? (
          <p>There are currently no eligible accounts to promote.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {candidates.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{user.role}</td>

                    <td>
                      <button
                        type="button"
                        className="admin-action-btn"
                        disabled={assigningUserId === user._id}
                        onClick={() => handleAssignOwner(user)}
                      >
                        {assigningUserId === user._id
                          ? "Assigning..."
                          : "Make Owner"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ======================================================
                    SUPER OWNER MANAGEMENT
      ====================================================== */}

      {isSuperOwner && (
        <>
          {/* ==================================================
                    MANAGE ADMINISTRATORS
          ================================================== */}

          <section className="admin-card">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={22} />

              <div>
                <h2>Manage Administrators</h2>

                <p>
                  Promote verified users and merchants or remove the
                  Administrator role.
                </p>
              </div>
            </div>

            {/* ==================================================
                        ADMIN CANDIDATES
            ================================================== */}

            <div className="mb-6">
              <h3>Eligible Accounts</h3>

              <p>
                Verified and active users or merchants can be promoted to
                Administrator.
              </p>

              {adminCandidates.length === 0 ? (
                <p>There are currently no eligible accounts to promote.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Current Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {adminCandidates.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>

                          <td>{user.email}</td>

                          <td>{user.role}</td>

                          <td>
                            <button
                              type="button"
                              className="admin-action-btn"
                              disabled={changingUserId === user._id}
                              onClick={() => handleMakeAdmin(user)}
                            >
                              {changingUserId === user._id
                                ? "Assigning..."
                                : "Make Admin"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ==================================================
                    CURRENT ADMINISTRATORS
            ================================================== */}

            <div>
              <h3>Current Administrators</h3>

              {admins.length === 0 ? (
                <p>There are currently no active administrators.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Verified</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {admins.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>

                          <td>{user.email}</td>

                          <td>
                            {user.emailVerified ? "Verified" : "Not Verified"}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="admin-action-btn"
                              disabled={changingUserId === user._id}
                              onClick={() => handleDemoteAdmin(user)}
                            >
                              {changingUserId === user._id
                                ? "Updating..."
                                : "Demote"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ==================================================
                        MANAGE OWNERS
          ================================================== */}

          <section className="admin-card">
            <div className="flex items-center gap-3 mb-4">
              <Crown size={22} />

              <div>
                <h2>Manage Owners</h2>

                <p>Manage owner accounts and transfer Super Owner authority.</p>
              </div>
            </div>

            {owners.length === 0 ? (
              <p>There are currently no active owners.</p>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Authority</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {owners.map((user) => {
                      const isCurrentUser = currentUser?._id === user._id;

                      const isSuper = user.ownerAuthority === "super";

                      return (
                        <tr key={user._id}>
                          <td>
                            <div>
                              <strong>{user.name}</strong>

                              {isCurrentUser && <div>You</div>}
                            </div>
                          </td>

                          <td>{user.email}</td>

                          <td>{isSuper ? "Super Owner" : "Standard Owner"}</td>

                          <td>
                            {!isCurrentUser && !isSuper && (
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  disabled={changingUserId === user._id}
                                  onClick={() => handleMakeSuperOwner(user)}
                                >
                                  {changingUserId === user._id
                                    ? "Updating..."
                                    : "Make Super Owner"}
                                </button>

                                <button
                                  type="button"
                                  className="admin-action-btn"
                                  disabled={changingUserId === user._id}
                                  onClick={() => handleDemoteOwner(user)}
                                >
                                  <ArrowDown size={16} />
                                  Demote
                                </button>
                              </div>
                            )}

                            {isSuper && <span>Highest Authority</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OwnerManagement;
