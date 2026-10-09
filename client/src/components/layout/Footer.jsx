import { NavLink } from "react-router-dom";
import favLogoPurple from "../../assets/favlogo-purple.png";

/* ==========================================================
                        FOOTER LINKS
========================================================== */

const EXPLORE_LINKS = [
  { label: "Categories", to: "/categories" },
  { label: "Listings", to: "/listings" },
  { label: "Map", to: "/map" },
  { label: "Profile", to: "/profile" },
  { label: "Merchant", to: "/merchant" },
];

const AUTH_LINKS = [
  { label: "Login", to: "/login" },
  { label: "Sign Up", to: "/signup" },
];

const LINK_CLASS =
  "text-sm font-medium text-slate-500 transition-colors hover:text-[#66023c]";

const NAV_CLASS =
  "flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start";

/* ==========================================================
                            FOOTER
========================================================== */

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* ==================================================
                              BRAND
          ================================================== */}

          <div className="text-center sm:text-left">
            <NavLink
              to="/"
              aria-label="KonnectG home"
              className="inline-flex items-center justify-center sm:justify-start"
            >
              <img
                src={favLogoPurple}
                alt="KonnectG"
                className="
                  h-7
                  w-17
                  rounded-sm
                  object-contain
                  transition-transform
                  duration-200
                  hover:scale-105
                "
              />
            </NavLink>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 sm:mx-0">
              Connecting Siliguri&apos;s local community, one business at a
              time.
            </p>
          </div>

          {/* ==================================================
                              EXPLORE
          ================================================== */}

          <div className="text-center sm:text-left">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Explore</h3>

            <nav className={NAV_CLASS} aria-label="Explore">
              {EXPLORE_LINKS.map(({ label, to }) => (
                <NavLink key={to} to={to} className={LINK_CLASS}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ==================================================
                              ACCOUNT
          ================================================== */}

          <div className="text-center sm:text-left">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Account</h3>

            <nav className={NAV_CLASS} aria-label="Account">
              {AUTH_LINKS.map(({ label, to }) => (
                <NavLink key={to} to={to} className={LINK_CLASS}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* ==================================================
                            COPYRIGHT
        ================================================== */}

        <div className="mt-8 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} KonnectG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
