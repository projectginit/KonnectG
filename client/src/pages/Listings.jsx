import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Search,
  SlidersHorizontal,
  Star,
  X,
//   ShieldCheck,
  BadgeCheck,
  Building2,
  Eye,
  User,
  CalendarDays,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import apiRequest from "../services/api";
import { CATEGORIES } from "../data/categories";

/* ==========================================================
   FILTERS
========================================================== */

const FILTERS = ["All", "Verified Only", "Top Rated", "With Offers"];

/* ==========================================================
   SORT OPTIONS
========================================================== */

const SORT_OPTIONS = [
  {
    label: "Recommended",
    value: "relevance",
  },
  {
    label: "Top Rated",
    value: "rating",
  },
  {
    label: "Most Reviewed",
    value: "reviews",
  },
  {
    label: "Newest",
    value: "newest",
  },
];

/* ==========================================================
   CATEGORY HELPERS
========================================================== */

function getCategoryBySlug(slug) {
  if (!slug) {
    return null;
  }

  return (
    CATEGORIES.find(
      (category) => category.slug?.toLowerCase() === slug.toLowerCase(),
    ) || null
  );
}

/* ==========================================================
   BUSINESS HELPERS
========================================================== */

function getBusinessCategory(business) {
  return business?.categoryRef?.name || business?.category || "Uncategorized";
}

// function getBusinessCategorySlug(business) {
//   return business?.categoryRef?.slug || "";
// }

// function getBusinessType(business) {
//   return getBusinessCategory(business);
// }

function getBusinessImage(business) {
  if (business?.logo) {
    return business.logo;
  }

  if (Array.isArray(business?.images) && business.images.length > 0) {
    return business.images[0];
  }

  return "";
}

function formatRating(rating) {
  const value = Number(rating);

  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(1);
}

