import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router-dom";

import apiRequest from "../../services/api";
import "./Merchant.css";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "expired", label: "Expired" },
  { key: "inactive", label: "Inactive" },
];

function getOfferStatus(offer) {
  if (!offer?.isActive) return "inactive";

  const now = new Date();
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);

  if (now < start) return "scheduled";
  if (now > end) return "expired";

  return "active";
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDiscount(offer) {
  if (!offer) return "—";

  return offer.discountType === "percentage"
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`;
}

function formatUsage(offer) {
  const used = offer?.usageCount ?? 0;

  if (offer?.usageLimit === null || offer?.usageLimit === undefined) {
    return `${used} used`;
  }

  return `${used}/${offer.usageLimit} used`;
}

function OfferStatusBadge({ status }) {
  return (
    <span className={`merchant-offer-status merchant-offer-status-${status}`}>
      {status}
    </span>
  );
}

function OfferCard({ offer, onEdit, onDelete }) {
  const status = getOfferStatus(offer);
  const businessName = offer?.business?.name || "Business";

  return (
    <article className="merchant-offer-card">
      <div className="merchant-offer-card-top">
        <div className="merchant-offer-card-main">
          <div className="merchant-offer-title-row">
            <h2>{offer.title}</h2>

            <OfferStatusBadge status={status} />
          </div>

          <p className="merchant-offer-business">{businessName}</p>
        </div>

        <div className="merchant-offer-discount">{formatDiscount(offer)}</div>
      </div>

      {offer.description && (
        <p className="merchant-offer-description">{offer.description}</p>
      )}

      <div className="merchant-offer-details">
        <div>
          <span>📅</span>
          <p>
            {formatDate(offer.startDate)} — {formatDate(offer.endDate)}
          </p>
        </div>

        {offer.couponCode && (
          <div>
            <span>🎟️</span>
            <p>
              Coupon: <strong>{offer.couponCode}</strong>
            </p>
          </div>
        )}

        <div>
          <span>📊</span>
          <p>{formatUsage(offer)}</p>
        </div>
      </div>

      {offer.terms && (
        <div className="merchant-offer-terms">
          <strong>Terms</strong>
          <p>{offer.terms}</p>
        </div>
      )}

      <div className="merchant-offer-footer">
        <span className="merchant-offer-created">
          Created {formatDate(offer.createdAt)}
        </span>

        <div className="merchant-offer-actions">
          <button
            type="button"
            className="merchant-offer-edit-btn"
            onClick={() => onEdit(offer)}
          >
            Edit
          </button>

          <button
            type="button"
            className="merchant-offer-delete-btn"
            onClick={() => onDelete(offer)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function OfferModal({ offer, businesses, onClose, onSuccess }) {
  const isEditing = Boolean(offer);

  const [form, setForm] = useState({
    business: offer?.business?._id || "",
    title: offer?.title || "",
    description: offer?.description || "",
    discountType: offer?.discountType || "percentage",
    discountValue: offer?.discountValue ?? "",
    couponCode: offer?.couponCode || "",
    startDate: offer?.startDate
      ? new Date(offer.startDate).toISOString().slice(0, 16)
      : "",
    endDate: offer?.endDate
      ? new Date(offer.endDate).toISOString().slice(0, 16)
      : "",
    usageLimit:
      offer?.usageLimit === null || offer?.usageLimit === undefined
        ? ""
        : offer.usageLimit,
    terms: offer?.terms || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const eligibleBusinesses = businesses.filter(
    (business) =>
      business?.isActive === true && business?.approvalStatus === "approved",
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.business) {
      setError("Please select a business.");
      return;
    }

    if (!form.title.trim()) {
      setError("Offer title is required.");
      return;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      setError("Discount value must be greater than 0.");
      return;
    }

    if (
      form.discountType === "percentage" &&
      Number(form.discountValue) > 100
    ) {
      setError("Percentage discount cannot exceed 100.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required.");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setError("End date must be after start date.");
      return;
    }

    if (form.usageLimit !== "" && Number(form.usageLimit) < 0) {
      setError("Usage limit cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        couponCode: form.couponCode.trim().toUpperCase(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        terms: form.terms.trim(),
      };

      let response;

      if (isEditing) {
        response = await apiRequest(`/offers/${offer._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        response = await apiRequest("/offers", {
          method: "POST",
          body: {
            ...payload,
            business: form.business,
          },
        });
      }

      if (!response?.offer) {
        throw new Error(
          response?.message ||
            `Unable to ${isEditing ? "update" : "create"} offer.`,
        );
      }

      onSuccess(response.offer);
    } catch (requestError) {
      setError(
        requestError?.message ||
          `Unable to ${isEditing ? "update" : "create"} offer.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="merchant-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="merchant-offer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="merchant-offer-modal-title"
      >
        <div className="merchant-offer-modal-header">
          <div>
            <p className="merchant-offer-modal-eyebrow">Merchant Offers</p>

            <h2 id="merchant-offer-modal-title">
              {isEditing ? "Edit Offer" : "Create Offer"}
            </h2>

            <p>
              {isEditing
                ? "Update your offer details."
                : "Create a promotion for one of your approved businesses."}
            </p>
          </div>

          <button
            type="button"
            className="merchant-registration-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form className="merchant-offer-form" onSubmit={handleSubmit}>
          {error && <div className="merchant-offer-error">{error}</div>}

          <div className="merchant-form-field">
            <label htmlFor="offer-business">
              Business <span>*</span>
            </label>

            <select
              id="offer-business"
              name="business"
              value={form.business}
              onChange={handleChange}
              disabled={isEditing || loading}
              required
            >
              <option value="">Select a business</option>

              {eligibleBusinesses.map((business) => (
                <option key={business._id} value={business._id}>
                  {business.name}
                </option>
              ))}
            </select>

            {!isEditing && eligibleBusinesses.length === 0 && (
              <small className="merchant-offer-field-help">
                You need an active and approved business before creating an
                offer.
              </small>
            )}
          </div>

          <div className="merchant-form-field">
            <label htmlFor="offer-title">
              Offer Title <span>*</span>
            </label>

            <input
              id="offer-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. 20% Off Weekend Special"
              maxLength={150}
              disabled={loading}
              required
            />
          </div>

          <div className="merchant-form-field">
            <label htmlFor="offer-description">Description</label>

            <textarea
              id="offer-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell customers what this offer includes."
              maxLength={1000}
              disabled={loading}
            />
          </div>

          <div className="merchant-form-row">
            <div className="merchant-form-field">
              <label htmlFor="offer-discount-type">
                Discount Type <span>*</span>
              </label>

              <select
                id="offer-discount-type"
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="merchant-form-field">
              <label htmlFor="offer-discount-value">
                Discount Value <span>*</span>
              </label>

              <input
                id="offer-discount-value"
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={form.discountType === "percentage" ? "20" : "500"}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="merchant-form-field">
            <label htmlFor="offer-coupon">Coupon Code</label>

            <input
              id="offer-coupon"
              name="couponCode"
              value={form.couponCode}
              onChange={handleChange}
              placeholder="e.g. KONNECT20"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className="merchant-form-row">
            <div className="merchant-form-field">
              <label htmlFor="offer-start-date">
                Start Date & Time <span>*</span>
              </label>

              <input
                id="offer-start-date"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="merchant-form-field">
              <label htmlFor="offer-end-date">
                End Date & Time <span>*</span>
              </label>

              <input
                id="offer-end-date"
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="merchant-form-field">
            <label htmlFor="offer-usage-limit">Usage Limit</label>

            <input
              id="offer-usage-limit"
              name="usageLimit"
              type="number"
              min="0"
              step="1"
              value={form.usageLimit}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              disabled={loading}
            />
          </div>

          <div className="merchant-form-field">
            <label htmlFor="offer-terms">Terms & Conditions</label>

            <textarea
              id="offer-terms"
              name="terms"
              value={form.terms}
              onChange={handleChange}
              placeholder="Optional terms and conditions."
              maxLength={2000}
              disabled={loading}
            />
          </div>

          <div className="merchant-offer-modal-footer">
            <button
              type="button"
              className="merchant-registration-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="merchant-registration-submit"
              disabled={
                loading || (!isEditing && eligibleBusinesses.length === 0)
              }
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest("/offers/my");

      setOffers(Array.isArray(response?.offers) ? response.offers : []);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load your offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBusinesses = useCallback(async () => {
    setBusinessesLoading(true);

    try {
      const response = await apiRequest("/businesses/my");

      setBusinesses(
        Array.isArray(response?.businesses) ? response.businesses : [],
      );
    } catch (requestError) {
      console.error("Unable to load merchant businesses:", requestError);
    } finally {
      setBusinessesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
    loadBusinesses();
  }, [loadOffers, loadBusinesses]);

  const counts = useMemo(() => {
    const result = {
      all: offers.length,
      active: 0,
      scheduled: 0,
      expired: 0,
      inactive: 0,
    };

    offers.forEach((offer) => {
      const status = getOfferStatus(offer);

      if (result[status] !== undefined) {
        result[status] += 1;
      }
    });

    return result;
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (activeFilter === "all") {
      return offers;
    }

    return offers.filter((offer) => getOfferStatus(offer) === activeFilter);
  }, [offers, activeFilter]);

  const handleCreate = () => {
    setEditingOffer(null);
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setShowModal(true);
  };

  const handleDelete = async (offer) => {
    const confirmed = window.confirm(
      `Delete "${offer.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(offer._id);

    try {
      await apiRequest(`/offers/${offer._id}`, {
        method: "DELETE",
      });

      setOffers((current) => current.filter((item) => item._id !== offer._id));
    } catch (requestError) {
      window.alert(requestError?.message || "Unable to delete this offer.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleModalSuccess = (savedOffer) => {
    setOffers((current) => {
      const exists = current.some((offer) => offer._id === savedOffer._id);

      if (exists) {
        return current.map((offer) =>
          offer._id === savedOffer._id ? savedOffer : offer,
        );
      }

      return [savedOffer, ...current];
    });

    setShowModal(false);
    setEditingOffer(null);
  };

  return (
    <div className="merchant-offers-page">
      <header className="merchant-offers-header">
        <div>
          <p className="merchant-offers-eyebrow">Merchant Centre</p>

          <h1 className="merchant-offers-title">Offers</h1>

          <p className="merchant-offers-subtitle">
            Create and manage promotions for your customers.
          </p>
        </div>

        <button
          type="button"
          className="merchant-offers-add-btn"
          onClick={handleCreate}
        >
          + Create Offer
        </button>
      </header>

      {error && (
        <div className="merchant-offers-alert">
          <div>
            <p className="merchant-offers-alert-title">Couldn&apos;t load offers</p>

            <p className="merchant-offers-alert-text">{error}</p>
          </div>

          <button
            type="button"
            className="merchant-offers-retry"
            onClick={loadOffers}
          >
            Retry
          </button>
        </div>
      )}

      <section className="merchant-offers-summary">
        <div>
          <span className="merchant-offers-summary-value">{counts.all}</span>
          <span className="merchant-offers-summary-label">Total Offers</span>
        </div>

        <div>
          <span className="merchant-offers-summary-value">{counts.active}</span>
          <span className="merchant-offers-summary-label">Active</span>
        </div>

        <div>
          <span className="merchant-offers-summary-value">
            {counts.scheduled}
          </span>
          <span className="merchant-offers-summary-label">Scheduled</span>
        </div>

        <div>
          <span className="merchant-offers-summary-value">
            {counts.expired}
          </span>
          <span className="merchant-offers-summary-label">Expired</span>
        </div>
      </section>

      <section className="merchant-offers-toolbar">
        <div className="merchant-offers-tabs">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={
                activeFilter === filter.key
                  ? "merchant-offers-tab active"
                  : "merchant-offers-tab"
              }
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}

              <span>{counts[filter.key]}</span>
            </button>
          ))}
        </div>
      </section>

      {loading || businessesLoading ? (
        <div className="merchant-offers-loading">
          <div className="merchant-listings-spinner" />
          <p>Loading your offers...</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="merchant-offers-empty">
          <div className="merchant-offers-empty-icon">🏷️</div>

          <h2>
            {activeFilter === "all"
              ? "No offers yet"
              : `No ${activeFilter} offers`}
          </h2>

          <p>
            {activeFilter === "all"
              ? "Create your first offer to give customers another reason to choose your business."
              : "There are no offers in this status right now."}
          </p>

          {activeFilter === "all" && (
            <button
              type="button"
              className="merchant-offers-empty-btn"
              onClick={handleCreate}
            >
              Create Your First Offer
            </button>
          )}
        </div>
      ) : (
        <section className="merchant-offers-grid">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {deletingId && (
        <div className="merchant-offers-deleting">Deleting offer...</div>
      )}

      {showModal && (
        <OfferModal
          offer={editingOffer}
          businesses={businesses}
          onClose={() => {
            setShowModal(false);
            setEditingOffer(null);
          }}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
