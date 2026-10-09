import { useEffect, useState } from "react";
import "../../../pages/admin/Admin.css";
import apiRequest from "../../../services/api";

function CreateOfferModal({ onClose, onCreated }) {
  const [businesses, setBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    business: "",
    title: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    couponCode: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    terms: "",
  });

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setLoadingBusinesses(true);
        setError("");

        const data = await apiRequest(
          "/businesses/admin/all?approvalStatus=approved&active=true&limit=100&page=1",
        );

        setBusinesses(data.businesses || []);
      } catch (err) {
        console.error("Failed to load businesses:", err);
        setError(err.message || "Failed to load businesses.");
      } finally {
        setLoadingBusinesses(false);
      }
    };

    loadBusinesses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccessMessage("");

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

    if (!form.startDate || !form.endDate) {
      setError("Start date and end date are required.");
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      setError("Please provide valid dates.");
      return;
    }

    if (endDate <= startDate) {
      setError("End date must be after the start date.");
      return;
    }

    if (
      form.usageLimit !== "" &&
      (Number(form.usageLimit) < 0 || !Number.isFinite(Number(form.usageLimit)))
    ) {
      setError("Usage limit must be a valid non-negative number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        business: form.business,
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        couponCode: form.couponCode.trim().toUpperCase(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        usageLimit: form.usageLimit === "" ? null : Number(form.usageLimit),
        terms: form.terms.trim(),
      };

      const data = await apiRequest("/offers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccessMessage(data.message || "Offer created successfully.");

      if (onCreated) {
        await onCreated(data.offer);
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to create offer:", err);
      setError(err.message || "Failed to create offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="offer-modal-overlay">
      <div className="offer-modal create-offer-modal">
        {/* Header */}

        <div className="offer-modal-header">
          <div>
            <h2>Create Offer</h2>
            <p>Create a promotional offer for an approved business.</p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={submitting}
          >
            ✖
          </button>
        </div>

        {/* Messages */}

        {error && <div className="admin-alert error">{error}</div>}

        {successMessage && (
          <div className="admin-alert success">{successMessage}</div>
        )}

        {/* Form */}

        <form onSubmit={handleSubmit}>
          <div className="offer-form-grid">
            {/* Business */}

            <div className="offer-form-group full-width">
              <label htmlFor="business">
                Business <span>*</span>
              </label>

              <select
                id="business"
                name="business"
                value={form.business}
                onChange={handleChange}
                disabled={loadingBusinesses || submitting}
                required
              >
                <option value="">
                  {loadingBusinesses
                    ? "Loading businesses..."
                    : "Select an approved business"}
                </option>

                {businesses.map((business) => (
                  <option key={business._id} value={business._id}>
                    {business.name}
                    {business.area ? ` — ${business.area}` : ""}
                  </option>
                ))}
              </select>

              {!loadingBusinesses && businesses.length === 0 && (
                <small>No approved active businesses are available.</small>
              )}
            </div>

            {/* Title */}

            <div className="offer-form-group full-width">
              <label htmlFor="title">
                Offer Title <span>*</span>
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Summer Sale"
                maxLength={150}
                disabled={submitting}
                required
              />
            </div>

            {/* Description */}

            <div className="offer-form-group full-width">
              <label htmlFor="description">Description</label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what this offer includes..."
                maxLength={1000}
                rows={4}
                disabled={submitting}
              />
            </div>

            {/* Discount Type */}

            <div className="offer-form-group">
              <label htmlFor="discountType">
                Discount Type <span>*</span>
              </label>

              <select
                id="discountType"
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="percentage">Percentage</option>

                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            {/* Discount Value */}

            <div className="offer-form-group">
              <label htmlFor="discountValue">
                Discount Value <span>*</span>
              </label>

              <input
                id="discountValue"
                name="discountValue"
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={handleChange}
                placeholder={
                  form.discountType === "percentage" ? "e.g. 20" : "e.g. 500"
                }
                disabled={submitting}
                required
              />
            </div>

            {/* Coupon */}

            <div className="offer-form-group">
              <label htmlFor="couponCode">Coupon Code</label>

              <input
                id="couponCode"
                name="couponCode"
                type="text"
                value={form.couponCode}
                onChange={handleChange}
                placeholder="e.g. SUMMER20"
                maxLength={50}
                disabled={submitting}
              />
            </div>

            {/* Usage Limit */}

            <div className="offer-form-group">
              <label htmlFor="usageLimit">Usage Limit</label>

              <input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min="0"
                step="1"
                value={form.usageLimit}
                onChange={handleChange}
                placeholder="Leave blank for unlimited"
                disabled={submitting}
              />
            </div>

            {/* Start Date */}

            <div className="offer-form-group">
              <label htmlFor="startDate">
                Start Date <span>*</span>
              </label>

              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>

            {/* End Date */}

            <div className="offer-form-group">
              <label htmlFor="endDate">
                End Date <span>*</span>
              </label>

              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>

            {/* Terms */}

            <div className="offer-form-group full-width">
              <label htmlFor="terms">Terms & Conditions</label>

              <textarea
                id="terms"
                name="terms"
                value={form.terms}
                onChange={handleChange}
                placeholder="Enter the terms and conditions for this offer..."
                maxLength={2000}
                rows={5}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Footer */}

          <div className="offer-modal-footer">
            <button
              type="button"
              className="merchant-btn view-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="merchant-btn status-btn"
              disabled={submitting || loadingBusinesses}
            >
              {submitting ? "Creating..." : "🎉 Create Offer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOfferModal;
