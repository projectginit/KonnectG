import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

import VerificationCard from "../../components/admin/verification/VerificationCard";
import VerificationModal from "../../components/admin/verification/VerificationModal";
import AdminHeader from "../../components/admin/AdminHeader";

import apiRequest from "../../services/api";

function Verification() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");

  const [businesses, setBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedBusiness, setSelectedBusiness] = useState(null);

  /* ==========================================================
                      STATUS MAPPING
  ========================================================== */

  const getVerificationStatusLabel = (status) => {
    switch (status) {
      case "verified":
        return "Verified";

      case "rejected":
        return "Rejected";

      case "pending":
      default:
        return "Pending";
    }
  };

  /* ==========================================================
                      LOAD BUSINESSES
  ========================================================== */

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest(
        "/businesses/admin/all?approvalStatus=approved&limit=100&page=1",
      );

      setBusinesses(response.businesses || []);
    } catch (error) {
      console.error("Load verification businesses error:", error);

      setError(error.message || "Unable to load verification businesses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  /* ==========================================================
                    FILTERED BUSINESSES
  ========================================================== */

  const filteredBusinesses = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const businessName = business.name?.toLowerCase() || "";

      const ownerName = business.owner?.name?.toLowerCase() || "";

      const ownerEmail = business.owner?.email?.toLowerCase() || "";

      const phone = business.phone?.toLowerCase() || "";

      const matchesSearch =
        !searchTerm ||
        businessName.includes(searchTerm) ||
        ownerName.includes(searchTerm) ||
        ownerEmail.includes(searchTerm) ||
        phone.includes(searchTerm);

      const statusLabel = getVerificationStatusLabel(
        business.verificationStatus,
      );

      const matchesTab = statusLabel === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [businesses, search, activeTab]);

  /* ==========================================================
                        SUMMARY
  ========================================================== */

  const pendingCount = businesses.filter(
    (business) => business.verificationStatus === "pending",
  ).length;

  const verifiedCount = businesses.filter(
    (business) => business.verificationStatus === "verified",
  ).length;

  const rejectedCount = businesses.filter(
    (business) => business.verificationStatus === "rejected",
  ).length;

  /* ==========================================================
                          VERIFY
  ========================================================== */

  const handleVerify = async (business) => {
    if (!business?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to verify "${business.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(business._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/businesses/${business._id}/verify`, {
        method: "PATCH",
      });

      setSuccessMessage(response.message || "Business verified successfully.");

      await loadBusinesses();

      setSelectedBusiness(null);
    } catch (error) {
      console.error("Verify business error:", error);

      setError(error.message || "Unable to verify this business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ==========================================================
                          REJECT
  ========================================================== */

  const handleReject = async (business) => {
    if (!business?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject verification for "${business.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(business._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `/businesses/${business._id}/verification-reject`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage(response.message || "Business verification rejected.");

      await loadBusinesses();

      setSelectedBusiness(null);
    } catch (error) {
      console.error("Reject verification error:", error);

      setError(error.message || "Unable to reject this business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ==========================================================
                          VIEW
  ========================================================== */

  const handleView = (business) => {
    setSelectedBusiness(business);
  };

  /* ==========================================================
                          RENDER
  ========================================================== */

  return (
    <div className="verification-page">
      <AdminHeader
        title="Verification Centre"
        subtitle="Verify approved businesses before they receive verified status."
        buttonText="Export"
        buttonIcon="📄"
        search={search}
        setSearch={setSearch}
        placeholder="Search businesses..."
        onButtonClick={() => alert("Export CSV")}
      />

      {/* ======================================================
                            MESSAGES
      ====================================================== */}

      {successMessage && (
        <div className="admin-success-message">{successMessage}</div>
      )}

      {error && <div className="admin-error-message">{error}</div>}

      {/* ======================================================
                            SUMMARY
      ====================================================== */}

      <div className="merchant-summary">
        <div className="merchant-summary-card">
          <h3>Pending</h3>
          <span>{pendingCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Verified</h3>
          <span>{verifiedCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Rejected</h3>
          <span>{rejectedCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Total Approved</h3>
          <span>{businesses.length}</span>
        </div>
      </div>

      {/* ======================================================
                              TABS
      ====================================================== */}

      <div className="approval-tabs">
        {["Pending", "Verified", "Rejected"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? "tab-btn active-tab" : "tab-btn"}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ======================================================
                            LOADING
      ====================================================== */}

      {loading && (
        <div className="admin-empty-state">
          <p>Loading verification businesses...</p>
        </div>
      )}

      {/* ======================================================
                          EMPTY STATE
      ====================================================== */}

      {!loading && !error && filteredBusinesses.length === 0 && (
        <div className="admin-empty-state">
          <h3>No {activeTab.toLowerCase()} businesses</h3>

          <p>
            There are currently no businesses matching this verification status.
          </p>
        </div>
      )}

      {/* ======================================================
                              CARDS
      ====================================================== */}

      {!loading && filteredBusinesses.length > 0 && (
        <div className="merchant-list">
          {filteredBusinesses.map((business) => (
            <VerificationCard
              key={business._id}
              business={business}
              actionLoading={actionLoadingId === business._id}
              onView={() => handleView(business)}
              onApprove={() => handleVerify(business)}
              onReject={() => handleReject(business)}
            />
          ))}
        </div>
      )}

      {/* ======================================================
                            MODAL
      ====================================================== */}

      {selectedBusiness && (
        <VerificationModal
          business={selectedBusiness}
          actionLoading={actionLoadingId === selectedBusiness._id}
          onClose={() => setSelectedBusiness(null)}
          onApprove={() => handleVerify(selectedBusiness)}
          onReject={() => handleReject(selectedBusiness)}
        />
      )}
    </div>
  );
}

export default Verification;
