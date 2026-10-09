import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

import ApprovalCard from "../../components/admin/approval/ApprovalCard";
import apiRequest from "../../services/api";

function Approval() {
  const [businesses, setBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ==========================================================
                        REJECTION MODAL
  ========================================================== */

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  /* ==========================================================
                    LOAD BUSINESSES
  ========================================================== */

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/businesses/admin/all?limit=100&page=1");

      setBusinesses(data.businesses || []);
    } catch (error) {
      console.error("Load approval businesses error:", error);

      setError(error.message || "Unable to load business approval data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  /* ==========================================================
                        STATUS FILTERS
  ========================================================== */

  const pending = useMemo(
    () =>
      businesses.filter((business) => business.approvalStatus === "pending"),
    [businesses],
  );

  const approved = useMemo(
    () =>
      businesses.filter((business) => business.approvalStatus === "approved"),
    [businesses],
  );

  const rejected = useMemo(
    () =>
      businesses.filter((business) => business.approvalStatus === "rejected"),
    [businesses],
  );

  const getCurrentData = () => {
    switch (activeTab) {
      case "approved":
        return approved;

      case "rejected":
        return rejected;

      default:
        return pending;
    }
  };

  /* ==========================================================
                        APPROVE
  ========================================================== */

  const handleApprove = async (businessId) => {
    try {
      setActionLoading(businessId);
      setError("");
      setSuccess("");

      await apiRequest(`/businesses/${businessId}/approve`, {
        method: "PATCH",
      });

      setSuccess("Business approved successfully.");

      await loadBusinesses();
    } catch (error) {
      console.error("Approve business error:", error);

      setError(error.message || "Unable to approve this business.");
    } finally {
      setActionLoading("");
    }
  };

  /* ==========================================================
                    OPEN REJECTION MODAL
  ========================================================== */

  const openRejectModal = (business) => {
    setSelectedBusiness(business);
    setRejectionReason("");
    setError("");
    setSuccess("");
    setShowRejectModal(true);
  };

  /* ==========================================================
                    CLOSE REJECTION MODAL
  ========================================================== */

  const closeRejectModal = () => {
    if (actionLoading) {
      return;
    }

    setShowRejectModal(false);
    setSelectedBusiness(null);
    setRejectionReason("");
  };

  /* ==========================================================
                        REJECT
  ========================================================== */

  const handleReject = async () => {
    if (!selectedBusiness?._id) {
      return;
    }

    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError("Please provide a rejection reason.");

      return;
    }

    try {
      setActionLoading(selectedBusiness._id);

      setError("");
      setSuccess("");

      await apiRequest(`/businesses/${selectedBusiness._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({
          rejectionReason: trimmedReason,
        }),
      });

      setSuccess("Business rejected successfully.");

      setShowRejectModal(false);
      setSelectedBusiness(null);
      setRejectionReason("");

      await loadBusinesses();
    } catch (error) {
      console.error("Reject business error:", error);

      setError(error.message || "Unable to reject this business.");
    } finally {
      setActionLoading("");
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="approval-page">
      {/* ======================================================
                            HEADER
      ====================================================== */}

      <div className="approval-header">
        <div>
          <h1 className="admin-header">Merchant & Service Approvals</h1>

          <p>Review and manage business approval requests.</p>
        </div>
      </div>

      {/* ======================================================
                        MESSAGES
      ====================================================== */}

      {error && <div className="admin-error-message">{error}</div>}

      {success && <div className="admin-success-message">{success}</div>}

      {/* ======================================================
                            TABS
      ====================================================== */}

      <div className="approval-tabs">
        <button
          className={activeTab === "pending" ? "tab-btn active-tab" : "tab-btn"}
          onClick={() => {
            setActiveTab("pending");
            setSuccess("");
            setError("");
          }}
        >
          🟡 Pending
          <span className="tab-count">{pending.length}</span>
        </button>

        <button
          className={
            activeTab === "approved" ? "tab-btn active-tab" : "tab-btn"
          }
          onClick={() => {
            setActiveTab("approved");
            setSuccess("");
            setError("");
          }}
        >
          🟢 Approved
          <span className="tab-count">{approved.length}</span>
        </button>

        <button
          className={
            activeTab === "rejected" ? "tab-btn active-tab" : "tab-btn"
          }
          onClick={() => {
            setActiveTab("rejected");
            setSuccess("");
            setError("");
          }}
        >
          🔴 Rejected
          <span className="tab-count">{rejected.length}</span>
        </button>
      </div>

      {/* ======================================================
                        BUSINESS LIST
      ====================================================== */}

      {loading ? (
        <div className="admin-loading">Loading approval data...</div>
      ) : currentData.length === 0 ? (
        <div className="admin-empty-state">
          No {activeTab} businesses found.
        </div>
      ) : (
        <div className="approval-slider">
          {currentData.map((business) => (
            <ApprovalCard
              key={business._id}
              merchant={business}
              onApprove={handleApprove}
              onReject={() => openRejectModal(business)}
              actionLoading={actionLoading === business._id}
            />
          ))}
        </div>
      )}

      {/* ======================================================
                    REJECTION MODAL
      ====================================================== */}

      {showRejectModal && selectedBusiness && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectModal();
            }
          }}
        >
          <div className="approval-reject-modal">
            {/* HEADER */}

            <div className="approval-reject-modal-header">
              <div>
                <h2>Reject Business</h2>

                <p>Provide a reason for rejecting this business.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeRejectModal}
                disabled={Boolean(actionLoading)}
              >
                ×
              </button>
            </div>

            {/* BUSINESS */}

            <div className="approval-reject-business">
              <strong>{selectedBusiness.name || "Unnamed Business"}</strong>

              <span>
                {selectedBusiness.categoryRef?.name ||
                  selectedBusiness.category ||
                  "Uncategorized"}
              </span>
            </div>

            {/* REASON */}

            <div className="approval-reject-form-group">
              <label htmlFor="rejectionReason">Rejection Reason *</label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Explain why this business is being rejected..."
                rows={5}
                maxLength={1000}
                autoFocus
                disabled={Boolean(actionLoading)}
              />

              <div className="approval-reject-character-count">
                {rejectionReason.length}/1000
              </div>
            </div>

            {/* ACTIONS */}

            <div className="approval-reject-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeRejectModal}
                disabled={Boolean(actionLoading)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="reject-btn"
                onClick={handleReject}
                disabled={Boolean(actionLoading) || !rejectionReason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Reject Business"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Approval;
