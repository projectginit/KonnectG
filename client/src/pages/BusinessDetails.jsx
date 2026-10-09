import { Link, useParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/* ==========================================================
                    TEMPORARY BUSINESS DATA
========================================================== */
/*
  This is mock data for now.

  Later this page will fetch:

  GET /api/businesses/:businessId

  The MongoDB Business document will replace this object.
*/

const BUSINESSES = {
  1: {
    id: "1",

    name: "Saffron Kitchen",

    type: "North Indian",

    category: "Restaurants & Food",

    description:
      "A local North Indian restaurant serving fresh, homestyle meals and popular regional dishes for families and everyday dining.",

    phone: "+919876543210",

    email: "contact@saffronkitchen.example",

    address: "Matigara Main Road",

    area: "Matigara",

    city: "Siliguri",

    latitude: 26.7117,

    longitude: 88.3225,

    verified: true,

    approvalStatus: "approved",

    rating: 5,

    reviewCount: 94,

    views: 248,

    isFeatured: true,

    images: [
      "linear-gradient(135deg,#FFD5B8,#FFB5A0)",
      "linear-gradient(135deg,#FFE5D0,#FFC5B0)",
      "linear-gradient(135deg,#FFF0E5,#FFD8C8)",
    ],

    offer: {
      title: "20% OFF",
      description: "Get 20% off on selected food items.",
      validUntil: "December 31, 2026",
    },

    reviews: [
      {
        id: "r1",
        name: "Rahul",
        rating: 5,
        text: "Good food and friendly service. The portions were also quite good.",
        date: "2 days ago",
      },
      {
        id: "r2",
        name: "Priya",
        rating: 5,
        text: "One of the better local restaurants around Matigara.",
        date: "1 week ago",
      },
      {
        id: "r3",
        name: "Amit",
        rating: 4,
        text: "Food was good and the location was convenient.",
        date: "2 weeks ago",
      },
    ],
  },
};

/* ==========================================================
                        STAR RATING
========================================================== */

function StarRating({ rating, showNumber = true }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-lg tracking-wide text-amber-500"
        aria-label={`${rating} out of 5 stars`}
      >
        {"★".repeat(rating)}
        {"☆".repeat(5 - rating)}
      </span>

      {showNumber && (
        <span className="text-sm font-semibold text-slate-700">{rating}.0</span>
      )}
    </div>
  );
}

/* ==========================================================
                    BUSINESS DETAILS PAGE
========================================================== */

