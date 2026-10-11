import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import apiRequest from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("konnectg_token");

        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        const response = await apiRequest("/users/me");

        if (!mounted) {
          return;
        }

        setUser(response?.user || null);
      } catch (err) {
        console.error("Load profile error:", err);

        if (!mounted) {
          return;
        }

        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem("konnectg_token");
          navigate("/login", { replace: true });
          return;
        }

        setError(err?.message || "Unable to load your profile.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const getInitial = () => {
    if (!user?.name) {
      return "?";
    }

    return user.name.trim().charAt(0).toUpperCase();
  };

  const formatJoinedDate = (date) => {
    if (!date) {
      return "Member";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Member";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-700" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading your profile...
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="text-3xl">⚠️</div>

            <h1 className="mt-3 text-xl font-bold text-slate-800">
              Unable to load profile
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
            >
              Try Again
            </button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F6FA]">
        <Navbar />

        <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-[#EFEDF5] bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-800">
              Profile unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              We couldn&apos;t find your account information.
            </p>

            <Link
              to="/login"
              className="mt-5 inline-flex rounded-full bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800"
            >
              Go to Login
            </Link>
          </div>
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

              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={`${user.name || "User"} profile`}
                  className="
                    h-16
                    w-16
                    shrink-0
                    rounded-full
                    object-cover
                    shadow-lg
                    sm:h-20
                    sm:w-20
                  "
                />
              ) : (
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
                  {getInitial()}
                </div>
              )}

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
                  {user.name}
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-purple-100
                  "
                >
                  {user.email}
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-purple-200
                  "
                >
                  Member since {formatJoinedDate(user.createdAt)}
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
                  0
                </span>
              </div>

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
                <div className="text-3xl">🔖</div>

                <p
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  No saved businesses yet
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
                  Save your favorite local businesses and they&apos;ll appear
                  here.
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
                {/* Name */}

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
                    {user.name || "Not provided"}
                  </p>
                </div>

                {/* Email */}

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
                    {user.email || "Not provided"}
                  </p>
                </div>

                {/* Phone */}

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
                    {user.phone || "Not provided"}
                  </p>
                </div>

                {/* Role */}

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
                    Account Type
                  </p>

                  <p
                    className="
                      mt-1
                      capitalize
                      text-sm
                      text-slate-700
                    "
                  >
                    {user.role || "User"}
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
