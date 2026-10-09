import { useMemo, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { CATEGORIES } from "../data/categories";

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return CATEGORIES;
    }

    return CATEGORIES.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#FCFBFE]">
      <Navbar />

      <main>
        {/* =====================================================
                            HERO
        ====================================================== */}

        <section className="px-5 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14">
          <div className="mx-auto max-w-6xl">
            <div
              className="
                relative
                overflow-hidden
                rounded-[28px]
                bg-gradient-to-br
                from-[#F3E8FF]
                via-[#FAF5FF]
                to-[#FFF8E7]
                px-6
                py-10
                sm:px-10
                sm:py-14
                lg:px-14
                lg:py-16
              "
            >
              {/* Decorative elements */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  bg-purple-200/30
                  blur-3xl
                "
                aria-hidden="true"
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -left-20
                  h-48
                  w-48
                  rounded-full
                  bg-yellow-200/30
                  blur-3xl
                "
                aria-hidden="true"
              />

              <div className="relative max-w-2xl">
                <p
                  className="
                    text-sm
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-purple-700
                  "
                >
                  Explore KonnectG
                </p>

                <h1
                  className="
                    mt-3
                    text-3xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  Find the right local business for you.
                </h1>

                <p
                  className="
                    mt-4
                    max-w-xl
                    text-sm
                    leading-6
                    text-slate-600
                    sm:text-base
                    sm:leading-7
                  "
                >
                  Browse businesses and services across Siliguri and surrounding
                  areas by category.
                </p>

                {/* Search */}

                <div className="relative mt-7 max-w-xl">
                  <label htmlFor="category-search" className="sr-only">
                    Search categories
                  </label>

                  <Search
                    size={19}
                    strokeWidth={2}
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                    aria-hidden="true"
                  />

                  <input
                    id="category-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search categories..."
                    autoComplete="off"
                    className="
                      w-full
                      rounded-full
                      border
                      border-white/80
                      bg-white
                      py-3.5
                      pl-11
                      pr-12
                      text-sm
                      text-slate-800
                      shadow-sm
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-purple-400
                      focus:ring-4
                      focus:ring-purple-600/10
                    "
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear category search"
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-8
                        w-8
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-full
                        text-slate-400
                        transition
                        hover:bg-slate-100
                        hover:text-slate-700
                        focus-visible:outline-2
                        focus-visible:outline-purple-700
                      "
                    >
                      <X size={17} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
                        CATEGORY SECTION
        ====================================================== */}

        <section
          className="
            px-5
            pb-16
            sm:px-6
            sm:pb-20
          "
          aria-labelledby="categories-heading"
        >
          <div className="mx-auto max-w-6xl">
            {/* Section heading */}

            <div
              className="
                mb-6
                flex
                flex-col
                gap-2
                sm:mb-8
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >
              <div>
                <h2
                  id="categories-heading"
                  className="
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-slate-900
                    sm:text-3xl
                  "
                >
                  All Categories
                </h2>

                <p className="mt-1.5 text-sm text-slate-500">
                  {searchQuery
                    ? `${filteredCategories.length} ${
                        filteredCategories.length === 1
                          ? "category"
                          : "categories"
                      } found`
                    : `${CATEGORIES.length} categories to explore`}
                </p>
              </div>
            </div>

            {/* =================================================
                            CATEGORY GRID
            ================================================== */}

            {filteredCategories.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                  xl:grid-cols-4
                "
              >
                {filteredCategories.map((category) => (
                  <Link
                    key={category.slug}
                    to={`/listings?category=${encodeURIComponent(
                      category.slug,
                    )}`}
                    className="
                      group
                      flex
                      min-h-[180px]
                      flex-col
                      rounded-2xl
                      border
                      border-[#ECE8F2]
                      bg-white
                      p-5
                      shadow-sm
                      transition-all
                      duration-200
                      hover:-translate-y-1
                      hover:border-purple-200
                      hover:shadow-lg
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-purple-700
                    "
                  >
                    {/* Icon */}

                    <div
                      className="
                        flex
                        h-14
                        w-14
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        text-2xl
                        transition-transform
                        duration-200
                        group-hover:scale-105
                      "
                      style={{
                        backgroundColor: category.bg || "#F3E8FF",
                      }}
                      aria-hidden="true"
                    >
                      {category.icon}
                    </div>

                    {/* Content */}

                    <div className="mt-5 flex flex-1 flex-col">
                      <h3
                        className="
                          text-base
                          font-bold
                          leading-snug
                          text-slate-800
                          transition-colors
                          group-hover:text-purple-700
                        "
                      >
                        {category.name}
                      </h3>

                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-sm
                          leading-5
                          text-slate-500
                        "
                      >
                        Explore local businesses and services in this category.
                      </p>

                      {/* Bottom link */}

                      <div
                        className="
                          mt-auto
                          flex
                          items-center
                          gap-1.5
                          pt-5
                          text-sm
                          font-semibold
                          text-purple-700
                        "
                      >
                        <span>Explore</span>

                        <ArrowRight
                          size={16}
                          className="
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                          "
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* =================================================
                            EMPTY SEARCH STATE
              ================================================== */

              <div
                className="
                  rounded-2xl
                  border
                  border-dashed
                  border-slate-200
                  bg-white
                  px-6
                  py-14
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-purple-50
                    text-purple-600
                  "
                  aria-hidden="true"
                >
                  <Search size={23} />
                </div>

                <h3
                  className="
                    mt-4
                    text-lg
                    font-bold
                    text-slate-800
                  "
                >
                  No categories found
                </h3>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-md
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  We couldn&apos;t find a category matching &#34;
                  <span className="font-medium text-slate-700">
                    {searchQuery}
                  </span>
                  &#34;. Try a different search term.
                </p>

                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="
                    mt-5
                    rounded-full
                    bg-purple-700
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-purple-600
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-purple-700
                  "
                >
                  Show all categories
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
                            CTA
        ====================================================== */}

        <section className="px-5 pb-16 sm:px-6 sm:pb-20">
          <div
            className="
              mx-auto
              max-w-6xl
              rounded-[28px]
              bg-slate-900
              px-6
              py-10
              text-center
              sm:px-10
              sm:py-12
            "
          >
            <h2
              className="
                text-2xl
                font-extrabold
                tracking-tight
                text-white
                sm:text-3xl
              "
            >
              Can&apos;t find what you&apos;re looking for?
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-lg
                text-sm
                leading-6
                text-slate-300
                sm:text-base
              "
            >
              Search all local businesses on KonnectG or help us bring another
              great local business to the platform.
            </p>

            <div
              className="
                mt-6
                flex
                flex-col
                items-center
                justify-center
                gap-3
                sm:flex-row
              "
            >
              <Link
                to="/listings"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  bg-purple-600
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-purple-500
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-purple-400
                "
              >
                Browse Businesses
              </Link>

              <Link
                to="/merchant"
                className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  px-6
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-white/10
                  focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-white
                "
              >
                List Your Business
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
