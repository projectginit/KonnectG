import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import SEO from "../components/SEO";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import apiRequest from "../services/api";

/* ==========================================================
                    BUSINESS HELPERS
========================================================== */

function getCategoryName(business) {
  return business?.categoryRef?.name || business?.category || "Local Business";
}

function getCoordinates(business) {
  const location = business?.location;

  /* GeoJSON Point:
     coordinates = [longitude, latitude]
  */
  if (
    Array.isArray(location?.coordinates) &&
    location.coordinates.length >= 2
  ) {
    return {
      longitude: Number(location.coordinates[0]),
      latitude: Number(location.coordinates[1]),
    };
  }

  /* { lat, lng } */
  if (location?.lat !== undefined && location?.lng !== undefined) {
    return {
      latitude: Number(location.lat),
      longitude: Number(location.lng),
    };
  }

  /* { latitude, longitude } */
  if (location?.latitude !== undefined && location?.longitude !== undefined) {
    return {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    };
  }

  /* Fallback for older business data */
  if (business?.latitude !== undefined && business?.longitude !== undefined) {
    return {
      latitude: Number(business.latitude),
      longitude: Number(business.longitude),
    };
  }

  return {
    latitude: null,
    longitude: null,
  };
}

function getBusinessImages(business) {
  const images = Array.isArray(business?.images)
    ? business.images.filter(Boolean)
    : [];

  if (business?.logo) {
    return [
      business.logo,
      ...images.filter((image) => image !== business.logo),
    ];
  }

  return images;
}

function isVerified(business) {
  return (
    business?.verificationStatus === "verified" || business?.verified === true
  );
}

function formatRating(rating) {
  const value = Number(rating);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(5, value));
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

