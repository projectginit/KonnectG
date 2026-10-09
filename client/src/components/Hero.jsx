import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Search } from "lucide-react";

export default function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/listings?search=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-gradient-to-br
        from-purple-950
        via-purple-800
        to-purple-600
        px-5
        pb-36
        pt-16
        text-center
        text-white
        sm:px-6
        sm:pb-40
        sm:pt-20
        lg:pb-44
        lg:pt-24
      "
    >
      {/* Decorative background elements */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-24
          top-10
          h-64
          w-64
          rounded-full
          bg-purple-400/10
          blur-3xl
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-24
          bottom-0
          h-72
          w-72
          rounded-full
          bg-gold/10
          blur-3xl
        "
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ==================================================
                              STATUS
        ================================================== */}

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-white/10
            px-4
            py-2
            text-xs
            font-semibold
            text-purple-50
            shadow-sm
            backdrop-blur-md
            sm:text-sm
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-emerald-400
              shadow-[0_0_10px_rgba(52,211,153,0.7)]
            "
            aria-hidden="true"
          />

          <MapPin size={14} aria-hidden="true" />

          <span>Serving Siliguri &amp; Surrounding Areas</span>
        </div>

        {/* ==================================================
                              HEADING
        ================================================== */}

        <h1
          className="
            mx-auto
            mt-7
            max-w-4xl
            text-4xl
            font-extrabold
            leading-[1.08]
            tracking-tight
            sm:mt-9
            sm:text-5xl
            lg:text-6xl
            xl:text-7xl
          "
        >
          Discover Trusted Local Businesses Near You
        </h1>

        {/* ==================================================
                            DESCRIPTION
        ================================================== */}

        <p
          className="
            mx-auto
            mt-6
            max-w-2xl
            text-base
            leading-7
            text-purple-100/90
            sm:mt-7
            sm:text-lg
            lg:text-xl
          "
        >
          Find trusted businesses, services, and local places around your
          community.
        </p>

        {/* ==================================================
                              SEARCH
        ================================================== */}

        <form
          onSubmit={handleSearch}
          role="search"
          className="
            mx-auto
            mt-8
            flex
            w-full
            max-w-3xl
            flex-col
            gap-2
            rounded-2xl
            bg-white
            p-2
            shadow-2xl
            shadow-purple-950/40
            sm:mt-10
            sm:flex-row
            sm:items-center
            sm:rounded-full
            sm:p-2
          "
        >
          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-3
              px-3
              sm:pl-5
            "
          >
            <Search
              size={20}
              className="shrink-0 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search businesses, services, categories..."
              aria-label="Search businesses, services, and categories"
              className="
                min-w-0
                flex-1
                border-none
                bg-transparent
                py-3
                text-sm
                text-slate-800
                outline-none
                placeholder:text-slate-400
                sm:py-4
              "
            />
          </div>

          <button
            type="submit"
            disabled={!query.trim()}
            className="
              flex
              min-h-12
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-purple-700
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-purple-600
              hover:shadow-lg
              disabled:cursor-not-allowed
              disabled:opacity-50
              disabled:hover:translate-y-0
              disabled:hover:shadow-none
              sm:rounded-full
              sm:px-8
            "
          >
            Search
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        {/* ==================================================
                          PRIMARY ACTIONS
        ================================================== */}

        <div
          className="
            mt-7
            flex
            flex-col
            items-center
            justify-center
            gap-3
            sm:mt-9
            sm:flex-row
            sm:gap-4
          "
        >
          <Link
            to="/categories"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-gold
              px-8
              py-3.5
              text-sm
              font-bold
              text-purple-950
              shadow-lg
              shadow-purple-950/20
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-xl
              sm:w-auto
            "
          >
            Explore Categories
            <ArrowRight size={17} aria-hidden="true" />
          </Link>

          <Link
            to="/map"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-white/15
              bg-white/10
              px-8
              py-3.5
              text-sm
              font-semibold
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-white/15
              sm:w-auto
            "
          >
            <MapPin size={17} aria-hidden="true" />
            View Nearby Map
          </Link>
        </div>
      </div>
    </section>
  );
}
