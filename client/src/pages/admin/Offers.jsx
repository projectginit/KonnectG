import { useCallback, useEffect, useState } from "react";
import "./Admin.css";
import AdminHeader from "../../components/admin/AdminHeader";
import OfferCard from "../../components/admin/offer/OfferCard";
import OfferModal from "../../components/admin/offer/OfferModal";
import CreateOfferModal from "../../components/admin/offer/CreateOfferModal";
import apiRequest from "../../services/api";

function Offers() {
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await apiRequest("/categories");

        setCategories(data.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load offers
  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (categoryFilter !== "All") {
        params.set("category", categoryFilter);
      }

      if (statusFilter !== "All") {
        params.set("status", statusFilter.toLowerCase());
      }

      const sortMap = {
        Newest: "newest",
        "A-Z": "a-z",
        "Z-A": "z-a",
      };

      params.set("sort", sortMap[sortBy] || "newest");
      params.set("page", pagination.page);
      params.set("limit", pagination.limit);

      const data = await apiRequest(`/offers/admin/all?${params.toString()}`);

      setOffers(data.offers || []);

      setPagination((prev) => ({
        ...prev,
        ...(data.pagination || {}),
      }));
    } catch (err) {
      console.error("Failed to load offers:", err);

      setError(err.message || "Failed to load offers.");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    categoryFilter,
    statusFilter,
    sortBy,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleFeature = async (offer) => {
    const offerId = offer._id || offer.id;

    try {
      setActionLoadingId(offerId);
      setError("");

      const data = await apiRequest(`/offers/${offerId}/featured`, {
        method: "PATCH",
      });

      showSuccess(
        data.message ||
          (offer.isFeatured
            ? "Offer removed from featured."
            : "Offer marked as featured."),
      );

      await loadOffers();

      if (
        selectedOffer &&
        (selectedOffer._id || selectedOffer.id) === offerId
      ) {
        setSelectedOffer(null);
      }
    } catch (err) {
      console.error("Failed to toggle offer feature:", err);

      setError(err.message || "Failed to update featured status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatus = async (offer) => {
    const offerId = offer._id || offer.id;
    const isActive = offer.isActive === true;

    try {
      setActionLoadingId(offerId);
      setError("");

      const endpoint = isActive
        ? `/offers/${offerId}/deactivate`
        : `/offers/${offerId}/activate`;

      const data = await apiRequest(endpoint, {
        method: "PATCH",
      });

      showSuccess(
        data.message ||
          (isActive
            ? "Offer deactivated successfully."
            : "Offer activated successfully."),
      );

      await loadOffers();

      if (
        selectedOffer &&
        (selectedOffer._id || selectedOffer.id) === offerId
      ) {
        setSelectedOffer(null);
      }
    } catch (err) {
      console.error("Failed to update offer status:", err);

      setError(err.message || "Failed to update offer status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (offer) => {
    const offerId = offer._id || offer.id;

    const confirmed = window.confirm(
      `Delete "${offer.title || "this offer"}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(offerId);
      setError("");

      const data = await apiRequest(`/offers/${offerId}`, {
        method: "DELETE",
      });

      showSuccess(data.message || "Offer deleted successfully.");

      setSelectedOffer(null);

      await loadOffers();
    } catch (err) {
      console.error("Failed to delete offer:", err);

      setError(err.message || "Failed to delete offer.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleView = (offer) => {
    setSelectedOffer(offer);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleSearchChange = (value) => {
    setSearch(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleSortChange = (value) => {
    setSortBy(value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const activeCount = offers.filter(
    (offer) => offer.status === "active",
  ).length;

  const scheduledCount = offers.filter(
    (offer) => offer.status === "scheduled",
  ).length;

  const expiredCount = offers.filter(
    (offer) => offer.status === "expired",
  ).length;

  const featuredCount = offers.filter(
    (offer) => offer.isFeatured === true,
  ).length;

  return (
    <div className="offers-page">
      <AdminHeader
        title="Offers"
        subtitle="Manage promotional offers from businesses."
        buttonText="Create Offer"
        buttonIcon="🎉"
        search={search}
        setSearch={handleSearchChange}
        placeholder="Search offers..."
        onButtonClick={() => setShowCreateModal(true)}
      />

      {/* Messages */}

      {error && <div className="admin-alert error">{error}</div>}

      {successMessage && (
        <div className="admin-alert success">{successMessage}</div>
      )}

      {/* Summary */}

      <div className="merchant-summary">
        <div className="merchant-summary-card">
          <h3>Active</h3>
          <span>{activeCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Scheduled</h3>
          <span>{scheduledCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Expired</h3>
          <span>{expiredCount}</span>
        </div>

        <div className="merchant-summary-card">
          <h3>Featured</h3>
          <span>{featuredCount}</span>
        </div>
      </div>

      {/* Filters */}

      <div className="merchant-toolbar">
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          disabled={loadingCategories}
        >
          <option value="All">All</option>

          {categories.map((category) => (
            <option key={category._id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Expired">Expired</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="Newest">Newest</option>
          <option value="A-Z">A-Z</option>
          <option value="Z-A">Z-A</option>
        </select>
      </div>

      {/* Offer Cards */}

      {loading ? (
        <div className="admin-empty-state">
          <p>Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="admin-empty-state">
          <p>No offers found.</p>
        </div>
      ) : (
        <div className="merchant-list">
          {offers.map((offer) => {
            const offerId = offer._id || offer.id;

            return (
              <OfferCard
                key={offerId}
                offer={offer}
                onView={() => handleView(offer)}
                onFeature={() => handleFeature(offer)}
                onStatus={() => handleStatus(offer)}
                onDelete={() => handleDelete(offer)}
                actionLoading={actionLoadingId === offerId}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}

      {!loading && pagination.pages > 1 && (
        <div className="merchant-pagination">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            type="button"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Offer Details Modal */}

      {selectedOffer && (
        <OfferModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}

      {/* Create Offer Modal */}

      {showCreateModal && (
        <CreateOfferModal
          onClose={() => setShowCreateModal(false)}
          onCreated={async () => {
            setPagination((prev) => ({
              ...prev,
              page: 1,
            }));

            await loadOffers();
          }}
        />
      )}
    </div>
  );
}

export default Offers;
