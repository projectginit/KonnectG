import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  Store,
  User,
  X,
} from "lucide-react";

import useAuth from "../../context/useAuth";
import favLogo from "../../assets/favlogo.png";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Listings", to: "/listings" },
  { label: "Map", to: "/map" },
];

const LOCATIONS = ["Matigara", "Medical", "Shivamandir"];

const NAVBAR_CLASS = "relative top-0 z-50 w-full px-4 sm:px-6";

const CONTAINER_CLASS =
  "mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-4";

const MENU_ITEM_CLASS =
  "flex items-center gap-3 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10";

export default function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const locationRef = useRef(null);
  const userMenuRef = useRef(null);

  /* ==========================================================
                          USER DATA
  ========================================================== */

  const userName = user?.name?.trim() || "Account";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  const isMerchant = user?.role === "merchant";
  const isAdmin = user?.role === "admin" || user?.role === "owner";

  /* ==========================================================
                    CLOSE MENUS / DROPDOWNS
  ========================================================== */

  const closeMenus = () => {
    setIsLocationOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleNavigation = () => {
    closeMenus();
    setIsMobileMenuOpen(false);
  };

  /* ==========================================================
                      CLICK OUTSIDE
  ========================================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ==========================================================
                          KEYBOARD
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      closeMenus();
      setIsMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ==========================================================
                        RESPONSIVE MENU
  ========================================================== */

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleMediaChange = (event) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  /* ==========================================================
                            LOGOUT
  ========================================================== */

  const handleLogout = () => {
    logout();

    closeMenus();
    setIsMobileMenuOpen(false);

    navigate("/");
  };

  /* ==========================================================
                      LOCATION SELECT
  ========================================================== */

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    closeMenus();
  };

  /* ==========================================================
                          LINK CLASSES
  ========================================================== */

  const getDesktopLinkClass = ({ isActive }) =>
    `
      relative px-3 py-[18px] text-sm font-semibold
      tracking-wide transition-all duration-150 xl:px-4
      ${
        isActive
          ? `
            text-white
            after:absolute
            after:bottom-0
            after:left-3
            after:right-3
            after:h-[3px]
            after:rounded-t-full
            after:bg-gold
            after:content-[""]
          `
          : "text-white/65 hover:text-white"
      }
    `;

  const getMobileLinkClass = ({ isActive }) =>
    `
      rounded-lg px-4 py-3 text-sm font-semibold
      transition-colors
      ${
        isActive
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }
    `;

  return (
    <header
      className={NAVBAR_CLASS}
      style={{
        background: "#7B0040",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
        borderBottom: "1px solid rgba(245,197,24,0.2)",
      }}
    >
      <div className={CONTAINER_CLASS}>
        {/* ====================================================
                            BRAND LOGO
        ==================================================== */}

        <NavLink
          to="/"
          onClick={handleNavigation}
          aria-label="KonnectG home"
          className="flex shrink-0 items-center"
        >
          <img
            src={favLogo}
            alt="KonnectG"
            className="
              h-7
              w-15
              rounded-sm
              object-contain
              transition-transform
              duration-200
              hover:scale-105
            "
          />
        </NavLink>

        {/* ====================================================
                          DESKTOP NAV
        ==================================================== */}

        <nav className="hidden items-center lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={handleNavigation}
              className={getDesktopLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* ====================================================
                      DESKTOP RIGHT SIDE
        ==================================================== */}

        <div className="hidden items-center gap-3 lg:flex">
          {/* LOCATION */}

          <div className="relative shrink-0" ref={locationRef}>
            <button
              type="button"
              onClick={() => setIsLocationOpen((prev) => !prev)}
              aria-expanded={isLocationOpen}
              aria-haspopup="menu"
              className="
                flex items-center gap-1.5 rounded-full
                px-3 py-2 text-sm font-semibold
                text-white transition-all duration-150
                hover:bg-white/10
              "
              style={{
                border: "1.5px solid rgba(245,197,24,0.5)",
                background: "rgba(245,197,24,0.08)",
              }}
            >
              <MapPin size={16} className="text-gold" />

              <span>{selectedLocation}</span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isLocationOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLocationOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-48 overflow-hidden
                  rounded-xl border border-white/10 shadow-xl
                "
                style={{
                  background: "#7B0040",
                }}
                role="menu"
              >
                {LOCATIONS.map((location) => (
                  <button
                    key={location}
                    type="button"
                    role="menuitem"
                    onClick={() => handleLocationSelect(location)}
                    className="
                      block w-full px-4 py-3 text-left
                      text-sm text-white transition-colors
                      hover:bg-white/10
                    "
                  >
                    <span className="mr-2">📍</span>

                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AUTH */}

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className="
                  flex items-center gap-2 rounded-full
                  px-2 py-1.5 text-white transition-colors
                  hover:bg-white/10
                "
              >
                <div
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-full bg-white font-bold
                    text-[#7B0040]
                  "
                >
                  {userInitial}
                </div>

                <div className="hidden text-left xl:block">
                  <p className="max-w-[120px] truncate text-sm font-semibold text-white">
                    {userName}
                  </p>

                  <p className="text-xs capitalize text-white/60">
                    {user?.role}
                  </p>
                </div>

                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    isUserMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isUserMenuOpen && (
                <div
                  className="
                    absolute right-0 mt-2 w-64 overflow-hidden
                    rounded-xl border border-white/10 shadow-xl
                  "
                  style={{
                    background: "#7B0040",
                  }}
                  role="menu"
                >
                  {/* USER INFORMATION */}

                  <div className="border-b border-white/10 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-full bg-white font-bold
                          text-[#7B0040]
                        "
                      >
                        {userInitial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {user?.name}
                        </p>

                        <p className="truncate text-xs text-white/60">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-white/5 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        Account ID
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-white/80">
                        {user?.id}
                      </p>
                    </div>

                    <div className="mt-2 rounded-lg bg-white/5 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        Role
                      </p>

                      <p className="mt-1 text-xs font-semibold capitalize text-white/80">
                        {user?.role}
                      </p>
                    </div>
                  </div>

                  {/* PROFILE */}

                  <NavLink
                    to="/profile"
                    onClick={handleNavigation}
                    className={MENU_ITEM_CLASS}
                  >
                    <User size={17} />
                    Profile
                  </NavLink>

                  {/* MERCHANT */}

                  {isMerchant && (
                    <NavLink
                      to="/merchant"
                      onClick={handleNavigation}
                      className={MENU_ITEM_CLASS}
                    >
                      <Store size={17} />
                      Merchant Dashboard
                    </NavLink>
                  )}

                  {/* ADMIN */}

                  {isAdmin && (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={handleNavigation}
                      className={MENU_ITEM_CLASS}
                    >
                      <ShieldCheck size={17} />
                      Admin Dashboard
                    </NavLink>
                  )}

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`
                      ${MENU_ITEM_CLASS}
                      w-full
                      border-t
                      border-white/10
                      text-left
                    `}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={handleNavigation}
                className="
                  rounded-lg px-4 py-2 text-sm
                  font-semibold text-white
                  transition-colors hover:bg-white/10
                "
              >
                Login
              </NavLink>

              <NavLink
                to="/signup"
                onClick={handleNavigation}
                className="
                  rounded-lg bg-white px-4 py-2 text-sm
                  font-bold text-[#7B0040]
                  transition-all hover:bg-gray-100
                  hover:shadow-md
                "
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>

        {/* ====================================================
                        MOBILE BUTTON
        ==================================================== */}

        <button
          type="button"
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-lg text-white transition-colors
            hover:bg-white/10 lg:hidden
          "
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ======================================================
                          MOBILE MENU
      ====================================================== */}

      {isMobileMenuOpen && (
        <div
          className="
            border-t border-white/10 pb-5 pt-3 lg:hidden
          "
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* NAV LINKS */}

            <nav className="flex flex-col">
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={handleNavigation}
                  className={getMobileLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* LOCATION */}

            <div
              className="
                mt-3 border-t border-white/10 pt-3
              "
            >
              <p
                className="
                  mb-2 px-4 text-xs font-semibold
                  uppercase tracking-wider text-white/50
                "
              >
                Location
              </p>

              <div className="grid grid-cols-1 gap-1">
                {LOCATIONS.map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="
                      flex items-center gap-2 rounded-lg
                      px-4 py-3 text-left text-sm
                      text-white/80 transition-colors
                      hover:bg-white/10 hover:text-white
                    "
                  >
                    <MapPin size={16} className="text-gold" />

                    {location}
                  </button>
                ))}
              </div>
            </div>

            {/* ACCOUNT */}

            <div
              className="
                mt-4 border-t border-white/10 pt-4
              "
            >
              {isAuthenticated ? (
                <>
                  {/* USER INFO */}

                  <div className="mb-3 rounded-xl bg-white/5 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-full bg-white font-bold
                          text-[#7B0040]
                        "
                      >
                        {userInitial}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {user?.name}
                        </p>

                        <p className="truncate text-xs text-white/60">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        Account ID
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-white/80">
                        {user?.id}
                      </p>
                    </div>

                    <div className="mt-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">
                        Role
                      </p>

                      <p className="mt-1 text-xs font-semibold capitalize text-white/80">
                        {user?.role}
                      </p>
                    </div>
                  </div>

                  {/* PROFILE */}

                  <NavLink
                    to="/profile"
                    onClick={handleNavigation}
                    className="
                      mb-2 flex items-center
                      justify-center gap-2 rounded-lg
                      border border-white/20 px-4 py-3
                      text-sm font-semibold text-white
                      transition-colors hover:bg-white/10
                    "
                  >
                    <User size={16} />
                    Profile
                  </NavLink>

                  {/* MERCHANT */}

                  {isMerchant && (
                    <NavLink
                      to="/merchant"
                      onClick={handleNavigation}
                      className="
                        mb-2 flex items-center
                        justify-center gap-2 rounded-lg
                        border border-white/20 px-4 py-3
                        text-sm font-semibold text-white
                        transition-colors hover:bg-white/10
                      "
                    >
                      <Store size={16} />
                      Merchant Dashboard
                    </NavLink>
                  )}

                  {/* ADMIN */}

                  {isAdmin && (
                    <NavLink
                      to="/admin/dashboard"
                      onClick={handleNavigation}
                      className="
                        mb-2 flex items-center
                        justify-center gap-2 rounded-lg
                        border border-white/20 px-4 py-3
                        text-sm font-semibold text-white
                        transition-colors hover:bg-white/10
                      "
                    >
                      <ShieldCheck size={16} />
                      Admin Dashboard
                    </NavLink>
                  )}

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      flex w-full items-center
                      justify-center gap-2 rounded-lg
                      bg-white px-4 py-3 text-sm
                      font-bold text-[#7B0040]
                      transition-all hover:bg-gray-100
                    "
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <NavLink
                    to="/login"
                    onClick={handleNavigation}
                    className="
                      flex items-center justify-center
                      rounded-lg border border-white/20
                      px-4 py-3 text-sm font-semibold
                      text-white transition-colors
                      hover:bg-white/10
                    "
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/signup"
                    onClick={handleNavigation}
                    className="
                      flex items-center justify-center
                      rounded-lg bg-white px-4 py-3
                      text-sm font-bold text-[#7B0040]
                      transition-all hover:bg-gray-100
                    "
                  >
                    Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
