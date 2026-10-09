import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star, Tag } from "lucide-react";

import apiRequest from "../services/api";
import { CATEGORIES } from "../data/categories";

/* ==========================================================
                    HOMEPAGE CATEGORIES
========================================================== */

const POPULAR_CATEGORY_SLUGS = [
  "catering-services",
  "beauty-parlors-salons",
  "bike-car-garages",
  "physiotherapy-centers",
  "furniture-stores",
  "schools-coaching-institutes",
];

const POPULAR_CATEGORIES = POPULAR_CATEGORY_SLUGS.map((slug) =>
  CATEGORIES.find((category) => category.slug === slug),
).filter(Boolean);

/* ==========================================================
                        HELPERS
========================================================== */

const getBusinessLocation = (business) => {
  return [business.area, business.city].filter(Boolean).join(", ");
};

const getBusinessRating = (business) => {
  const rating = Number(business.rating);

  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : null;
};

const getOfferDiscount = (offer) => {
  if (!offer?.discountValue) {
    return null;
  }

  if (offer.discountType === "percentage") {
    return `${offer.discountValue}% OFF`;
  }

  return `₹${offer.discountValue} OFF`;
};

const formatOfferDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ==========================================================
                        LOADING CARD
========================================================== */

function LoadingCard() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-100
        bg-white
        shadow-sm
      "
      aria-hidden="true"
    >
      <div className="h-32 animate-pulse bg-slate-200" />

      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

/* ==========================================================
                    EMPTY / ERROR MESSAGE
========================================================== */

function SectionMessage({ message }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-slate-50
        px-6
        py-10
        text-center
      "
    >
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

/* ==========================================================
                    VERIFIED BUSINESS CARD
========================================================== */

function BusinessCard({ business }) {
  const businessId = business._id;
  const categoryName =
    business.categoryRef?.name || business.category || "Local Business";

  const location = getBusinessLocation(business);
  const rating = getBusinessRating(business);

  const image =
    business.logo ||
    (Array.isArray(business.images) && business.images.length > 0
      ? business.images[0]
      : null);

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-purple-50
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* ==================================================
                            IMAGE
      ================================================== */}

      <div
        className="
          relative
          flex
          h-36
          items-center
          justify-center
          overflow-hidden
          bg-gradient-to-br
          from-purple-100
          to-purple-50
        "
      >
        {image ? (
          <img
            src={image}
            alt={business.name || "Business"}
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              px-6
              text-center
              text-2xl
              font-extrabold
              text-purple-700
            "
          >
            {business.name?.charAt(0)?.toUpperCase() || "K"}
          </div>
        )}

        <span
          className="
            absolute
            right-3
            top-3
            inline-flex
            items-center
            gap-1
            rounded-full
            bg-white
            px-2.5
            py-1
            text-xs
            font-bold
            text-emerald-600
            shadow-sm
          "
        >
          <span aria-hidden="true">✓</span>
          Verified
        </span>
      </div>

      {/* ==================================================
                            CONTENT
      ================================================== */}

      <div className="p-5">
        <h3
          className="
            truncate
            text-base
            font-bold
            text-slate-800
          "
        >
          {business.name || "Unnamed Business"}
        </h3>

        <p
          className="
            mt-1
            truncate
            text-sm
            text-slate-500
          "
        >
          {categoryName}
        </p>

        <div
          className="
            mt-3
            flex
            flex-wrap
            items-center
            gap-x-3
            gap-y-2
            text-xs
            text-slate-500
          "
        >
          {location && (
            <span className="flex min-w-0 items-center gap-1">
              <MapPin size={13} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{location}</span>
            </span>
          )}

          {rating && (
            <span className="flex items-center gap-1 font-semibold">
              <Star
                size={13}
                className="fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {rating}
            </span>
          )}

          {business.reviewCount > 0 && (
            <span>
              {business.reviewCount}{" "}
              {business.reviewCount === 1 ? "review" : "reviews"}
            </span>
          )}
        </div>

        <Link
          to={`/business/${businessId}`}
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-purple-50
            py-2.5
            text-sm
            font-semibold
            text-purple-700
            transition-colors
            hover:bg-purple-100
          "
        >
          View Business
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/* ==========================================================
                            OFFER CARD
========================================================== */

function OfferCard({ offer }) {
  const business = offer.business;

  const discount = getOfferDiscount(offer);
  const location = business
    ? [business.area, business.city].filter(Boolean).join(", ")
    : "";

  const endDate = formatOfferDate(offer.endDate);

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-purple-50
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      {/* Accent */}
      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-1
          bg-purple-700
        "
        aria-hidden="true"
      />

      <div className="pl-2">
        {discount && (
          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-gold
              px-3
              py-1
              text-xs
              font-bold
              text-purple-950
            "
          >
            <Tag size={12} aria-hidden="true" />
            {discount}
          </span>
        )}

        <h3
          className="
            mt-4
            line-clamp-2
            text-base
            font-bold
            leading-snug
            text-slate-800
          "
        >
          {offer.title}
        </h3>

        {business?.name && (
          <p
            className="
              mt-2
              truncate
              text-sm
              font-medium
              text-slate-600
            "
          >
            {business.name}
          </p>
        )}

        {location && (
          <p
            className="
              mt-1
              flex
              items-center
              gap-1
              text-xs
              text-slate-500
            "
          >
            <MapPin size={12} aria-hidden="true" />
            {location}
          </p>
        )}

        {endDate && (
          <p className="mt-3 text-xs text-slate-400">Valid till {endDate}</p>
        )}
      </div>
    </article>
  );
}

