import { useEffect, useState } from "react";
import { Users, X, Eye, Search } from "lucide-react";
import apiRequest from "../../services/api";
import useAuth from "../../context/useAuth";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const isSuperOwner =
    currentUser?.role === "owner" && currentUser?.ownerAuthority === "super";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [roleActionLoadingId, setRoleActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // User details modal
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState("");

  const loadUsers = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (roleFilter) {
        params.append("role", roleFilter);
      }

      if (statusFilter) {
        params.append("active", statusFilter);
      }

      params.append("page", requestedPage);
      params.append("limit", 10);

      const queryString = params.toString();

      const response = await apiRequest(`/users?${queryString}`);

      setUsers(response.users || []);
      setPage(response.page || requestedPage);
      setTotalUsers(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(response.hasPreviousPage || false);
    } catch (error) {
      console.error("Load users error:", error);

      setError(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadUsers(1);
      },
      search.trim() ? 400 : 0,
    );

    return () => clearTimeout(timer);
  }, [search]);

  // ======================================================
  // VIEW USER DETAILS
  // ======================================================

  const handleViewUser = async (userId) => {
    if (!userId) {
      return;
    }

    try {
      setSelectedUserId(userId);
      setSelectedUser(null);
      setUserDetailsError("");
      setUserDetailsLoading(true);

      const response = await apiRequest(`/users/${userId}`);

      setSelectedUser(response.user || response);
    } catch (error) {
      console.error("Load user details error:", error);

      setUserDetailsError(error.message || "Unable to load user details.");
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleCloseUserDetails = () => {
    setSelectedUserId(null);
    setSelectedUser(null);
    setUserDetailsError("");
    setUserDetailsLoading(false);
  };

  // ======================================================
  // ACTIVATE / DEACTIVATE
  // ======================================================

  const handleToggleStatus = async (targetUser) => {
    if (!targetUser?._id) {
      return;
    }

    if (currentUser?._id?.toString() === targetUser._id?.toString()) {
      return;
    }

    try {
      setActionLoadingId(targetUser._id);
      setError("");
      setSuccessMessage("");

      const action = targetUser.isActive ? "deactivate" : "activate";

      const response = await apiRequest(`/users/${targetUser._id}/${action}`, {
        method: "PATCH",
      });

      setSuccessMessage(
        response.message ||
          `User ${
            action === "deactivate" ? "deactivated" : "activated"
          } successfully.`,
      );

      // Refresh current page
      await loadUsers(page);

      // Refresh open details modal if this user
      // is currently being viewed.
      if (
        selectedUserId &&
        selectedUserId.toString() === targetUser._id.toString()
      ) {
        await handleViewUser(targetUser._id);
      }
    } catch (error) {
      console.error("Toggle user status error:", error);

      setError(error.message || "Unable to update user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ======================================================
  // CHANGE USER ROLE
  // ======================================================

  const handleChangeUserRole = async (targetUser, newRole) => {
    if (!targetUser?._id || !newRole) {
      return;
    }

    if (!isSuperOwner) {
      return;
    }

    if (currentUser?._id?.toString() === targetUser._id?.toString()) {
      return;
    }

    if (targetUser.role === "owner") {
      return;
    }

    let confirmationMessage = "";

    if (newRole === "admin") {
      confirmationMessage = `Are you sure you want to make ${targetUser.name} an Admin?`;
    } else {
      confirmationMessage = `Are you sure you want to demote ${targetUser.name} to ${getRoleLabel(
        newRole,
      )}?`;
    }

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    try {
      setRoleActionLoadingId(targetUser._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/users/${targetUser._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({
          role: newRole,
        }),
      });

      setSuccessMessage(
        response.message ||
          `User role changed to ${getRoleLabel(newRole)} successfully.`,
      );

      await loadUsers(page);

      // Refresh the details modal if this user
      // is currently being viewed.
      if (
        selectedUserId &&
        selectedUserId.toString() === targetUser._id.toString()
      ) {
        await handleViewUser(targetUser._id);
      }
    } catch (error) {
      console.error("Change user role error:", error);

      setError(error.message || "Unable to change user role.");
    } finally {
      setRoleActionLoadingId(null);
    }
  };

  // ======================================================
  // FILTERS
  // ======================================================

  const handleApplyFilters = () => {
    setPage(1);
    setSuccessMessage("");
    setError("");

    loadUsers(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
    setSuccessMessage("");

    const loadAllUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest("/users?page=1&limit=10");

        setUsers(response.users || []);
        setPage(response.page || 1);
        setTotalUsers(response.total || 0);
        setTotalPages(response.totalPages || 1);
        setHasNextPage(response.hasNextPage || false);
        setHasPreviousPage(response.hasPreviousPage || false);
      } catch (error) {
        console.error("Clear filters error:", error);

        setError(error.message || "Unable to reset filters.");
      } finally {
        setLoading(false);
      }
    };

    loadAllUsers();
  };

  // ======================================================
  // PAGINATION
  // ======================================================

  const handlePreviousPage = () => {
    if (!hasPreviousPage || loading || actionLoadingId) {
      return;
    }

    loadUsers(page - 1);
  };

  const handleNextPage = () => {
    if (!hasNextPage || loading || actionLoadingId) {
      return;
    }

    loadUsers(page + 1);
  };

  // ======================================================
  // HELPERS
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role) => {
    if (!role) {
      return "—";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="admin-page">
      {/* ==================================================
                          HEADER
      ================================================== */}

      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>

          <p>
            Manage KonnectG users, merchants, administrators, and account
            status.
          </p>
        </div>
      </div>

      {/* ==================================================
                       USER MANAGEMENT
      ================================================== */}

      <div className="admin-card">
        {/* HEADER */}

        <div className="admin-card-header">
          <div className="admin-card-title">
            <Users size={20} />

            <span>
              Users
              {!loading && ` (${users.length})`}
            </span>
          </div>

          {!loading && <span>{totalUsers} total users</span>}
        </div>

        {/* ==================================================
                           FILTERS
        ================================================== */}

        <div className="user-management-filters">
          <div className="user-search-wrapper">
            <Search size={18} className="user-search-icon" />

            <input
              type="search"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              aria-label="Search users"
            />

            {search && (
              <button
                type="button"
                className="user-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
            }}
          >
            <option value="">All Roles</option>

            <option value="user">User</option>

            <option value="merchant">Merchant</option>

            <option value="admin">Admin</option>

            <option value="owner">Owner</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
            }}
          >
            <option value="">All Statuses</option>

            <option value="true">Active</option>

            <option value="false">Inactive</option>
          </select>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="admin-action-button"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="admin-action-button"
          >
            Clear
          </button>
        </div>

        {/* ==================================================
                       SUCCESS / ERROR
        ================================================== */}

        {successMessage && (
          <div className="admin-success-message">{successMessage}</div>
        )}

        {!loading && error && (
          <div className="admin-error-message">{error}</div>
        )}

        {/* ==================================================
                            LOADING
        ================================================== */}

        {loading && (
          <div className="admin-empty-state">
            <p>Loading users...</p>
          </div>
        )}

        {/* ==================================================
                         EMPTY STATE
        ================================================== */}

        {!loading && !error && users.length === 0 && (
          <div className="admin-empty-state">
            <Users size={40} />

            <h3>No users found</h3>

            <p>There are currently no users matching your filters.</p>
          </div>
        )}

        {/* ==================================================
                         USER LIST
        ================================================== */}

        {!loading && !error && users.length > 0 && (
          <div className="admin-users-list">
            {users.map((targetUser) => {
              const isCurrentUser =
                currentUser?._id?.toString() === targetUser._id?.toString();
              const isOwner = targetUser.role === "owner";
              const isStatusActionLoading = actionLoadingId === targetUser._id;

              const isRoleActionLoading =
                roleActionLoadingId === targetUser._id;
              isStatusActionLoading || isRoleActionLoading;

              return (
                <div key={targetUser._id} className="admin-user-row">
                  {/* USER INFORMATION */}

                  <div className="admin-user-main-info">
                    <strong>{targetUser.name}</strong>

                    <p>{targetUser.email}</p>

                    {targetUser.phone && <p>{targetUser.phone}</p>}
                  </div>

                  {/* ROLE */}

                  <div>
                    <span className="admin-user-role">
                      {getRoleLabel(targetUser.role)}
                    </span>
                  </div>

                  {/* STATUS */}

                  <div>
                    <span
                      className={
                        targetUser.isActive
                          ? "admin-user-status-active"
                          : "admin-user-status-inactive"
                      }
                    >
                      {targetUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* ==================================================
                      ACTIONS
================================================== */}

                  <div className="admin-user-actions">
                    {/* VIEW */}

                    <button
                      type="button"
                      className="admin-action-button admin-view-user-button"
                      onClick={() => handleViewUser(targetUser._id)}
                    >
                      <Eye size={16} />
                      View
                    </button>

                    {/* ROLE MANAGEMENT */}
                    {isOwner && (
                      <span className="admin-protected-user-label">
                        Protected Account
                      </span>
                    )}
                    {isSuperOwner &&
                      !isCurrentUser &&
                      targetUser.role !== "owner" && (
                        <>
                          {/* USER / MERCHANT → ADMIN */}

                          {(targetUser.role === "user" ||
                            targetUser.role === "merchant") && (
                            <button
                              type="button"
                              className="admin-action-button admin-role-button"
                              disabled={roleActionLoadingId === targetUser._id}
                              onClick={() =>
                                handleChangeUserRole(targetUser, "admin")
                              }
                            >
                              {roleActionLoadingId === targetUser._id
                                ? "Updating..."
                                : "Make Admin"}
                            </button>
                          )}

                          {/* ADMIN → PREVIOUS ROLE */}

                          {targetUser.role === "admin" && (
                            <button
                              type="button"
                              className="admin-action-button admin-role-danger-button"
                              disabled={roleActionLoadingId === targetUser._id}
                              onClick={() => {
                                const previousRole =
                                  targetUser.previousRole || "user";

                                handleChangeUserRole(targetUser, previousRole);
                              }}
                            >
                              {roleActionLoadingId === targetUser._id
                                ? "Updating..."
                                : `Demote to ${getRoleLabel(
                                    targetUser.previousRole || "user",
                                  )}`}
                            </button>
                          )}
                        </>
                      )}

                    {/* ACTIVATE / DEACTIVATE */}

                    {isCurrentUser ? (
                      <span className="admin-current-user-label">
                        Current Account
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          actionLoadingId === targetUser._id ||
                          roleActionLoadingId === targetUser._id
                        }
                        onClick={() => handleToggleStatus(targetUser)}
                        className="admin-action-button"
                      >
                        {actionLoadingId === targetUser._id
                          ? "Updating..."
                          : targetUser.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================================================
                          PAGINATION
        ================================================== */}

        {!loading && !error && users.length > 0 && (
          <div className="user-management-pagination">
            <button
              type="button"
              disabled={
                !hasPreviousPage || !!actionLoadingId || !!roleActionLoadingId
              }
              onClick={handlePreviousPage}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={
                !hasNextPage || !!actionLoadingId || !!roleActionLoadingId
              }
              onClick={handleNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ====================================================
                      USER DETAILS MODAL
      ==================================================== */}

      {selectedUserId && (
        <div
          className="user-details-modal-overlay"
          onClick={handleCloseUserDetails}
        >
          <div
            className="user-details-modal"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {/* MODAL HEADER */}

            <div className="user-details-modal-header">
              <div>
                <h2>User Details</h2>

                <p>Account information</p>
              </div>

              <button
                type="button"
                className="user-details-modal-close"
                onClick={handleCloseUserDetails}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            {userDetailsLoading && (
              <div className="user-details-modal-loading">
                <p>Loading user details...</p>
              </div>
            )}

            {userDetailsError && (
              <div className="admin-error-message">{userDetailsError}</div>
            )}

            {!userDetailsLoading && !userDetailsError && selectedUser && (
              <div className="user-details-content">
                {/* BASIC INFORMATION */}

                <div className="user-details-profile">
                  {selectedUser.profileImage ? (
                    <img
                      src={selectedUser.profileImage}
                      alt={selectedUser.name}
                      className="user-details-avatar"
                    />
                  ) : (
                    <div className="user-details-avatar-placeholder">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div>
                    <h3>{selectedUser.name}</h3>

                    <p>{selectedUser.email}</p>
                  </div>
                </div>

                {/* DETAILS GRID */}

                <div className="user-details-grid">
                  <div className="user-details-item">
                    <span>Phone</span>

                    <strong>{selectedUser.phone || "Not provided"}</strong>
                  </div>

                  <div className="user-details-item">
                    <span>Role</span>

                    <strong>{getRoleLabel(selectedUser.role)}</strong>
                  </div>

                  <div className="user-details-item">
                    <span>Account Status</span>

                    <strong
                      className={
                        selectedUser.isActive
                          ? "user-details-active"
                          : "user-details-inactive"
                      }
                    >
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </strong>
                  </div>

                  <div className="user-details-item">
                    <span>Email Verification</span>

                    <strong
                      className={
                        selectedUser.emailVerified
                          ? "user-details-active"
                          : "user-details-inactive"
                      }
                    >
                      {selectedUser.emailVerified ? "Verified" : "Not Verified"}
                    </strong>
                  </div>

                  <div className="user-details-item">
                    <span>Created</span>

                    <strong>{formatDate(selectedUser.createdAt)}</strong>
                  </div>

                  <div className="user-details-item">
                    <span>Last Updated</span>

                    <strong>{formatDate(selectedUser.updatedAt)}</strong>
                  </div>
                </div>

                {/* USER ID */}

                <div className="user-details-id">
                  <span>User ID</span>

                  <code>{selectedUser._id}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
