import { useEffect, useMemo, useState } from "react";
import "./Admin.css";

import MerchantCard from "../../components/admin/merchants/MerchantCard";
import MerchantModal from "../../components/admin/merchants/MerchantModal";
import AdminHeader from "../../components/admin/AdminHeader";

import apiRequest from "../../services/api";

function Merchants() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* ======================================================
                       LOAD BUSINESSES
  ====================================================== */

  const loadMerchants = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

      if (statusFilter === "Active") {
        params.append("active", "true");
      }

      if (statusFilter === "Inactive") {
        params.append("active", "false");
      }

      let sort = "newest";

      switch (sortBy) {
        case "A-Z":
          sort = "name-asc";
          break;

        case "Z-A":
          sort = "name-desc";
          break;

        case "Highest Rating":
          sort = "rating";
          break;

        case "Newest":
        default:
          sort = "newest";
          break;
      }

      params.append("sort", sort);
      params.append("page", "1");
      params.append("limit", "100");

      const response = await apiRequest(
        `/businesses/admin/all?${params.toString()}`,
      );

      setMerchants(response.businesses || []);
    } catch (error) {
      console.error("Load merchants error:", error);

      setError(error.message || "Unable to load merchants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMerchants();
  }, []);

  /* ======================================================
                     CATEGORY LIST
  ====================================================== */

  const categories = useMemo(() => {
    const categoryNames = merchants
      .map((merchant) => merchant.categoryRef?.name || merchant.category || "")
      .filter(Boolean);

    return ["All", ...Array.from(new Set(categoryNames)).sort()];
  }, [merchants]);

  /* ======================================================
                   FILTER / SORT
  ====================================================== */

  const filteredMerchants = useMemo(() => {
    let data = [...merchants];

    if (search.trim()) {
      const searchTerm = search.trim().toLowerCase();

      data = data.filter((merchant) => {
        const businessName = merchant.name?.toLowerCase() || "";

        const ownerName = merchant.owner?.name?.toLowerCase() || "";

        const email = merchant.email?.toLowerCase() || "";

        return (
          businessName.includes(searchTerm) ||
          ownerName.includes(searchTerm) ||
          email.includes(searchTerm)
        );
      });
    }

    if (categoryFilter !== "All") {
      data = data.filter((merchant) => {
        const category = merchant.categoryRef?.name || merchant.category;

        return category === categoryFilter;
      });
    }

    if (statusFilter === "Active") {
      data = data.filter((merchant) => merchant.isActive);
    }

    if (statusFilter === "Inactive") {
      data = data.filter((merchant) => !merchant.isActive);
    }

    switch (sortBy) {
      case "A-Z":
        data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;

      case "Z-A":
        data.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;

      case "Highest Rating":
        data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;

      default:
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return data;
  }, [merchants, search, categoryFilter, statusFilter, sortBy]);

  /* ======================================================
                         ADAPTER
  ====================================================== */

  const formatMerchant = (merchant) => {
    return {
      ...merchant,

      id: merchant._id,

      business: merchant.name || "Unnamed Business",

      owner: merchant.owner?.name || "Unknown Owner",

      ownerEmail: merchant.owner?.email || "",

      category:
        merchant.categoryRef?.name || merchant.category || "Uncategorized",

      location:
        [merchant.area, merchant.city].filter(Boolean).join(", ") ||
        merchant.address ||
        "Location unavailable",

      status: merchant.isActive ? "Active" : "Inactive",

      featured: Boolean(merchant.isFeatured),

      rating: Number(merchant.rating || 0),

      profile: calculateProfileCompletion(merchant),

      updated: formatUpdatedDate(merchant.updatedAt),

      approvalStatus: merchant.approvalStatus || "pending",

      verificationStatus: merchant.verificationStatus || "pending",

      description: merchant.description || "",

      images: merchant.images || [],
    };
  };

  /* ======================================================
                  ACTIVATE / DEACTIVATE
  ====================================================== */

  const toggleStatus = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const action = merchant.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      merchant.isActive
        ? `Deactivate ${merchant.name}?`
        : `Activate ${merchant.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `/businesses/${merchant._id}/${action}`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage(
        response.message ||
          `Business ${
            action === "activate" ? "activated" : "deactivated"
          } successfully.`,
      );

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Toggle merchant status error:", error);

      setError(error.message || "Unable to update business status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ======================================================
                         FEATURED
  ====================================================== */

  const toggleFeatured = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `/businesses/${merchant._id}/featured`,
        {
          method: "PATCH",
        },
      );

      setSuccessMessage(
        response.message || "Featured status updated successfully.",
      );

      await loadMerchants();
    } catch (error) {
      console.error("Toggle featured error:", error);

      setError(error.message || "Unable to update featured status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ======================================================
                          DELETE
  ====================================================== */

  const deleteMerchant = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${merchant.name}? This will deactivate the business.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/businesses/${merchant._id}`, {
        method: "DELETE",
      });

      setSuccessMessage(response.message || "Business removed successfully.");

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Delete merchant error:", error);

      setError(error.message || "Unable to remove business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ======================================================
                         APPROVAL
  ====================================================== */

  const approveMerchant = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const confirmed = window.confirm(`Approve ${merchant.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/businesses/${merchant._id}/approve`, {
        method: "PATCH",
      });

      setSuccessMessage(response.message || "Business approved successfully.");

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Approve merchant error:", error);

      setError(error.message || "Unable to approve business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectMerchant = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const rejectionReason = window.prompt(
      "Enter the reason for rejecting this business:",
    );

    if (!rejectionReason?.trim()) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/businesses/${merchant._id}/reject`, {
        method: "PATCH",
        body: JSON.stringify({
          rejectionReason: rejectionReason.trim(),
        }),
      });

      setSuccessMessage(response.message || "Business rejected successfully.");

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Reject merchant error:", error);

      setError(error.message || "Unable to reject business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ======================================================
                       VERIFICATION
  ====================================================== */

  const verifyMerchant = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const confirmed = window.confirm(`Verify ${merchant.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(`/businesses/${merchant._id}/verify`, {
        method: "PATCH",
      });

      setSuccessMessage(response.message || "Business verified successfully.");

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Verify merchant error:", error);

      setError(error.message || "Unable to verify business.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectVerification = async (merchant) => {
    if (!merchant?._id) {
      return;
    }

    const rejectionReason = window.prompt(
      "Enter the reason for rejecting verification:",
    );

    if (!rejectionReason?.trim()) {
      return;
    }

    try {
      setActionLoadingId(merchant._id);
      setError("");
      setSuccessMessage("");

      const response = await apiRequest(
        `/businesses/${merchant._id}/verification-reject`,
        {
          method: "PATCH",
          body: JSON.stringify({
            rejectionReason: rejectionReason.trim(),
          }),
        },
      );

      setSuccessMessage(response.message || "Business verification rejected.");

      await loadMerchants();

      if (selectedMerchant?._id === merchant._id) {
        setSelectedMerchant(null);
      }
    } catch (error) {
      console.error("Reject verification error:", error);

      setError(error.message || "Unable to reject business verification.");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ======================================================
                          SUMMARY
  ====================================================== */

  const totalMerchants = merchants.length;

  const activeMerchants = merchants.filter(
    (merchant) => merchant.isActive,
  ).length;

  const inactiveMerchants = merchants.filter(
    (merchant) => !merchant.isActive,
  ).length;

  const featuredMerchants = merchants.filter(
    (merchant) => merchant.isFeatured,
  ).length;

  const pendingApprovals = merchants.filter(
    (merchant) => merchant.approvalStatus === "pending",
  ).length;

  const pendingVerifications = merchants.filter(
    (merchant) =>
      merchant.approvalStatus === "approved" &&
      merchant.verificationStatus === "pending",
  ).length;

  /* ======================================================
                            UI
  ====================================================== */

  return (
    <div className="merchant-page">
      <AdminHeader
        title="Merchants"
        subtitle="Manage all registered businesses on KonnectG."
        buttonText="Add Merchant"
        buttonIcon="➕"
        search={search}
        setSearch={setSearch}
        placeholder="Search merchants..."
        onButtonClick={() =>
          alert(
            "Add Merchant will be implemented through the merchant/business creation flow.",
          )
        }
      />

      {/* ==================================================
                         MESSAGES
      ================================================== */}

      {successMessage && (
        <div className="admin-success-message">{successMessage}</div>
      )}

      {error && <div className="admin-error-message">{error}</div>}

      {/* ==================================================
                         SUMMARY
      ================================================== */}

      <div className="merchant-summary">
        <div className="merchant-summary-card">
          <h3>Total</h3>
          <span>{totalMerchants}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Active</h3>
          <span>{activeMerchants}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Inactive</h3>
          <span>{inactiveMerchants}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Featured</h3>
          <span>{featuredMerchants}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Pending Approval</h3>
          <span>{pendingApprovals}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Pending Verification</h3>
          <span>{pendingVerifications}</span>
        </div>
      </div>

      {/* ==================================================
                          TOOLBAR
      ================================================== */}

      <div className="merchant-toolbar">
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All</option>

          <option value="Active">Active</option>

          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="Newest">Newest</option>

          <option value="A-Z">A-Z</option>

          <option value="Z-A">Z-A</option>

          <option value="Highest Rating">Highest Rating</option>
        </select>
      </div>

      {/* ==================================================
                           LOADING
      ================================================== */}

      {loading && (
        <div className="admin-empty-state">
          <p>Loading merchants...</p>
        </div>
      )}

      {/* ==================================================
                          MERCHANTS
      ================================================== */}

      {!loading && filteredMerchants.length === 0 && (
        <div className="admin-empty-state">
          <h3>No merchants found</h3>

          <p>No businesses match the current filters.</p>
        </div>
      )}

      {!loading && filteredMerchants.length > 0 && (
        <div className="merchant-list">
          {filteredMerchants.map((merchant) => {
            const formattedMerchant = formatMerchant(merchant);

            return (
              <MerchantCard
                key={merchant._id}
                merchant={formattedMerchant}
                actionLoading={actionLoadingId === merchant._id}
                onView={() => setSelectedMerchant(merchant)}
                onDelete={() => deleteMerchant(merchant)}
                onToggleFeatured={() => toggleFeatured(merchant)}
                onToggleStatus={() => toggleStatus(merchant)}
                onApprove={() => approveMerchant(merchant)}
                onReject={() => rejectMerchant(merchant)}
                onVerify={() => verifyMerchant(merchant)}
                onRejectVerification={() => rejectVerification(merchant)}
              />
            );
          })}
        </div>
      )}

      {/* ==================================================
                           MODAL
      ================================================== */}

      {selectedMerchant && (
        <MerchantModal
          merchant={formatMerchant(selectedMerchant)}
          onClose={() => setSelectedMerchant(null)}
        />
      )}
    </div>
  );
}

/* ==========================================================
                    PROFILE COMPLETION
========================================================== */

function calculateProfileCompletion(merchant) {
  const fields = [
    merchant.name,
    merchant.description,
    merchant.phone,
    merchant.email,
    merchant.address,
    merchant.area,
    merchant.city,
    merchant.logo,
    merchant.images?.length > 0,
  ];

  const completedFields = fields.filter(Boolean).length;

  return Math.round((completedFields / fields.length) * 100);
}

/* ==========================================================
                      DATE FORMATTER
========================================================== */

function formatUpdatedDate(date) {
  if (!date) {
    return "Unknown";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default Merchants;
