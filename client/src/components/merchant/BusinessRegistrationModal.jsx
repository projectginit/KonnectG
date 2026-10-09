import { useEffect, useState } from "react";
import apiRequest from "../../services/api";

const INITIAL_FORM = {
  name: "",
  description: "",
  categoryRef: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  city: "Siliguri",
};

export default function BusinessRegistrationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await apiRequest("/categories");

        if (!mounted) return;

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.categories)
            ? response.categories
            : [];

        setCategories(
          categoryList.filter((category) => category.isActive !== false),
        );
      } catch (err) {
        if (!mounted) return;

        setError(err?.message || "Unable to load business categories.");
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, submitting]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!form.categoryRef) {
      setError("Please select a category.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    if (!form.address.trim()) {
      setError("Address is required.");
      return;
    }

    if (!form.area.trim()) {
      setError("Area is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await apiRequest("/businesses", {
        method: "POST",
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          categoryRef: form.categoryRef,
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          area: form.area.trim(),
          city: form.city.trim() || "Siliguri",
        },
      });

      const createdBusiness = response?.business || response?.data || response;

      onSuccess(createdBusiness);
    } catch (err) {
      setError(
        err?.message || "Unable to register your business. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="merchant-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className="merchant-registration-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="merchant-registration-title"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="merchant-registration-header">
          <div>
            <p className="merchant-registration-eyebrow">
              Business Registration
            </p>

            <h2 id="merchant-registration-title">Add Your Business</h2>

            <p>Submit your business to KonnectG for approval.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="merchant-registration-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form onSubmit={handleSubmit} className="merchant-registration-form">
          {error && <div className="merchant-registration-error">{error}</div>}

          {/* Business Name */}

          <div className="merchant-form-field">
            <label htmlFor="business-name">
              Business Name <span>*</span>
            </label>

            <input
              id="business-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Saffron Kitchen"
              disabled={submitting}
            />
          </div>

          {/* Category */}

          <div className="merchant-form-field">
            <label htmlFor="business-category">
              Category <span>*</span>
            </label>

            <select
              id="business-category"
              name="categoryRef"
              value={form.categoryRef}
              onChange={handleChange}
              disabled={submitting || loadingCategories}
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select a category"}
              </option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}

          <div className="merchant-form-field">
            <label htmlFor="business-description">Description</label>

            <textarea
              id="business-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell customers what your business offers..."
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Phone + Email */}

          <div className="merchant-form-row">
            <div className="merchant-form-field">
              <label htmlFor="business-phone">
                Phone <span>*</span>
              </label>

              <input
                id="business-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                disabled={submitting}
              />
            </div>

            <div className="merchant-form-field">
              <label htmlFor="business-email">Email</label>

              <input
                id="business-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="business@example.com"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Address */}

          <div className="merchant-form-field">
            <label htmlFor="business-address">
              Address <span>*</span>
            </label>

            <textarea
              id="business-address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Full business address"
              rows={2}
              disabled={submitting}
            />
          </div>

          {/* Area + City */}

          <div className="merchant-form-row">
            <div className="merchant-form-field">
              <label htmlFor="business-area">
                Area <span>*</span>
              </label>

              <input
                id="business-area"
                name="area"
                type="text"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. Matigara"
                disabled={submitting}
              />
            </div>

            <div className="merchant-form-field">
              <label htmlFor="business-city">City</label>

              <input
                id="business-city"
                name="city"
                type="text"
                value={form.city}
                onChange={handleChange}
                placeholder="Siliguri"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Approval notice */}

          <div className="merchant-registration-notice">
            <span>ℹ️</span>

            <p>
              Your business will be submitted for admin approval. It won&apos;t
              appear publicly on KonnectG until it is approved.
            </p>
          </div>

          {/* Buttons */}

          <div className="merchant-registration-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="merchant-registration-cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || loadingCategories}
              className="merchant-registration-submit"
            >
              {submitting ? "Submitting..." : "Submit Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