function formatDate(date) {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ==========================================================
   STAR RATING
========================================================== */

function StarRating({ rating = 0 }) {
  const numericRating = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={15}
          fill={star <= Math.round(numericRating) ? "currentColor" : "none"}
          className={
            star <= Math.round(numericRating)
              ? "text-yellow-500"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

/* ==========================================================
   BUSINESS IMAGE
========================================================== */

function BusinessImage({ business, large = false }) {
  const image = getBusinessImage(business);

  if (!image) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 ${
          large ? "h-64" : "h-48"
        }`}
      >
        <Building2 size={large ? 64 : 42} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={business?.name || "Business"}
      className={`w-full object-cover ${large ? "h-64" : "h-48"}`}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

/* ==========================================================
   BUSINESS CARD
========================================================== */

function BusinessCard({ business, onViewDetails }) {
  const businessId = business?._id;

  const category = getBusinessCategory(business);
  const image = getBusinessImage(business);

  const rating = Number(business?.rating || 0);
  const reviewCount = Number(business?.reviewCount || 0);

  const verified = business?.verificationStatus === "verified";

  const featured = Boolean(business?.isFeatured);

  return (
    <article
      onClick={() => onViewDetails(businessId)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* IMAGE */}

      <div className="relative overflow-hidden">
        <BusinessImage business={business} />

        {image && (
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-48 w-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />
        )}

        {/* FEATURED */}

        {featured && (
          <span className="absolute left-3 top-3 rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white shadow">
            Featured
          </span>
        )}

        {/* VERIFIED */}

        {verified && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700 shadow">
            <BadgeCheck size={14} />
            Verified
          </span>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        {/* NAME */}

        <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
          {business?.name || "Unnamed Business"}
        </h3>

        {/* CATEGORY */}

        <p className="mt-1 text-sm font-medium text-purple-700">{category}</p>

        {/* LOCATION */}

        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
          <MapPin size={17} className="mt-0.5 shrink-0 text-purple-600" />

          <span>
            {[business?.area, business?.city].filter(Boolean).join(", ") ||
              business?.address ||
              "Location unavailable"}
          </span>
        </div>

        {/* RATING */}

        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={rating} />

          <span className="text-sm font-semibold text-gray-800">
            {formatRating(rating)}
          </span>

          <span className="text-sm text-gray-500">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>

        {/* PHONE */}

        {business?.phone && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
            <Phone size={16} className="text-purple-600" />

            <span>{business.phone}</span>
          </div>
        )}

        {/* VIEW DETAILS */}

        <div className="mt-5 border-t border-gray-100 pt-4">
          <span className="text-sm font-semibold text-purple-700 transition group-hover:text-purple-900">
            View full details →
          </span>
        </div>
      </div>
    </article>
  );
}

/* ==========================================================
   BUSINESS DETAILS MODAL
========================================================== */

function BusinessDetailsModal({ business, loading, error, onClose }) {
  if (!business && !loading && !error) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          aria-label="Close business details"
        >
          <X size={22} />
        </button>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

              <p className="mt-4 text-sm text-gray-600">
                Loading business details...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                Unable to load business
              </h3>

              <p className="mt-2 text-gray-600">{error}</p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* BUSINESS DETAILS */}

        {!loading && !error && business && (
          <>
            {/* HERO IMAGE */}

            <div className="relative">
              <BusinessImage business={business} large />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-20">
                <div className="flex flex-wrap items-center gap-2">
                  {business.verificationStatus === "verified" && (
                    <span className="flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                      <BadgeCheck size={14} />
                      Verified Business
                    </span>
                  )}

                  {business.isFeatured && (
                    <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                      Featured
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
                  {business.name}
                </h2>

                <p className="mt-1 text-sm text-white/90">
                  {getBusinessCategory(business)}
                </p>
              </div>
            </div>

            {/* MAIN CONTENT */}

            <div className="p-6 md:p-8">
              {/* RATING */}

              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-6">
                <StarRating rating={business.rating} />

                <span className="font-bold text-gray-900">
                  {formatRating(business.rating)}
                </span>

                <span className="text-sm text-gray-500">
                  {business.reviewCount || 0} reviews
                </span>

                {business.views !== undefined && (
                  <span className="ml-auto flex items-center gap-1 text-sm text-gray-500">
                    <Eye size={16} />
                    {business.views || 0} views
                  </span>
                )}
              </div>

              {/* DESCRIPTION */}

              <section className="mt-6">
                <h3 className="text-lg font-bold text-gray-900">
                  About this business
                </h3>

                <p className="mt-2 whitespace-pre-line leading-7 text-gray-600">
                  {business.description ||
                    "No description has been provided for this business."}
                </p>
              </section>

              {/* CONTACT INFORMATION */}

              <section className="mt-8">
                <h3 className="text-lg font-bold text-gray-900">
                  Contact Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {/* PHONE */}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Phone size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Phone
                        </p>

                        {business.phone ? (
                          <a
                            href={`tel:${business.phone}`}
                            onClick={(event) => event.stopPropagation()}
                            className="mt-1 block break-all font-semibold text-gray-900 hover:text-purple-700"
                          >
                            {business.phone}
                          </a>
                        ) : (
                          <p className="mt-1 font-semibold text-gray-500">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <Mail size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Email
                        </p>

                        {business.email ? (
                          <a
                            href={`mailto:${business.email}`}
                            onClick={(event) => event.stopPropagation()}
                            className="mt-1 block break-all font-semibold text-gray-900 hover:text-purple-700"
                          >
                            {business.email}
                          </a>
                        ) : (
                          <p className="mt-1 font-semibold text-gray-500">
                            Not provided
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* LOCATION */}

              <section className="mt-8">
                <h3 className="text-lg font-bold text-gray-900">Location</h3>

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <MapPin size={21} />
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {business.address || "Address not provided"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {[business.area, business.city]
                          .filter(Boolean)
                          .join(", ") || "Location not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* BUSINESS INFORMATION */}

              <section className="mt-8">
                <h3 className="text-lg font-bold text-gray-900">
                  Business Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* CATEGORY */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Category
                    </p>

                    <p className="mt-2 font-semibold text-gray-900">
                      {getBusinessCategory(business)}
                    </p>
                  </div>

                  {/* AREA */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Area
                    </p>

                    <p className="mt-2 font-semibold text-gray-900">
                      {business.area || "Not provided"}
                    </p>
                  </div>

                  {/* CITY */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      City
                    </p>

                    <p className="mt-2 font-semibold text-gray-900">
                      {business.city || "Not provided"}
                    </p>
                  </div>

                  {/* VERIFICATION */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Verification
                    </p>

                    <p
                      className={`mt-2 font-semibold ${
                        business.verificationStatus === "verified"
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {business.verificationStatus === "verified"
                        ? "Verified"
                        : "Not Verified"}
                    </p>
                  </div>

                  {/* APPROVAL */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Approval
                    </p>

                    <p className="mt-2 font-semibold capitalize text-gray-900">
                      {business.approvalStatus || "Unknown"}
                    </p>
                  </div>

                  {/* CREATED */}

                  <div className="rounded-2xl border border-gray-100 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Listed Since
                    </p>

                    <p className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                      <CalendarDays size={16} />
                      {formatDate(business.createdAt)}
                    </p>
                  </div>
                </div>
              </section>

              {/* OWNER */}

              {business.owner && (
                <section className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900">
                    Business Owner
                  </h3>

                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                        <User size={22} />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {business.owner.name || "Business Owner"}
                        </p>

                        {business.owner.email && (
                          <p className="mt-1 text-sm text-gray-600">
                            {business.owner.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ADDITIONAL IMAGES */}

              {Array.isArray(business.images) && business.images.length > 0 && (
                <section className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900">
                    Business Photos
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {business.images.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`${business.name} ${index + 1}`}
                        className="h-40 w-full rounded-2xl object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* CONTACT BUTTONS */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white transition hover:bg-purple-800"
                  >
                    <Phone size={18} />
                    Call Business
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-700 px-5 py-3 font-semibold text-purple-700 transition hover:bg-purple-50"
                  >
                    <Mail size={18} />
                    Email Business
                  </a>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ==========================================================
   LISTINGS PAGE
========================================================== */

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [businesses, setBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState("All");

  const [sort, setSort] = useState("relevance");

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalBusinesses, setTotalBusinesses] = useState(0);

  /* ========================================================
     SELECTED BUSINESS
  ======================================================== */

  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsError, setDetailsError] = useState("");

  /* ========================================================
     URL FILTERS
  ======================================================== */

  const categorySlug = searchParams.get("category") || "";

  const area = searchParams.get("area") || "";

  const search = searchParams.get("search") || "";

  const selectedCategory = getCategoryBySlug(categorySlug);

  /* ========================================================
     LOAD BUSINESSES
  ======================================================== */

  const loadBusinesses = async (requestedPage = page) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("page", requestedPage);
      params.append("limit", "12");

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (categorySlug.trim()) {
        params.append("category", categorySlug.trim());
      }

      if (area.trim()) {
        params.append("area", area.trim());
      }

      /* VERIFIED FILTER */

      if (activeFilter === "Verified Only") {
        params.append("verified", "true");
      }

      /* FEATURED FILTER */

      /*
        IMPORTANT:
        The backend currently exposes "featured=true".
        This corresponds to featured businesses,
        not necessarily businesses with offers.
      */

      if (activeFilter === "With Offers") {
        params.append("featured", "true");
      }

      /* SORT */

      params.append("sort", sort);

      const response = await apiRequest(`/businesses?${params.toString()}`);

      setBusinesses(response.businesses || []);

      setPage(Number(response.page) || requestedPage);

      setTotalPages(Number(response.totalPages) || 1);

      setTotalBusinesses(Number(response.total) || 0);
    } catch (requestError) {
      console.error("Load businesses error:", requestError);

      setError(requestError.message || "Unable to load businesses.");
    } finally {
      setLoading(false);
    }
  };

  /* ========================================================
     LOAD WHEN FILTERS CHANGE
  ======================================================== */

  useEffect(() => {
    loadBusinesses(1);
  }, [search, categorySlug, area, activeFilter, sort]);

  /* ========================================================
     SEARCH
  ======================================================== */

  const handleSearch = (event) => {
    event.preventDefault();

    const nextParams = new URLSearchParams(searchParams);

    if (searchInput.trim()) {
      nextParams.set("search", searchInput.trim());
    } else {
      nextParams.delete("search");
    }

    setPage(1);
    setSearchParams(nextParams);
  };

  /* ========================================================
     CLEAR SEARCH
  ======================================================== */

  const clearSearch = () => {
    setSearchInput("");

    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("search");

    setPage(1);
    setSearchParams(nextParams);
  };

  /* ========================================================
     CATEGORY CLEAR
  ======================================================== */

  const clearCategory = () => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("category");

    setPage(1);
    setSearchParams(nextParams);
  };

  /* ========================================================
     PAGINATION
  ======================================================== */

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
    loadBusinesses(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ========================================================
     VIEW BUSINESS DETAILS
  ======================================================== */

  const handleViewBusiness = async (businessId) => {
    if (!businessId) {
      setDetailsError("This business does not have a valid ID.");
      return;
    }

    try {
      setSelectedBusiness(null);
      setDetailsError("");
      setDetailsLoading(true);

      /*
        Fetch the complete business record.

        This means the modal does NOT depend on
        whatever limited fields were returned by
        the Listings endpoint.
      */

      const response = await apiRequest(`/businesses/${businessId}`);

      setSelectedBusiness(response.business || response);
    } catch (requestError) {
      console.error("Load business details error:", requestError);

      setDetailsError(
        requestError.message || "Unable to load business details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ========================================================
     FILTERED CATEGORY DESCRIPTION
  ======================================================== */

  const categoryDescription = useMemo(() => {
    if (!selectedCategory || !selectedCategory.description) {
      return "";
    }

    return selectedCategory.description;
  }, [selectedCategory]);

  /* ========================================================
     PAGE NUMBERS
  ======================================================== */

  const pageNumbers = useMemo(() => {
    const pages = [];

    const start = Math.max(1, page - 2);

    const end = Math.min(totalPages, page + 2);

    for (let current = start; current <= end; current++) {
      pages.push(current);
    }

    return pages;
  }, [page, totalPages]);

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div className="min-h-screen bg-[#faf9fc]">
      <Navbar />

      <main>
        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-700">
                Discover Local Businesses
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                Find businesses near you
              </h1>

              <p className="mt-3 text-gray-600">
                Discover trusted local businesses, services and professionals
                around Siliguri.
              </p>

              {selectedCategory && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-sm font-semibold text-purple-700">
                    {selectedCategory.name}
                  </span>

                  <button
                    type="button"
                    onClick={clearCategory}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                  >
                    <X size={15} />
                    Clear
                  </button>
                </div>
              )}

              {categoryDescription && (
                <p className="mt-3 text-sm text-gray-500">
                  {categoryDescription}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            SEARCH + FILTERS
        ================================================== */}

        <section className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* SEARCH */}

              <form onSubmit={handleSearch} className="flex flex-1">
                <div className="relative flex-1">
                  <Search
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search businesses, services..."
                    className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  />

                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="ml-2 rounded-xl bg-purple-700 px-5 font-semibold text-white transition hover:bg-purple-800"
                >
                  Search
                </button>
              </form>

              {/* SORT */}

              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-gray-500" />

                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(1);
                  }}
                  className="h-12 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 outline-none focus:border-purple-600"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* FILTER BUTTONS */}

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter);
                    setPage(1);
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? "bg-purple-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            RESULTS
        ================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* RESULT COUNT */}

          {!loading && !error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {search
                    ? `Results for "${search}"`
                    : selectedCategory
                      ? selectedCategory.name
                      : "Local Businesses"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {totalBusinesses}{" "}
                  {totalBusinesses === 1 ? "business" : "businesses"} found
                </p>
              </div>
            </div>
          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  <div className="h-48 animate-pulse bg-gray-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />

                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <h3 className="text-lg font-bold text-red-800">
                Unable to load businesses
              </h3>

              <p className="mt-2 text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => loadBusinesses(page)}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading && !error && businesses.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <Search size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-900">
                No businesses found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-gray-600">
                Try changing your search, category or filters to find more
                businesses.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setActiveFilter("All");
                  setSort("relevance");

                  setSearchParams({});
                }}
                className="mt-6 rounded-xl bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* ==================================================
              BUSINESS GRID
          ================================================== */}

          {!loading && !error && businesses.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard
                  key={business._id}
                  business={business}
                  onViewDetails={handleViewBusiness}
                />
              ))}
            </div>
          )}

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {!loading && !error && businesses.length > 0 && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  className={`h-10 w-10 rounded-lg text-sm font-semibold ${
                    pageNumber === page
                      ? "bg-purple-700 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* ======================================================
          BUSINESS DETAILS MODAL
      ====================================================== */}

      {(selectedBusiness || detailsLoading || detailsError) && (
        <BusinessDetailsModal
          business={selectedBusiness}
          loading={detailsLoading}
          error={detailsError}
          onClose={() => {
            setSelectedBusiness(null);
            setDetailsError("");
          }}
        />
      )}
    </div>
  );
}
