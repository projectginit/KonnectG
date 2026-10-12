import { useEffect, useRef, useState } from "react";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function BusinessRegistrationModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);

  const [categories, setCategories] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);

  const [error, setError] = useState("");

  /*
   * Stores the Cloudinary URL.
   */
  const [businessImage, setBusinessImage] = useState("");

  /*
   * Stores the temporary local preview.
   */
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  /* ==========================================================
                        LOAD CATEGORIES
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await apiRequest("/categories");

        if (!mounted) {
          return;
        }

        const categoryList = Array.isArray(response)
          ? response
          : Array.isArray(response?.categories)
            ? response.categories
            : [];

        setCategories(
          categoryList.filter((category) => category.isActive !== false),
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

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

  /* ==========================================================
                        ESCAPE KEY
  ========================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !submitting && !uploadingImage) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, submitting, uploadingImage]);

  /* ==========================================================
                        FORM CHANGE
  ========================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setError("");
  };

  /* ==========================================================
                    IMAGE VALIDATION
  ========================================================== */

  const validateImage = (file) => {
    if (!file) {
      return "Please select an image.";
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return (
        "Invalid image type. " +
        "Only JPG, JPEG, PNG and WebP images are allowed."
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Image must be smaller than 5 MB.";
    }

    return "";
  };

  /* ==========================================================
                    IMAGE UPLOAD
  ========================================================== */

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    const validationError = validateImage(file);

    if (validationError) {
      setError(validationError);

      event.target.value = "";

      return;
    }

    /*
     * Show local preview immediately.
     */
    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);

    /*
     * Remove previous Cloudinary image URL
     * while the new image is uploading.
     */
    setBusinessImage("");

    try {
      setUploadingImage(true);

      const formData = new FormData();

      formData.append("image", file);

      /*
       * apiRequest must send FormData without
       * manually setting Content-Type.
       */
      const response = await apiRequest("/businesses/upload", {
        method: "POST",
        body: formData,
      });

      const uploadedUrl = response?.image?.url || response?.url || "";

      if (!uploadedUrl) {
        throw new Error("Image uploaded, but no image URL was returned.");
      }

      setBusinessImage(uploadedUrl);
    } catch (err) {
      console.error("Business image upload error:", err);

      setBusinessImage("");

      setError(err?.message || "Unable to upload business image.");

      setImagePreview("");
    } finally {
      setUploadingImage(false);

      event.target.value = "";
    }
  };

  /* ==========================================================
                        REMOVE IMAGE
  ========================================================== */

  const handleRemoveImage = () => {
    setBusinessImage("");
    setImagePreview("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ==========================================================
                        SUBMIT
  ========================================================== */

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

    /*
     * If the merchant selected an image,
     * do not allow submission until Cloudinary
     * upload has finished.
     */
    if (uploadingImage) {
      setError("Please wait for the image upload to finish.");

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

          /*
           * Cloudinary image URL.
           *
           * The backend already supports
           * the logo field.
           */
          logo: businessImage || "",

          /*
           * Keep images as an array for
           * future gallery support.
           */
          images: businessImage ? [businessImage] : [],
        },
      });

      const createdBusiness = response?.business || response?.data || response;

      onSuccess(createdBusiness);
    } catch (err) {
      console.error("Business registration error:", err);

      setError(
        err?.message || "Unable to register your business. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
                            UI
  ========================================================== */

  return (
    <div
      className="merchant-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting &&
          !uploadingImage
        ) {
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
        {/* ====================================================
                            HEADER
        ==================================================== */}

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
            disabled={submitting || uploadingImage}
            className="merchant-registration-close"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ====================================================
                            FORM
        ==================================================== */}

        <form onSubmit={handleSubmit} className="merchant-registration-form">
          {error && (
            <div className="merchant-registration-error" role="alert">
              {error}
            </div>
          )}

          {/* ==================================================
                        BUSINESS NAME
          ================================================== */}

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

          {/* ==================================================
                            CATEGORY
          ================================================== */}

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

          {/* ==================================================
                        BUSINESS IMAGE
          ================================================== */}

          <div className="merchant-form-field">
            <label htmlFor="business-image">Business Image</label>

            <div
              className="merchant-business-image-upload"
              onClick={() => {
                if (!submitting && !uploadingImage) {
                  fileInputRef.current?.click();
                }
              }}
            >
              {imagePreview ? (
                <div className="merchant-business-image-preview">
                  <img src={imagePreview} alt="Business preview" />

                  {!uploadingImage && (
                    <button
                      type="button"
                      className="merchant-business-image-remove"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveImage();
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <div className="merchant-business-image-placeholder">
                  <div className="merchant-business-image-icon">🖼️</div>

                  <strong>Upload Business Image</strong>

                  <span>JPG, PNG or WebP • Max 5 MB</span>
                </div>
              )}

              {uploadingImage && (
                <div className="merchant-business-image-uploading">
                  Uploading image...
                </div>
              )}

              {!uploadingImage && businessImage && (
                <div className="merchant-business-image-success">
                  ✓ Image uploaded successfully
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              id="business-image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={submitting || uploadingImage}
              style={{
                display: "none",
              }}
            />

            <small className="merchant-business-image-help">
              Add your business logo, storefront, or a representative business
              photo.
            </small>
          </div>

          {/* ==================================================
                        DESCRIPTION
          ================================================== */}

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

          {/* ==================================================
                        PHONE + EMAIL
          ================================================== */}

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

          {/* ==================================================
                            ADDRESS
          ================================================== */}

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

          {/* ==================================================
                            AREA + CITY
          ================================================== */}

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

          {/* ==================================================
                        APPROVAL NOTICE
          ================================================== */}

          <div className="merchant-registration-notice">
            <span>ℹ️</span>

            <p>
              Your business will be submitted for admin approval. It won&apos;t
              appear publicly on KonnectG until it is approved.
            </p>
          </div>

          {/* ==================================================
                            BUTTONS
          ================================================== */}

          <div className="merchant-registration-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploadingImage}
              className="merchant-registration-cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || uploadingImage || loadingCategories}
              className="merchant-registration-submit"
            >
              {uploadingImage
                ? "Uploading Image..."
                : submitting
                  ? "Submitting..."
                  : "Submit Business"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