function StarRating({ rating = 0, showNumber = true }) {
  const numericRating = formatRating(rating);
  const roundedRating = Math.round(numericRating);

  return (
    <div className="flex items-center gap-2">
      <span
        className="text-lg tracking-wide text-amber-500"
        aria-label={`${numericRating} out of 5 stars`}
      >
        {"★".repeat(roundedRating)}
        {"☆".repeat(5 - roundedRating)}
      </span>

      {showNumber && (
        <span className="text-sm font-semibold text-slate-700">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

/* ==========================================================
                    LOADING STATE
========================================================== */

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      <Navbar />

      <main className="mx-auto min-h-[70vh] w-full max-w-6xl px-5 py-10 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-32 rounded bg-slate-200" />

          <div className="overflow-hidden rounded-3xl border border-[#EFEDF5] bg-white">
            <div className="h-64 bg-slate-200 sm:h-80" />

            <div className="space-y-4 p-6 sm:p-8">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-10 w-72 rounded bg-slate-200" />
              <div className="h-4 w-52 rounded bg-slate-200" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-56 rounded-2xl bg-slate-200" />

            <div className="h-56 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ==========================================================
                    ERROR / NOT FOUND
========================================================== */

function ErrorState({ businessId, message }) {
  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      <SEO
        title="Business Not Found | KonnectG"
        description="The business you're looking for could not be found on KonnectG."
        path={`/businesses/${businessId}`}
        noIndex
      />

      <Navbar />

      <main className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🔍</div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-800">
          Business Not Found
        </h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {message ||
            "We couldn't find the business you're looking for. It may have been removed or the link may be incorrect."}
        </p>

        <Link
          to="/listings"
          className="mt-6 rounded-full bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-600"
        >
          ← Back to Listings
        </Link>
      </main>

      <Footer />
    </div>
  );
}

/* ==========================================================
                    BUSINESS DETAILS PAGE
========================================================== */

export default function BusinessDetails() {
  const { businessId } = useParams();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);

  /* ==========================================================
                        LOAD BUSINESS
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadBusiness = async () => {
      if (!businessId) {
        setBusiness(null);
        setError("A valid business could not be identified.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [businessResponse, reviewsResponse, offersResponse] =
          await Promise.all([
            apiRequest(`/businesses/${businessId}`),
            apiRequest(`/reviews/business/${businessId}`),
            apiRequest(`/offers?business=${businessId}`),
          ]);

        if (!cancelled) {
          setBusiness(businessResponse?.business || null);
          setReviews(
            Array.isArray(reviewsResponse?.reviews)
              ? reviewsResponse.reviews
              : [],
          );
          setOffers(
            Array.isArray(offersResponse?.offers) ? offersResponse.offers : [],
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Load business details error:", err);

          setBusiness(null);
          setReviews([]);
          setOffers([]);
          setError(err.message || "Unable to load this business right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBusiness();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  /* ==========================================================
                    DERIVED BUSINESS DATA
  ========================================================== */

  const categoryName = getCategoryName(business);

  const coordinates = getCoordinates(business);

  const images = getBusinessImages(business);

  const verified = isVerified(business);

  const rating = formatRating(business?.rating);

  const reviewCount = Number(business?.reviewCount) || 0;

  const primaryOffer = offers[0] || null;

  const locationLabel = [business?.area, business?.city]
    .filter(Boolean)
    .join(", ");

  const businessDescription =
    business?.description?.trim() ||
    `Discover ${business?.name || "this local business"} in ${
      locationLabel || "your area"
    } on KonnectG.`;

  /* ==========================================================
                        SEO DESCRIPTION
  ========================================================== */

  const seoDescription = useMemo(() => {
    const text =
      `Discover ${business?.name || "this business"} ` +
      `in ${locationLabel || "Siliguri"}. ` +
      businessDescription;

    return text.length > 160 ? `${text.slice(0, 157)}...` : text;
  }, [business?.name, businessDescription, locationLabel]);

  /* ==========================================================
                    STRUCTURED DATA
  ========================================================== */

  const structuredData = useMemo(() => {
    if (!business) {
      return null;
    }

    const data = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",

      name: business.name,

      description: businessDescription,

      url: `https://konnectg.com/businesses/${businessId}`,

      address: {
        "@type": "PostalAddress",

        streetAddress: business.address || undefined,

        addressLocality: business.area || business.city || undefined,

        addressRegion: "West Bengal",

        addressCountry: "IN",
      },
    };

    if (business.phone) {
      data.telephone = business.phone;
    }

    if (business.email) {
      data.email = business.email;
    }

    if (business.logo) {
      data.image = [business.logo];
    } else if (
      images.length > 0 &&
      images.some((image) => image.startsWith("http"))
    ) {
      data.image = images.filter((image) => image.startsWith("http"));
    }

    if (
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude)
    ) {
      data.geo = {
        "@type": "GeoCoordinates",

        latitude: coordinates.latitude,

        longitude: coordinates.longitude,
      };
    }

    if (rating > 0 && reviewCount > 0) {
      data.aggregateRating = {
        "@type": "AggregateRating",

        ratingValue: rating,

        reviewCount,

        bestRating: 5,

        worstRating: 1,
      };
    }

    return data;
  }, [
    business,
    businessDescription,
    businessId,
    coordinates.latitude,
    coordinates.longitude,
    images,
    rating,
    reviewCount,
  ]);

  /* ==========================================================
                        LOADING
  ========================================================== */

  if (loading) {
    return <LoadingState />;
  }

  /* ==========================================================
                    NOT FOUND / ERROR
  ========================================================== */

  if (!business) {
    return <ErrorState businessId={businessId} message={error} />;
  }

  const imageList = images.length > 0 ? images : [null];

  /* ==========================================================
                        PAGE
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      {/* ==================================================
                            SEO
      ================================================== */}

      <SEO
        title={`${business.name} | ${categoryName} in ${
          business.area || business.city || "Siliguri"
        } | KonnectG`}
        description={seoDescription}
        path={`/businesses/${businessId}`}
        image={
          business.logo || images.find((image) => image.startsWith("http"))
        }
      />

      {/* ==================================================
                    LOCAL BUSINESS SCHEMA
      ================================================== */}

      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* ==================================================
                            NAVBAR
      ================================================== */}

      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {/* ==================================================
                        BACK NAVIGATION
        ================================================== */}

        <Link
          to="/listings"
          className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 transition hover:text-purple-800 hover:underline"
        >
          ← Back to Listings
        </Link>

        {/* ==================================================
                        BUSINESS HEADER
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#EFEDF5] bg-white shadow-sm">
          {/* ==================================================
                            IMAGE AREA
          ================================================== */}

          <div className="grid h-64 grid-cols-1 gap-2 sm:h-80 sm:grid-cols-3">
            {imageList.map((image, index) => (
              <div
                key={`${image || "placeholder"}-${index}`}
                className={`h-full ${
                  index === 0 ? "sm:col-span-2" : "hidden sm:block"
                }`}
                style={
                  image
                    ? {
                        backgroundImage: `url("${image}")`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }
                    : {
                        background: "linear-gradient(135deg,#F3E8FF,#EDE9FE)",
                      }
                }
              />
            ))}
          </div>

          {/* ==================================================
                    BUSINESS INFORMATION
          ================================================== */}

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                {/* CATEGORY */}

                <p className="text-sm font-semibold text-purple-600">
                  {categoryName}
                </p>

                {/* NAME */}

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
                    {business.name}
                  </h1>

                  {verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* CATEGORY / AREA */}

                <p className="mt-2 text-sm text-slate-500">
                  {categoryName}

                  {business.area ? ` • ${business.area}` : ""}
                </p>

                {/* RATING */}

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <StarRating rating={rating} />

                  <span className="text-sm text-slate-500">
                    {reviewCount} reviews
                  </span>
                </div>
              </div>

              {/* ==================================================
                            ACTION BUTTONS
              ================================================== */}

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    📞 Call
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-50 px-6 py-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                  >
                    ✉️ Email
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
                        MAIN CONTENT GRID
        ================================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ==================================================
                            LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">
            {/* ==================================================
                                ABOUT
            ================================================== */}

            <section className="rounded-2xl border border-[#EFEDF5] bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-800">
                About {business.name}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {businessDescription}
              </p>
            </section>

            {/* ==================================================
                                OFFER
            ================================================== */}

            {primaryOffer && (
              <section className="rounded-2xl border border-yellow-100 bg-gradient-to-br from-[#FFF9E8] to-[#FFF3C4] p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {primaryOffer.title && (
                      <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-purple-900">
                        {primaryOffer.title}
                      </span>
                    )}

                    <h2 className="mt-3 text-xl font-bold text-slate-800">
                      Current Offer
                    </h2>

                    {primaryOffer.description && (
                      <p className="mt-1 text-sm text-slate-600">
                        {primaryOffer.description}
                      </p>
                    )}
                  </div>

                  {primaryOffer.validUntil && (
                    <div className="text-sm text-slate-500">
                      Valid until{" "}
                      <strong className="text-slate-700">
                        {primaryOffer.validUntil}
                      </strong>
                    </div>
                  )}

                  {primaryOffer.endDate && !primaryOffer.validUntil && (
                    <div className="text-sm text-slate-500">
                      Valid until{" "}
                      <strong className="text-slate-700">
                        {formatDate(primaryOffer.endDate)}
                      </strong>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ==================================================
                                REVIEWS
            ================================================== */}

            {reviews.length > 0 && (
              <section className="rounded-2xl border border-[#EFEDF5] bg-white p-6 shadow-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Reviews
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      What people are saying about this business.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-slate-800">
                      {rating.toFixed(1)}
                    </p>

                    <StarRating rating={rating} showNumber={false} />
                  </div>
                </div>

                <div className="mt-6 divide-y divide-slate-100">
                  {reviews.map((review, index) => (
                    <article
                      key={review._id || review.id || index}
                      className="py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">
                            {review.name ||
                              review.user?.name ||
                              "KonnectG User"}
                          </h3>

                          <div className="mt-1">
                            <StarRating
                              rating={review.rating}
                              showNumber={false}
                            />
                          </div>
                        </div>

                        <span className="text-xs text-slate-400">
                          {review.date || formatDate(review.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {review.text || review.comment || review.message}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ==================================================
                            RIGHT COLUMN
          ================================================== */}

          <aside className="space-y-6">
            {/* ==================================================
                            CONTACT
            ================================================== */}

            <section className="rounded-2xl border border-[#EFEDF5] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">
                Contact & Location
              </h2>

              <div className="mt-5 space-y-5">
                {/* ADDRESS */}

                {business.address && (
                  <div className="flex gap-3">
                    <span className="text-lg">📍</span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {business.address}

                        {(business.area || business.city) && (
                          <>
                            <br />

                            {[business.area, business.city]
                              .filter(Boolean)
                              .join(", ")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* PHONE */}

                {business.phone && (
                  <div className="flex gap-3">
                    <span className="text-lg">📞</span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Phone
                      </p>

                      <a
                        href={`tel:${business.phone}`}
                        className="mt-1 block text-sm font-semibold text-purple-600 hover:underline"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* EMAIL */}

                {business.email && (
                  <div className="flex gap-3">
                    <span className="text-lg">✉️</span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <a
                        href={`mailto:${business.email}`}
                        className="mt-1 block break-all text-sm font-semibold text-purple-600 hover:underline"
                      >
                        {business.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================
                            MAP
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-[#EFEDF5] bg-white shadow-sm">
              <div className="flex h-56 items-center justify-center bg-[#E8EEF5]">
                <div className="text-center">
                  <div className="text-4xl">📍</div>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {business.area || business.city || "Location"}
                  </p>

                  {Number.isFinite(coordinates.latitude) &&
                    Number.isFinite(coordinates.longitude) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {coordinates.latitude}, {coordinates.longitude}
                      </p>
                    )}
                </div>
              </div>

              <div className="p-4">
                {Number.isFinite(coordinates.latitude) &&
                Number.isFinite(coordinates.longitude) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const url =
                        `https://www.google.com/maps/search/?api=1&query=` +
                        `${coordinates.latitude},${coordinates.longitude}`;

                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full rounded-full bg-purple-50 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                  >
                    🗺️ Open in Google Maps
                  </button>
                ) : (
                  <p className="text-center text-xs text-slate-500">
                    Map location is not available for this business yet.
                  </p>
                )}
              </div>
            </section>

            {/* ==================================================
                        BUSINESS INFORMATION
            ================================================== */}

            <section className="rounded-2xl border border-[#EFEDF5] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800">
                Business Information
              </h2>

              <div className="mt-5 space-y-4">
                {/* STATUS */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Status</span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-600">
                    {business.approvalStatus || "approved"}
                  </span>
                </div>

                {/* VERIFICATION */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Verification</span>

                  <span className="text-sm font-semibold text-slate-700">
                    {verified ? "Verified" : "Not verified"}
                  </span>
                </div>

                {/* VIEWS */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Profile Views</span>

                  <span className="text-sm font-semibold text-slate-700">
                    {Number(business.views) || 0}
                  </span>
                </div>

                {/* FEATURED */}

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">Featured</span>

                  <span className="text-sm font-semibold text-slate-700">
                    {business.isFeatured ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* ==================================================
                            FOOTER
      ================================================== */}

      <Footer />
    </div>
  );
}
