import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";

import apiRequest from "../services/api";

const FALLBACK_GRADIENTS = [
  "from-purple-700 to-purple-500",
  "from-emerald-600 to-teal-400",
  "from-orange-500 to-pink-500",
];

const getBusinessCategory = (business) => {
  return (
    business.categoryRef?.name ||
    business.category?.name ||
    business.category ||
    "Local Business"
  );
};

const getBusinessLocation = (business) => {
  return [business.area, business.city].filter(Boolean).join(", ");
};

const getBusinessRating = (business) => {
  const rating =
    business.averageRating ?? business.rating ?? business.ratings?.average;

  if (rating === undefined || rating === null) {
    return null;
  }

  const numericRating = Number(rating);

  return Number.isFinite(numericRating) ? numericRating.toFixed(1) : null;
};

const getBusinessImage = (business) => {
  if (business.logo) {
    return business.logo;
  }

  if (Array.isArray(business.images) && business.images.length > 0) {
    return business.images[0];
  }

  return null;
};

export default function Marquee() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadBusinesses = async () => {
      try {
        const data = await apiRequest("/businesses?limit=3&page=1");

        const results = data.businesses || data.data || [];

        if (isMounted) {
          setBusinesses(results.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load featured businesses:", error.message);

        if (isMounted) {
          setBusinesses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBusinesses();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section
        aria-label="Featured businesses"
        className="relative z-20 px-5 sm:px-6"
      >
        <div
          className="
            mx-auto
            -mt-12
            grid
            max-w-6xl
            gap-4
            sm:grid-cols-3
            sm:gap-5
            md:-mt-16
          "
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                h-36
                animate-pulse
                rounded-2xl
                bg-slate-200
                shadow-lg
              "
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    );
  }

  if (businesses.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Featured local businesses"
      className="relative z-20 px-5 sm:px-6"
    >
      <div
        className="
          mx-auto
          -mt-12
          grid
          max-w-6xl
          gap-4
          sm:grid-cols-3
          sm:gap-5
          md:-mt-16
        "
      >
        {businesses.map((business, index) => {
          const businessId = business._id || business.id;
          const image = getBusinessImage(business);
          const category = getBusinessCategory(business);
          const location = getBusinessLocation(business);
          const rating = getBusinessRating(business);

          return (
            <Link
              key={businessId}
              to={`/listings/${businessId}`}
              className="
                group
                overflow-hidden
                rounded-2xl
                bg-white
                shadow-xl
                shadow-purple-950/20
                transition-all
                duration-200
                hover:-translate-y-1
                hover:shadow-2xl
                hover:shadow-purple-950/25
              "
            >
              {/* Business image */}
              <div
                className={`
                  relative
                  h-28
                  overflow-hidden
                  bg-gradient-to-br
                  ${FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]}
                `}
              >
                {image ? (
                  <img
                    src={image}
                    alt={business.name || "Business"}
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
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      px-5
                      text-center
                      text-xl
                      font-extrabold
                      text-white
                    "
                  >
                    {business.name || "Local Business"}
                  </div>
                )}

                {/* Category badge */}
                <span
                  className="
                    absolute
                    left-3
                    top-3
                    rounded-full
                    bg-black/30
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-white
                    backdrop-blur-sm
                  "
                >
                  {category}
                </span>
              </div>

              {/* Business information */}
              <div className="p-4">
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

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {location && (
                    <span
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-1
                        truncate
                        text-xs
                        text-slate-500
                      "
                    >
                      <MapPin
                        size={13}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{location}</span>
                    </span>
                  )}

                  {rating && (
                    <span
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                        text-xs
                        font-semibold
                        text-slate-600
                      "
                    >
                      <Star
                        size={13}
                        className="fill-current text-amber-400"
                        aria-hidden="true"
                      />
                      {rating}
                    </span>
                  )}
                </div>

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-1
                    text-xs
                    font-semibold
                    text-[#66023c]
                  "
                >
                  View business
                  <ArrowRight
                    size={13}
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-x-0.5
                    "
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