/* ==========================================================
                        HOW IT WORKS
========================================================== */

const STEPS = [
  {
    id: "discover",
    icon: "🔍",
    bg: "#EDE3FB",
    label: "Step 1",
    title: "Discover",
    text: "Search and explore local businesses in your neighbourhood.",
  },
  {
    id: "verify",
    icon: "✅",
    bg: "#D6F5E3",
    label: "Step 2",
    title: "Verify",
    text: "Every listed business is verified before appearing as verified.",
  },
  {
    id: "connect",
    icon: "🧡",
    bg: "#FCEFC4",
    label: "Step 3",
    title: "Connect",
    text: "Connect directly via call, WhatsApp, or visit in person.",
  },
];

/* ==========================================================
                            CARDS
========================================================== */

export default function Cards() {
  const [businesses, setBusinesses] = useState([]);
  const [offers, setOffers] = useState([]);

  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);

  const [businessesError, setBusinessesError] = useState(false);
  const [offersError, setOffersError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBusinesses = async () => {
      try {
        const data = await apiRequest(
          "/businesses?verified=true&limit=3&page=1&sort=rating",
        );

        if (!isMounted) return;

        setBusinesses(Array.isArray(data.businesses) ? data.businesses : []);
      } catch (error) {
        console.error("Failed to load homepage businesses:", error.message);

        if (isMounted) {
          setBusinessesError(true);
          setBusinesses([]);
        }
      } finally {
        if (isMounted) {
          setBusinessesLoading(false);
        }
      }
    };

    const loadOffers = async () => {
      try {
        const data = await apiRequest(
          "/offers?featured=true&limit=3&page=1&sort=featured",
        );

        if (!isMounted) return;

        setOffers(Array.isArray(data.offers) ? data.offers : []);
      } catch (error) {
        console.error("Failed to load homepage offers:", error.message);

        if (isMounted) {
          setOffersError(true);
          setOffers([]);
        }
      } finally {
        if (isMounted) {
          setOffersLoading(false);
        }
      }
    };

    loadBusinesses();
    loadOffers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* ======================================================
                      POPULAR CATEGORIES
      ====================================================== */}

      <section
        className="px-5 py-14 sm:px-6 sm:py-16"
        aria-labelledby="popular-categories"
      >
        <div className="mx-auto max-w-6xl">
          <div
            className="
              mb-7
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <h2
              id="popular-categories"
              className="
                text-xl
                font-bold
                text-slate-800
                sm:text-2xl
              "
            >
              Popular Categories
            </h2>

            <Link
              to="/categories"
              className="
                shrink-0
                text-sm
                font-semibold
                text-purple-600
                transition-colors
                hover:text-purple-800
              "
            >
              View All →
            </Link>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              sm:gap-4
              lg:grid-cols-6
            "
          >
            {POPULAR_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                to={`/listings?category=${encodeURIComponent(category.slug)}`}
                className="
                  rounded-2xl
                  border
                  border-transparent
                  bg-[#F7F6FA]
                  p-4
                  text-left
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-purple-100
                  hover:bg-white
                  hover:shadow-lg
                  focus-visible:outline-2
                  focus-visible:outline-purple-700
                  sm:p-5
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    text-xl
                  "
                  style={{
                    background: category.bg,
                  }}
                  aria-hidden="true"
                >
                  {category.icon}
                </div>

                <h3
                  className="
                    text-sm
                    font-semibold
                    leading-snug
                    text-slate-800
                  "
                >
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
                    TOP VERIFIED BUSINESSES
      ====================================================== */}

      <section className="px-5 py-8 sm:px-6" aria-labelledby="top-businesses">
        <div className="mx-auto max-w-6xl">
          <div
            className="
              mb-7
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                id="top-businesses"
                className="
                  text-xl
                  font-bold
                  text-slate-800
                  sm:text-2xl
                "
              >
                Top Verified Businesses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Trusted businesses from the local community.
              </p>
            </div>

            <Link
              to="/listings?verified=true"
              className="
                shrink-0
                text-sm
                font-semibold
                text-purple-600
                transition-colors
                hover:text-purple-800
              "
            >
              View All →
            </Link>
          </div>

          {businessesLoading ? (
            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3].map((item) => (
                <LoadingCard key={item} />
              ))}
            </div>
          ) : businessesError ? (
            <SectionMessage message="We couldn't load verified businesses right now." />
          ) : businesses.length === 0 ? (
            <SectionMessage message="No verified businesses are available yet." />
          ) : (
            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {businesses.map((business) => (
                <BusinessCard key={business._id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
                          LOCAL OFFERS
      ====================================================== */}

      <section className="px-5 py-8 sm:px-6" aria-labelledby="local-offers">
        <div className="mx-auto max-w-6xl">
          <div
            className="
              mb-7
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <div>
              <h2
                id="local-offers"
                className="
                  text-xl
                  font-bold
                  text-slate-800
                  sm:text-2xl
                "
              >
                🔥 Local Offers &amp; Deals
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current offers from local businesses.
              </p>
            </div>

            <Link
              to="/listings"
              className="
                shrink-0
                text-sm
                font-semibold
                text-purple-600
                transition-colors
                hover:text-purple-800
              "
            >
              Explore →
            </Link>
          </div>

          {offersLoading ? (
            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {[1, 2, 3].map((item) => (
                <LoadingCard key={item} />
              ))}
            </div>
          ) : offersError ? (
            <SectionMessage message="We couldn't load local offers right now." />
          ) : offers.length === 0 ? (
            <SectionMessage message="No active offers are available right now." />
          ) : (
            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {offers.map((offer) => (
                <OfferCard key={offer._id} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
                        HOW IT WORKS
      ====================================================== */}

      <section
        className="
          px-5
          py-14
          text-center
          sm:px-6
          sm:py-16
        "
        aria-labelledby="how-it-works"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="how-it-works"
            className="
              mb-10
              text-xl
              font-bold
              text-slate-800
              sm:mb-12
              sm:text-2xl
            "
          >
            How KonnectG Works
          </h2>

          <div
            className="
              grid
              gap-10
              sm:grid-cols-3
            "
          >
            {STEPS.map((step) => (
              <article key={step.id}>
                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    text-2xl
                  "
                  style={{
                    background: step.bg,
                  }}
                  aria-hidden="true"
                >
                  {step.icon}
                </div>

                <p
                  className="
                    mb-1.5
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-purple-600
                  "
                >
                  {step.label}
                </p>

                <h3
                  className="
                    mb-2
                    text-lg
                    font-bold
                    text-slate-800
                  "
                >
                  {step.title}
                </h3>

                <p
                  className="
                    mx-auto
                    max-w-[260px]
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  {step.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