export default function BusinessDetails() {
  const { businessId } = useParams();

  /*
    Temporary lookup.

    Later this will be replaced with an API request using
    businessId.
  */

  const business = BUSINESSES[businessId];

  /* ========================================================
                        NOT FOUND
  ======================================================== */

  if (!business) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">
        <Navbar />

        <main
          className="
            mx-auto
            flex
            min-h-[60vh]
            max-w-6xl
            flex-col
            items-center
            justify-center
            px-6
            text-center
          "
        >
          <div className="text-5xl">🔍</div>

          <h1
            className="
              mt-5
              text-2xl
              font-extrabold
              text-slate-800
            "
          >
            Business Not Found
          </h1>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              text-slate-500
            "
          >
            We couldn&apos;t find the business you&apos;re looking for. It may have been
            removed or the link may be incorrect.
          </p>

          <Link
            to="/listings"
            className="
              mt-6
              rounded-full
              bg-purple-700
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-purple-600
            "
          >
            ← Back to Listings
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6FA]">
      {/* ==================================================
                            NAVBAR
      ================================================== */}

      <Navbar />

      <main
        className="
          mx-auto
          w-full
          max-w-6xl
          px-5
          py-8
          sm:px-6
          sm:py-10
        "
      >
        {/* ==================================================
                        BACK NAVIGATION
        ================================================== */}

        <Link
          to="/listings"
          className="
            inline-flex
            items-center
            gap-1
            text-sm
            font-semibold
            text-purple-600
            transition
            hover:text-purple-800
            hover:underline
          "
        >
          ← Back to Listings
        </Link>

        {/* ==================================================
                        BUSINESS HEADER
        ================================================== */}

        <section
          className="
            mt-6
            overflow-hidden
            rounded-3xl
            border
            border-[#EFEDF5]
            bg-white
            shadow-sm
          "
        >
          {/* ==================================================
                            IMAGE AREA
          ================================================== */}

          <div
            className="
              grid
              h-64
              grid-cols-1
              gap-2
              sm:h-80
              sm:grid-cols-3
            "
          >
            {business.images.map((image, index) => (
              <div
                key={index}
                className={`
                    ${index === 0 ? "sm:col-span-2" : "hidden sm:block"}
                    h-full
                  `}
                style={{
                  background: image,
                }}
              />
            ))}
          </div>

          {/* ==================================================
                        BUSINESS INFORMATION
          ================================================== */}

          <div className="p-6 sm:p-8">
            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-start
                lg:justify-between
              "
            >
              <div>
                {/* CATEGORY */}

                <p
                  className="
                    text-sm
                    font-semibold
                    text-purple-600
                  "
                >
                  {business.category}
                </p>

                {/* NAME */}

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <h1
                    className="
                      text-3xl
                      font-extrabold
                      tracking-tight
                      text-slate-800
                      sm:text-4xl
                    "
                  >
                    {business.name}
                  </h1>

                  {business.verified && (
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        bg-emerald-50
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-emerald-600
                      "
                    >
                      ✓ Verified
                    </span>
                  )}
                </div>

                {/* TYPE / AREA */}

                <p
                  className="
                    mt-2
                    text-sm
                    text-slate-500
                  "
                >
                  {business.type}
                  {" • "}
                  {business.area}
                </p>

                {/* RATING */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-3
                  "
                >
                  <StarRating rating={business.rating} />

                  <span className="text-sm text-slate-500">
                    {business.reviewCount} reviews
                  </span>
                </div>
              </div>

              {/* ==================================================
                            ACTION BUTTONS
              ================================================== */}

              <div
                className="
                  flex
                  w-full
                  flex-col
                  gap-3
                  sm:flex-row
                  lg:w-auto
                "
              >
                <a
                  href={`tel:${business.phone}`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-emerald-500
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-emerald-600
                  "
                >
                  📞 Call
                </a>

                <a
                  href={`mailto:${business.email}`}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-purple-50
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-purple-700
                    transition
                    hover:bg-purple-100
                  "
                >
                  ✉️ Email
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
                        MAIN CONTENT GRID
        ================================================== */}

        <div
          className="
            mt-6
            grid
            gap-6
            lg:grid-cols-[1fr_360px]
          "
        >
          {/* ==================================================
                            LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">
            {/* ==================================================
                            ABOUT
            ================================================== */}

            <section
              className="
                rounded-2xl
                border
                border-[#EFEDF5]
                bg-white
                p-6
                shadow-sm
                sm:p-7
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-slate-800
                "
              >
                About {business.name}
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-7
                  text-slate-500
                "
              >
                {business.description}
              </p>
            </section>

            {/* ==================================================
                            OFFER
            ================================================== */}

            {business.offer && (
              <section
                className="
                  rounded-2xl
                  border
                  border-yellow-100
                  bg-gradient-to-br
                  from-[#FFF9E8]
                  to-[#FFF3C4]
                  p-6
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div>
                    <span
                      className="
                        inline-block
                        rounded-full
                        bg-yellow-400
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-purple-900
                      "
                    >
                      {business.offer.title}
                    </span>

                    <h2
                      className="
                        mt-3
                        text-xl
                        font-bold
                        text-slate-800
                      "
                    >
                      Current Offer
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-600
                      "
                    >
                      {business.offer.description}
                    </p>
                  </div>

                  <div
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Valid until{" "}
                    <strong className="text-slate-700">
                      {business.offer.validUntil}
                    </strong>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                            REVIEWS
            ================================================== */}

            <section
              className="
                rounded-2xl
                border
                border-[#EFEDF5]
                bg-white
                p-6
                shadow-sm
                sm:p-7
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <h2
                    className="
                      text-xl
                      font-bold
                      text-slate-800
                    "
                  >
                    Reviews
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    What people are saying about this business.
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="
                      text-2xl
                      font-extrabold
                      text-slate-800
                    "
                  >
                    {business.rating}
                  </p>

                  <StarRating rating={business.rating} showNumber={false} />
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {business.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <div
                      className="
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-2
                        "
                    >
                      <div>
                        <h3
                          className="
                              text-sm
                              font-bold
                              text-slate-800
                            "
                        >
                          {review.name}
                        </h3>

                        <div className="mt-1">
                          <StarRating
                            rating={review.rating}
                            showNumber={false}
                          />
                        </div>
                      </div>

                      <span
                        className="
                            text-xs
                            text-slate-400
                          "
                      >
                        {review.date}
                      </span>
                    </div>

                    <p
                      className="
                          mt-3
                          text-sm
                          leading-6
                          text-slate-500
                        "
                    >
                      {review.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* ==================================================
                            RIGHT COLUMN
          ================================================== */}

          <aside className="space-y-6">
            {/* ==================================================
                            CONTACT
            ================================================== */}

            <section
              className="
                rounded-2xl
                border
                border-[#EFEDF5]
                bg-white
                p-6
                shadow-sm
              "
            >
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-800
                "
              >
                Contact & Location
              </h2>

              <div className="mt-5 space-y-5">
                {/* ADDRESS */}

                <div className="flex gap-3">
                  <span className="text-lg">📍</span>

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Address
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      {business.address}
                      <br />
                      {business.area}, {business.city}
                    </p>
                  </div>
                </div>

                {/* PHONE */}

                <div className="flex gap-3">
                  <span className="text-lg">📞</span>

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Phone
                    </p>

                    <a
                      href={`tel:${business.phone}`}
                      className="
                        mt-1
                        block
                        text-sm
                        font-semibold
                        text-purple-600
                        hover:underline
                      "
                    >
                      {business.phone}
                    </a>
                  </div>
                </div>

                {/* EMAIL */}

                <div className="flex gap-3">
                  <span className="text-lg">✉️</span>

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Email
                    </p>

                    <a
                      href={`mailto:${business.email}`}
                      className="
                        mt-1
                        block
                        break-all
                        text-sm
                        font-semibold
                        text-purple-600
                        hover:underline
                      "
                    >
                      {business.email}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                            MAP PLACEHOLDER
            ================================================== */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-[#EFEDF5]
                bg-white
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-56
                  items-center
                  justify-center
                  bg-[#E8EEF5]
                "
              >
                <div className="text-center">
                  <div className="text-4xl">📍</div>

                  <p
                    className="
                      mt-2
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    {business.area}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    {business.latitude}, {business.longitude}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <button
                  type="button"
                  onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`;

                    window.open(url, "_blank", "noopener,noreferrer");
                  }}
                  className="
                    w-full
                    rounded-full
                    bg-purple-50
                    py-2.5
                    text-sm
                    font-semibold
                    text-purple-700
                    transition
                    hover:bg-purple-100
                  "
                >
                  🗺️ Open in Google Maps
                </button>
              </div>
            </section>

            {/* ==================================================
                        BUSINESS STATISTICS
            ================================================== */}

            <section
              className="
                rounded-2xl
                border
                border-[#EFEDF5]
                bg-white
                p-6
                shadow-sm
              "
            >
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-800
                "
              >
                Business Information
              </h2>

              <div className="mt-5 space-y-4">
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <span className="text-sm text-slate-500">Status</span>

                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-3
                      py-1
                      text-xs
                      font-bold
                      text-emerald-600
                    "
                  >
                    {business.approvalStatus}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <span className="text-sm text-slate-500">Profile Views</span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    {business.views}
                  </span>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <span className="text-sm text-slate-500">Featured</span>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
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
