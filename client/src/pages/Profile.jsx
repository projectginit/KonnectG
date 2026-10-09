import { Link } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

/* ==========================================================
                    TEMPORARY USER DATA
========================================================== */
/*
  Temporary frontend data.

  Later this will come from:

  GET /api/users/me

  and, after authentication:

  GET /api/users/me/saved
  GET /api/users/me/reviews
*/

const USER = {
  name: "KonnectG User",
  email: "user@example.com",
  phone: "+91 9876543210",
  joined: "June 2026",
};

/* ==========================================================
                    SAVED BUSINESSES
========================================================== */

const SAVED_BUSINESSES = [
  {
    id: "1",
    name: "Saffron Kitchen",
    category: "Restaurants & Food",
    area: "Matigara",
    rating: 4.8,
    verified: true,
  },
  {
    id: "12",
    name: "Ananya Beauty Studio",
    category: "Beauty & Wellness",
    area: "Medical",
    rating: 4.9,
    verified: true,
  },
];

/* ==========================================================
                        USER PROFILE
========================================================== */

export default function Profile() {
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
          py-10
          sm:px-6
          sm:py-12
        "
      >
        {/* ==================================================
                            PAGE HEADER
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            bg-gradient-to-br
            from-purple-900
            via-purple-700
            to-purple-500
            px-6
            py-8
            text-white
            sm:px-8
            sm:py-10
          "
        >
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div
              className="
                flex
                items-center
                gap-4
              "
            >
              {/* ==================================================
                                AVATAR
              ================================================== */}

              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-2xl
                  font-bold
                  text-purple-700
                  shadow-lg
                  sm:h-20
                  sm:w-20
                  sm:text-3xl
                "
              >
                {USER.name.charAt(0)}
              </div>

              {/* ==================================================
                                USER INFO
              ================================================== */}

              <div>
                <h1
                  className="
                    text-2xl
                    font-extrabold
                    sm:text-3xl
                  "
                >
                  {USER.name}
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-purple-100
                  "
                >
                  {USER.email}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-purple-200
                  "
                >
                  Member since {USER.joined}
                </p>
              </div>
            </div>

            {/* ==================================================
                            EDIT PROFILE
            ================================================== */}

            <button
              type="button"
              className="
                rounded-full
                bg-white/10
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-white/20
              "
            >
              Edit Profile
            </button>
          </div>
        </section>

        {/* ==================================================
                        CONTENT GRID
        ================================================== */}

        <div
          className="
            mt-6
            grid
            gap-6
            lg:grid-cols-[1fr_320px]
          "
        >
          {/* ==================================================
                            LEFT COLUMN
          ================================================== */}

          <div className="space-y-6">
            {/* ==================================================
                        SAVED BUSINESSES
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
              <div
                className="
                  flex
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
                    Saved Businesses
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Businesses you&apos;ve saved for later.
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    bg-purple-100
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-purple-700
                  "
                >
                  {SAVED_BUSINESSES.length}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {SAVED_BUSINESSES.map((business) => (
                  <Link
                    key={business.id}
                    to={`/businesses/${business.id}`}
                    className="
                        flex
                        flex-col
                        gap-3
                        rounded-xl
                        border
                        border-[#F0EEF6]
                        p-4
                        transition
                        hover:border-purple-100
                        hover:bg-purple-50/40
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                  >
                    <div>
                      <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                      >
                        <h3
                          className="
                              font-semibold
                              text-slate-800
                            "
                        >
                          {business.name}
                        </h3>

                        {business.verified && (
                          <span
                            className="
                                rounded-full
                                bg-emerald-50
                                px-2
                                py-0.5
                                text-[11px]
                                font-bold
                                text-emerald-600
                              "
                          >
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                          "
                      >
                        {business.category}
                        {" • "}
                        {business.area}
                      </p>
                    </div>

                    <div
                      className="
                          flex
                          items-center
                          gap-1
                          text-sm
                          font-semibold
                          text-amber-500
                        "
                    >
                      ★ {business.rating}
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* ==================================================
                            MY REVIEWS
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
                  text-xl
                  font-bold
                  text-slate-800
                "
              >
                My Reviews
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Reviews you&apos;ve posted on KonnectG.
              </p>

              <div
                className="
                  mt-6
                  rounded-xl
                  border
                  border-dashed
                  border-slate-200
                  px-5
                  py-10
                  text-center
                "
              >
                <div className="text-3xl">⭐</div>

                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  No reviews yet
                </p>

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-sm
                    text-xs
                    leading-5
                    text-slate-500
                  "
                >
                  Visit a local business and share your experience with the
                  community.
                </p>

                <Link
                  to="/listings"
                  className="
                    mt-4
                    inline-flex
                    rounded-full
                    bg-purple-50
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-purple-700
                    transition
                    hover:bg-purple-100
                  "
                >
                  Browse Businesses
                </Link>
              </div>
            </section>
          </div>

          {/* ==================================================
                            RIGHT COLUMN
          ================================================== */}

          <aside className="space-y-6">
            {/* ==================================================
                            ACCOUNT INFO
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
                Account Information
              </h2>

              <div className="mt-5 space-y-5">
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
                    Name
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-700
                    "
                  >
                    {USER.name}
                  </p>
                </div>

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

                  <p
                    className="
                      mt-1
                      break-all
                      text-sm
                      text-slate-700
                    "
                  >
                    {USER.email}
                  </p>
                </div>

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

                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-700
                    "
                  >
                    {USER.phone}
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                            QUICK LINKS
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
                Quick Links
              </h2>

              <div className="mt-4 space-y-2">
                <Link
                  to="/listings"
                  className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-purple-50
                    hover:text-purple-700
                  "
                >
                  🔍 Browse Businesses
                </Link>

                <Link
                  to="/categories"
                  className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-purple-50
                    hover:text-purple-700
                  "
                >
                  📂 Explore Categories
                </Link>

                <Link
                  to="/map"
                  className="
                    block
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:bg-purple-50
                    hover:text-purple-700
                  "
                >
                  📍 Nearby Map
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
