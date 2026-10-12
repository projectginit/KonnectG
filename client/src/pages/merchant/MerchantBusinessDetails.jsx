import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiRequest from "../../services/api";

function MerchantBusinessDetails() {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
                        FETCH BUSINESS
  ========================================================== */

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("konnectg_token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await apiRequest("/businesses/my");

        const businesses = Array.isArray(response?.businesses)
          ? response.businesses
          : [];

        const foundBusiness = businesses.find(
          (item) => item._id === businessId,
        );

        if (!foundBusiness) {
          setError("Business not found.");
          return;
        }

        setBusiness(foundBusiness);
      } catch (err) {
        console.error("Failed to load business:", err);

        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem("konnectg_token");
          navigate("/login");
          return;
        }

        setError(
          err?.message || "Unable to load this business. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchBusiness();
    } else {
      setError("Invalid business ID.");
      setLoading(false);
    }
  }, [businessId, navigate]);

  /* ==========================================================
                        HELPERS
  ========================================================== */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryName = () => {
    if (!business) return "—";

    if (business.categoryRef && typeof business.categoryRef === "object") {
      return business.categoryRef.name || business.category || "—";
    }

    return business.category || "—";
  };

  const getApprovalStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";

      case "rejected":
        return "status-rejected";

      case "pending":
      default:
        return "status-pending";
    }
  };

  const getVerificationStatusClass = (status) => {
    switch (status) {
      case "verified":
        return "status-verified";

      case "rejected":
        return "status-rejected";

      case "pending":
      default:
        return "status-pending";
    }
  };

  /* ==========================================================
                          LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#EFEDF5] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-ink-soft">Loading business details...</p>
          </div>
        </main>
      </div>
    );
  }

  /* ==========================================================
                            ERROR
  ========================================================== */

  if (error || !business) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">

        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#EFEDF5] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              !
            </div>

            <h1 className="font-display text-xl font-extrabold text-ink">
              Business Not Found
            </h1>

            <p className="mt-2 text-sm text-ink-soft">
              {error || "We could not find this business."}
            </p>

            <Link
              to="/merchant"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* ==========================================================
                    BUSINESS DATA
  ========================================================== */

  const approvalStatus = business.approvalStatus || "pending";
  const verificationStatus = business.verificationStatus || "pending";

  const images = Array.isArray(business.images)
    ? business.images.filter(Boolean)
    : [];

  const logo = business.logo || "";

  const businessInitial =
    business.name?.trim()?.charAt(0)?.toUpperCase() || "B";

  /* ==========================================================
                              UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#F7F6FA]">

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ==================================================
                            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-700 transition hover:text-purple-900"
        >
          ← Back
        </button>

        {/* ==================================================
                            HEADER
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-[#EFEDF5] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {/* Business identity */}

            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-purple-50 text-xl font-extrabold text-purple-700">
                {logo ? (
                  <img
                    src={logo}
                    alt={`${business.name} logo`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  businessInitial
                )}
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-700">
                  My Business
                </p>

                <h1 className="break-words font-display text-2xl font-extrabold text-ink sm:text-3xl">
                  {business.name}
                </h1>

                <p className="mt-2 text-sm text-ink-soft">
                  {getCategoryName()}
                </p>

                {business.area && (
                  <p className="mt-1 text-sm text-ink-soft">
                    📍 {business.area}
                    {business.city ? `, ${business.city}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getApprovalStatusClass(
                  approvalStatus,
                )}`}
              >
                Approval: {approvalStatus}
              </span>

              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getVerificationStatusClass(
                  verificationStatus,
                )}`}
              >
                Verification: {verificationStatus}
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
                        STATUS INFORMATION
        ================================================== */}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Approval */}

          <div className="rounded-2xl border border-[#EFEDF5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
                📋
              </div>

              <div>
                <h2 className="font-display text-sm font-bold text-ink">
                  Approval Status
                </h2>

                <p className="text-xs text-ink-soft">Business listing review</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F7F6FA] px-4 py-3">
              <span className="text-sm font-medium text-ink-soft">
                Current status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getApprovalStatusClass(
                  approvalStatus,
                )}`}
              >
                {approvalStatus}
              </span>
            </div>

            {approvalStatus === "pending" && (
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                Your business has been submitted and is waiting for admin
                approval.
              </p>
            )}

            {approvalStatus === "approved" && (
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                Your business has been approved and can be displayed publicly.
              </p>
            )}

            {approvalStatus === "rejected" && (
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                Your business submission was rejected. Please check the
                available feedback before making changes.
              </p>
            )}
          </div>

          {/* Verification */}

          <div className="rounded-2xl border border-[#EFEDF5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
                ✓
              </div>

              <div>
                <h2 className="font-display text-sm font-bold text-ink">
                  Verification Status
                </h2>

                <p className="text-xs text-ink-soft">Business verification</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F7F6FA] px-4 py-3">
              <span className="text-sm font-medium text-ink-soft">
                Current status
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${getVerificationStatusClass(
                  verificationStatus,
                )}`}
              >
                {verificationStatus}
              </span>
            </div>

            {verificationStatus === "pending" && (
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                Verification will be handled after the required business review
                process.
              </p>
            )}

            {verificationStatus === "verified" && (
              <p className="mt-3 text-xs leading-5 text-ink-soft">
                Your business has been verified by KonnectG.
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
                        BUSINESS INFORMATION
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-[#EFEDF5] bg-white shadow-sm">
          <div className="border-b border-[#EFEDF5] px-5 py-5 sm:px-7">
            <h2 className="font-display text-lg font-extrabold text-ink">
              Business Information
            </h2>

            <p className="mt-1 text-sm text-ink-soft">
              Information associated with your business listing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
            {/* Name */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Business Name
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.name || "—"}
              </p>
            </div>

            {/* Category */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Category
              </p>

              <p className="text-sm font-semibold text-ink">
                {getCategoryName()}
              </p>
            </div>

            {/* Phone */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Phone
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.phone || "—"}
              </p>
            </div>

            {/* Email */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Email
              </p>

              <p className="break-all text-sm font-semibold text-ink">
                {business.email || "—"}
              </p>
            </div>

            {/* Area */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Area
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.area || "—"}
              </p>
            </div>

            {/* City */}

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                City
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.city || "—"}
              </p>
            </div>

            {/* Address */}

            <div className="sm:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Address
              </p>

              <p className="text-sm font-semibold leading-6 text-ink">
                {business.address || "—"}
              </p>
            </div>

            {/* Description */}

            <div className="sm:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Description
              </p>

              <p className="whitespace-pre-line text-sm leading-6 text-ink-soft">
                {business.description || "No description provided."}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
                            PHOTOS
        ================================================== */}

        {(logo || images.length > 0) && (
          <section className="mb-6 rounded-2xl border border-[#EFEDF5] bg-white shadow-sm">
            <div className="border-b border-[#EFEDF5] px-5 py-5 sm:px-7">
              <h2 className="font-display text-lg font-extrabold text-ink">
                Business Photos
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                Images associated with your listing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4 sm:p-7">
              {logo && (
                <div className="aspect-square overflow-hidden rounded-xl border border-[#EFEDF5] bg-[#F7F6FA]">
                  <img
                    src={logo}
                    alt={`${business.name} logo`}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="aspect-square overflow-hidden rounded-xl border border-[#EFEDF5] bg-[#F7F6FA]"
                >
                  <img
                    src={image}
                    alt={`${business.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================================================
                        LISTING DETAILS
        ================================================== */}

        <section className="mb-6 rounded-2xl border border-[#EFEDF5] bg-white shadow-sm">
          <div className="border-b border-[#EFEDF5] px-5 py-5 sm:px-7">
            <h2 className="font-display text-lg font-extrabold text-ink">
              Listing Details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-3 sm:p-7">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Added On
              </p>

              <p className="text-sm font-semibold text-ink">
                {formatDate(business.createdAt)}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Profile Views
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.views ?? 0}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Reviews
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.reviewCount ?? 0}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Rating
              </p>

              <p className="text-sm font-semibold text-ink">
                {business.rating
                  ? `${Number(business.rating).toFixed(1)} / 5`
                  : "No ratings yet"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Active
              </p>

              <p className="text-sm font-semibold capitalize text-ink">
                {business.isActive ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Featured
              </p>

              <p className="text-sm font-semibold capitalize text-ink">
                {business.isFeatured ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        {/* ==================================================
                              ACTIONS
        ================================================== */}

        <section className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-xl border border-[#E5E1EC] bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#F7F6FA]"
          >
            ← Back
          </button>

          {approvalStatus === "approved" && (
            <Link
              to={`/business/${business._id}`}
              className="inline-flex items-center justify-center rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
            >
              View Public Profile →
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}

export default MerchantBusinessDetails;
